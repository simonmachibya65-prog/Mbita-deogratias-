import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Pool } from "pg";
import { sessionOptions, SessionData } from "@/lib/session";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  totpToken: z.string().optional(), // MFA token (6 digits)
});

// Use native PostgreSQL connection to bypass Prisma engine issues on Vercel
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString: databaseUrl });

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body.", code: "INVALID_JSON" }, { status: 400 });
  }

  const result = loginSchema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (field) fields[field] = issue.message;
    }
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR", fields }, { status: 400 });
  }

  const { username, password, totpToken } = result.data;

  let adminUser: any;
  try {
    // Test database connection first
    await pool.query('SELECT 1');
    
    // Find admin user
    const userResult = await pool.query(
      'SELECT * FROM "AdminUser" WHERE username = $1 LIMIT 1',
      [username]
    );
    adminUser = userResult.rows[0];
    
    // AUTO-CREATE DEFAULT ADMIN if no admin exists
    if (!adminUser && username === 'Mbita' && password === 'mbita@!12345') {
      const hashedPassword = await bcrypt.hash(password, 10);
      const createResult = await pool.query(
        `INSERT INTO "AdminUser" (id, username, "passwordHash", "failedAttempts", "totpEnabled", "updatedAt")
         VALUES (1, $1, $2, 0, false, NOW())
         ON CONFLICT (id) DO NOTHING
         RETURNING *`,
        ['Mbita', hashedPassword]
      );
      adminUser = createResult.rows[0];
      
      if (adminUser) {
        console.log('✅ Default admin account created');
      } else {
        // Try to fetch again in case another request created it
        const retryResult = await pool.query(
          'SELECT * FROM "AdminUser" WHERE username = $1 LIMIT 1',
          [username]
        );
        adminUser = retryResult.rows[0];
      }
    }
    
  } catch (error: any) {
    console.error('Database error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Database connection error.';
    if (error.code === '28P01') {
      errorMessage = 'Authentication failed with database. Check database credentials.';
    } else if (error.code === '3D000') {
      errorMessage = 'Database does not exist. Please check your DATABASE_URL.';
    } else if (error.message) {
      errorMessage = `Database error: ${error.message}`;
    }
    
    return NextResponse.json({ 
      error: errorMessage, 
      code: "DB_ERROR",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }

  if (!adminUser) {
    return NextResponse.json({ error: "Invalid credentials.", code: "INVALID_CREDENTIALS" }, { status: 401 });
  }

  // Check lockout
  if (adminUser.lockedUntil && new Date(adminUser.lockedUntil) > new Date()) {
    const minutesLeft = Math.ceil((new Date(adminUser.lockedUntil).getTime() - Date.now()) / 60000);
    return NextResponse.json({
      error: `Account is temporarily locked. Please try again in ${minutesLeft} minute(s).`,
      code: "ACCOUNT_LOCKED",
    }, { status: 423 });
  }

  // Compare password
  const passwordMatch = await bcrypt.compare(password, adminUser.passwordHash);

  if (!passwordMatch) {
    const newFailedAttempts = adminUser.failedAttempts + 1;
    const shouldLock = newFailedAttempts >= 5;
    const lockedUntil = shouldLock ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
    
    await pool.query(
      `UPDATE "AdminUser" SET "failedAttempts" = $1, "lockedUntil" = $2, "updatedAt" = NOW() WHERE id = $3`,
      [newFailedAttempts, lockedUntil, adminUser.id]
    );
    
    if (shouldLock) {
      return NextResponse.json({ error: "Too many failed attempts. Account locked for 15 minutes.", code: "ACCOUNT_LOCKED" }, { status: 423 });
    }
    return NextResponse.json({ error: "Invalid credentials.", code: "INVALID_CREDENTIALS" }, { status: 401 });
  }

  // ── MFA CHECK ──
  if (adminUser.totpEnabled && adminUser.totpSecret) {
    if (!totpToken) {
      // Password correct but MFA required — tell client to show MFA input
      return NextResponse.json({ error: "MFA token required.", code: "MFA_REQUIRED" }, { status: 200 });
    }

    // Verify TOTP token
    const { verify: verifyOtp } = await import("otplib");
    const otpResult = await verifyOtp({ token: totpToken, secret: adminUser.totpSecret });
    if (!otpResult.valid) {
      return NextResponse.json({ error: "Invalid MFA code. Please try again.", code: "INVALID_MFA" }, { status: 401 });
    }
  }

  // On success reset failed attempts and create session
  await pool.query(
    `UPDATE "AdminUser" SET "failedAttempts" = 0, "lockedUntil" = NULL, "updatedAt" = NOW() WHERE id = $1`,
    [adminUser.id]
  );

  // Log successful login
  try {
    await pool.query(
      `INSERT INTO "SecurityLog" (id, event, username, "ipAddress", details, "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())`,
      [
        'login_success',
        adminUser.username,
        request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown",
        'Successful login'
      ]
    );
  } catch { /* non-fatal */ }

  const response = NextResponse.json({ message: "Login successful." }, { status: 200 });
  const session = await getIronSession<SessionData>(request, response, sessionOptions);
  session.username = adminUser.username;
  session.createdAt = Date.now();
  await session.save();

  return response;
}
