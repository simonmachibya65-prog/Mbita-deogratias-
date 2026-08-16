import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { z } from "zod";

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  profilePicture: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  website: z.string().url().optional(),
  interests: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { id: session.studentId },
      include: {
        program: {
          select: {
            name: true,
            code: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get additional stats
    const enrolledCourses = await prisma.courseEnrollment.count({
      where: { studentId: session.studentId, status: "active" },
    });

    const completedCourses = await prisma.courseEnrollment.count({
      where: { studentId: session.studentId, status: "completed" },
    });

    const totalPoints = await prisma.studentPoint.aggregate({
      where: { studentId: session.studentId },
      _sum: { points: true },
    });

    const badgesCount = await prisma.studentBadge.count({
      where: { studentId: session.studentId },
    });

    return NextResponse.json({
      profile: student,
      stats: {
        enrolledCourses,
        completedCourses,
        totalPoints: totalPoints._sum.points || 0,
        badgesCount,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const result = profileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updatedStudent = await prisma.student.update({
      where: { id: session.studentId },
      data: result.data,
    });

    return NextResponse.json({
      message: "Profile updated",
      profile: updatedStudent,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
