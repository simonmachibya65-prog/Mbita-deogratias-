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

    const studentId = session.studentId;

    // Get enrolled courses count
    const enrolledCoursesCount = await prisma.courseEnrollment.count({
      where: { studentId, status: "active" },
    });

    // Get pending assignments count
    const pendingAssignmentsCount = await prisma.assignmentSubmission.count({
      where: {
        studentId,
        status: "pending",
        assignment: {
          dueDate: { gte: new Date() },
        },
      },
    });

    // Get average grade
    const grades = await prisma.courseEnrollment.findMany({
      where: { studentId, status: "completed", finalGrade: { not: null } },
      select: { finalGrade: true },
    });

    const averageGrade = grades.length > 0
      ? grades.reduce((sum, g) => sum + (g.finalGrade || 0), 0) / grades.length
      : 0;

    // Get gamification points
    const studentPoints = await prisma.studentPoint.findMany({
      where: { studentId },
      select: { points: true },
    });

    const totalPoints = studentPoints.reduce((sum, p) => sum + p.points, 0);

    // Get upcoming assignments (next 7 days)
    const upcomingAssignments = await prisma.assignment.findMany({
      where: {
        course: {
          enrollments: {
            some: { studentId, status: "active" },
          },
        },
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        course: {
          select: {
            name: true,
            code: true,
          },
        },
        submissions: {
          where: { studentId },
          select: { status: true },
        },
      },
      orderBy: { dueDate: "asc" },
      take: 5,
    });

    // Get enrolled courses
    const enrolledCourses = await prisma.courseEnrollment.findMany({
      where: { studentId, status: "active" },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            credits: true,
            instructor: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      take: 6,
    });

    // Calculate course progress
    const coursesWithProgress = await Promise.all(
      enrolledCourses.map(async (enrollment) => {
        const totalAssignments = await prisma.assignment.count({
          where: { courseId: enrollment.courseId },
        });

        const completedAssignments = await prisma.assignmentSubmission.count({
          where: {
            studentId,
            assignment: { courseId: enrollment.courseId },
            status: "graded",
          },
        });

        const progress = totalAssignments > 0
          ? Math.round((completedAssignments / totalAssignments) * 100)
          : 0;

        return {
          ...enrollment.course,
          enrollmentId: enrollment.id,
          progress,
        };
      })
    );

    // Get recent notifications
    const notifications = await prisma.studentNotification.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      stats: {
        enrolledCourses: enrolledCoursesCount,
        pendingAssignments: pendingAssignmentsCount,
        averageGrade: Math.round(averageGrade),
        totalPoints,
      },
      upcomingAssignments: upcomingAssignments.map(a => ({
        id: a.id,
        title: a.title,
        courseName: a.course.name,
        courseCode: a.course.code,
        dueDate: a.dueDate,
        status: a.submissions[0]?.status || "not_started",
      })),
      enrolledCourses: coursesWithProgress,
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.read,
        createdAt: n.createdAt,
      })),
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
