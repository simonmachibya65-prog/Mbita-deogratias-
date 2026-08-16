import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { logAction } from "@/lib/activityLog";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(12, "New password must be at least 12 characters"),
});

async function getSession(request: NextRequest, response: NextResponse) {
  return getIronSession<SessionData>(request, response, sessionOptions);
}

export async function PUT(request: NextRequest) {
  const response = NextResponse.json({});
  const session = await getSession(request, response);

  if (!session.username) {
    return NextResponse.json(
      { error: "Unauthorized.", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body.", code: "INVALID_JSON" },
      { status: 400 }
    );
  }

  const result = changePasswordSchema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (field) fields[field] = issue.message;
    }
    return NextResponse.json(
      { error: "Validation failed.", code: "VALIDATION_ERROR", fields },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = result.data;

  // Fetch admin user
  let adminUser;
  try {
    adminUser = await prisma.adminUser.findUnique({
      where: { username: session.username },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error.", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  if (!adminUser) {
    return NextResponse.json(
      { error: "User not found.", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  // Verify current password
  const passwordMatch = await bcrypt.compare(
    currentPassword,
    adminUser.passwordHash
  );

  if (!passwordMatch) {
    return NextResponse.json(
      { error: "Current password is incorrect.", code: "INVALID_PASSWORD" },
      { status: 401 }
    );
  }

  // Hash new password with bcrypt cost 12
  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  // Update password
  try {
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { passwordHash: newPasswordHash },
    });

    await logAction(
      "UPDATE",
      "account",
      adminUser.id.toString(),
      "Password Changed",
      session.username
    );

    return NextResponse.json(
      { message: "Password changed successfully." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to update password.", code: "DB_ERROR" },
      { status: 500 }
    );
  }
}
