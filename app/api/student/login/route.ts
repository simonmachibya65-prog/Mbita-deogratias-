import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/utils/auth";
import { sessionOptions, SessionData } from "@/lib/session";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const { email, password } = result.data;

    // Find student
    const student = await prisma.student.findUnique({
      where: { email },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        email: true,
        passwordHash: true,
        status: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if student is active
    if (student.status !== "active") {
      return NextResponse.json(
        { error: "Account is not active. Please contact support." },
        { status: 403 }
      );
    }

    // Verify password
    const passwordMatch = await verifyPassword(password, student.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create session
    const response = NextResponse.json({
      message: "Login successful",
      student: {
        id: student.id,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
      },
    });

    const session = await getIronSession<SessionData>(request, response, sessionOptions);
    session.studentId = student.id;
    session.role = "student";
    session.createdAt = Date.now();
    await session.save();

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
