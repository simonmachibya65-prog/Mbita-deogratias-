import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateStudentId } from "@/lib/utils/auth";
import { z } from "zod";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  programId: z.string().optional(),
  enrollmentYear: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (field) fields[field] = issue.message;
      }
      return NextResponse.json(
        { error: "Validation failed", fields },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check if email already exists
    const existingStudent = await prisma.student.findUnique({
      where: { email: data.email },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: "Email already registered", fields: { email: "This email is already in use" } },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Generate student ID
    const studentId = generateStudentId();

    // Create student
    const student = await prisma.student.create({
      data: {
        studentId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        phone: data.phone,
        programId: data.programId,
        enrollmentYear: data.enrollmentYear,
        status: "active",
      },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "Registration successful",
      student,
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
