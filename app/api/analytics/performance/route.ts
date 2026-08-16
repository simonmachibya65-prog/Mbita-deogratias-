import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const studentId = session.studentId;

    // Get completed courses with grades
    const completedCourses = await prisma.courseEnrollment.findMany({
      where: {
        studentId,
        status: "completed",
        finalGrade: { not: null },
      },
      select: { finalGrade: true },
    });

    const avgGrade = completedCourses.length > 0
      ? completedCourses.reduce((sum, c) => sum + (c.finalGrade || 0), 0) / completedCourses.length
      : 0;

    // Assignment completion rate
    const totalAssignments = await prisma.assignmentSubmission.count({
      where: { studentId },
    });

    const completedAssignments = await prisma.assignmentSubmission.count({
      where: { studentId, status: "graded" },
    });

    const completionRate = totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0;

    // Video completion
    const videosWatched = await prisma.videoWatchProgress.count({
      where: { studentId, completed: true },
    });

    // Points earned
    const pointsTotal = await prisma.studentPoint.aggregate({
      where: { studentId },
      _sum: { points: true },
    });

    // Get performance trend (last 6 submissions)
    const recentGrades = await prisma.assignmentSubmission.findMany({
      where: {
        studentId,
        status: "graded",
        grade: { not: null },
      },
      select: { grade: true, assignment: { select: { maxPoints: true } } },
      orderBy: { submittedAt: "desc" },
      take: 6,
    });

    const trend = recentGrades.map(g => ({
      score: g.grade ? Math.round((g.grade / (g.assignment.maxPoints || 100)) * 100) : 0,
    }));

    return NextResponse.json({
      averageGrade: Math.round(avgGrade),
      completionRate,
      videosCompleted: videosWatched,
      totalPoints: pointsTotal._sum.points || 0,
      performanceTrend: trend,
    });
  } catch (error) {
    console.error("Performance analytics error:", error);
    return NextResponse.json({ error: "Failed to load performance data" }, { status: 500 });
  }
}
