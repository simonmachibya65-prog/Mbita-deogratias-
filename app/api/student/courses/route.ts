import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "active";

    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        studentId: session.studentId,
        status: status as any,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            department: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    const coursesWithDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        const totalAssignments = await prisma.assignment.count({
          where: { courseId: enrollment.courseId },
        });

        const completedAssignments = await prisma.assignmentSubmission.count({
          where: {
            studentId: session.studentId,
            assignment: { courseId: enrollment.courseId },
            status: "graded",
          },
        });

        const progress = totalAssignments > 0
          ? Math.round((completedAssignments / totalAssignments) * 100)
          : 0;

        return {
          enrollmentId: enrollment.id,
          enrolledAt: enrollment.enrolledAt,
          finalGrade: enrollment.finalGrade,
          status: enrollment.status,
          course: {
            id: enrollment.course.id,
            name: enrollment.course.name,
            code: enrollment.course.code,
            description: enrollment.course.description,
            credits: enrollment.course.credits,
            semester: enrollment.course.semester,
            year: enrollment.course.year,
            instructor: enrollment.course.instructor,
            department: enrollment.course.department,
          },
          progress,
          totalAssignments,
          completedAssignments,
        };
      })
    );

    return NextResponse.json({ courses: coursesWithDetails });

  } catch (error) {
    console.error("Courses error:", error);
    return NextResponse.json(
      { error: "Failed to load courses" },
      { status: 500 }
    );
  }
}
