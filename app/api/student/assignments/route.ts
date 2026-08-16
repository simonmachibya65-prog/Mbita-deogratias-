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
    const status = searchParams.get("status"); // pending, submitted, graded
    const courseId = searchParams.get("courseId");

    // Get enrolled courses
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        studentId: session.studentId,
        status: "active",
        ...(courseId && { courseId }),
      },
      select: { courseId: true },
    });

    const courseIds = enrollments.map(e => e.courseId);

    // Get assignments
    const assignments = await prisma.assignment.findMany({
      where: {
        courseId: { in: courseIds },
      },
      include: {
        course: {
          select: {
            name: true,
            code: true,
          },
        },
        submissions: {
          where: { studentId: session.studentId },
          select: {
            id: true,
            status: true,
            grade: true,
            submittedAt: true,
            feedback: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    // Filter by submission status if requested
    let filteredAssignments = assignments;
    if (status) {
      filteredAssignments = assignments.filter(a => {
        const submission = a.submissions[0];
        if (status === "pending") return !submission || submission.status === "pending";
        if (status === "submitted") return submission && submission.status === "submitted";
        if (status === "graded") return submission && submission.status === "graded";
        return true;
      });
    }

    return NextResponse.json({
      assignments: filteredAssignments.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        dueDate: a.dueDate,
        maxPoints: a.maxPoints,
        courseId: a.courseId,
        courseName: a.course.name,
        courseCode: a.course.code,
        submission: a.submissions[0] || null,
        isOverdue: a.dueDate < new Date() && !a.submissions[0],
      })),
    });

  } catch (error) {
    console.error("Assignments error:", error);
    return NextResponse.json(
      { error: "Failed to load assignments" },
      { status: 500 }
    );
  }
}
