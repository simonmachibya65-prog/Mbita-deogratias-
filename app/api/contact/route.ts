import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/schemas/contact";
import nodemailer from "nodemailer";

// In-memory rate limiting: IP -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true; // allowed
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false; // rate limited
  }

  entry.count += 1;
  return true; // allowed
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
      },
      { status: 429 }
    );
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body.", code: "INVALID_JSON" },
      { status: 400 }
    );
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (field) fields[field] = issue.message;
    }
    return NextResponse.json(
      {
        error: "Validation failed. Please check the highlighted fields.",
        code: "VALIDATION_ERROR",
        fields,
      },
      { status: 400 }
    );
  }

  const { name, email, message } = result.data;

  // Save contact message to database (always, regardless of email delivery)
  try {
    await prisma.contactMessage.create({
      data: { name, email, message },
    });
  } catch {
    // DB save failure is non-fatal for the user experience; log and continue
    console.error("Failed to save contact message to database");
  }

  // Send email via nodemailer
  const professorEmail = process.env.PROFESSOR_EMAIL;
  if (!professorEmail) {
    return NextResponse.json(
      {
        error: `Message delivery failed. Please try again or email us directly at ${professorEmail ?? "the professor's email"}.`,
        code: "EMAIL_DELIVERY_FAILED",
      },
      { status: 500 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_USER}>`,
      replyTo: email,
      to: professorEmail,
      subject: `Contact form message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <hr />
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    // ── AUTO-REPLY to sender ──
    try {
      const profile = await prisma.profile.findFirst({ select: { fullName: true, title: true, institution: true } });
      await transporter.sendMail({
        from: `"${profile?.fullName ?? "Professor"}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Thank you for your message — ${profile?.fullName ?? "Professor"}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #102a43;">Thank you for reaching out, ${name}!</h2>
            <p>I have received your message and will get back to you as soon as possible, typically within 2-3 business days.</p>
            <blockquote style="border-left: 4px solid #334e68; padding-left: 16px; color: #555; margin: 20px 0;">
              <em>"${message.substring(0, 200)}${message.length > 200 ? "..." : ""}"</em>
            </blockquote>
            <p>Best regards,<br/>
            <strong>${profile?.fullName ?? "Professor"}</strong><br/>
            ${profile?.title ?? ""}<br/>
            ${profile?.institution ?? ""}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
            <p style="font-size: 12px; color: #999;">This is an automated response. Please do not reply to this email.</p>
          </div>
        `,
      });
    } catch {
      // Auto-reply failure is non-fatal
      console.error("Auto-reply failed");
    }
  } catch (err) {
    console.error("Email delivery failed:", err);
    return NextResponse.json(
      {
        error: `Message delivery failed. Please try again or email us directly at ${professorEmail}.`,
        code: "EMAIL_DELIVERY_FAILED",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Your message has been sent successfully." },
    { status: 200 }
  );
}
