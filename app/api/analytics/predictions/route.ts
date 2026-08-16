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

    // Get student's recent performance
    const recentGrades = await prisma.assignmentSubmission.findMany({
      where: {
        studentId,
        status: "graded",
        grade: { not: null },
      },
      select: {
        grade: true,
        assignment: { select: { maxPoints: true } },
        submittedAt: true,
      },
      orderBy: { submittedAt: "desc" },
      take: 10,
    });

    const grades = recentGrades.map(g => ({
      score: g.grade && g.assignment.maxPoints
        ? (g.grade / g.assignment.maxPoints) * 100
        : 0,
      date: g.submittedAt,
    }));

    // Simple trend analysis
    let trend = "stable";
    if (grades.length >= 3) {
      const recent = grades.slice(0, 3).reduce((sum, g) => sum + g.score, 0) / 3;
      const older = grades.slice(3, 6).reduce((sum, g) => sum + g.score, 0) / 3;

      if (recent > older + 5) trend = "improving";
      else if (recent < older - 5) trend = "declining";
    }

    // Predict at-risk status
    const avgScore = grades.length > 0
      ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length
      : 0;

    let riskLevel = "low";
    if (avgScore < 60) riskLevel = "high";
    else if (avgScore < 75) riskLevel = "medium";

    // Get engagement metrics
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const weeklyLogins = await prisma.activityLog.count({
      where: {
        studentId,
        event: "login",
        createdAt: { gte: lastWeek },
      },
    });

    const weeklySubmissions = await prisma.assignmentSubmission.count({
      where: {
        studentId,
        submittedAt: { gte: lastWeek },
      },
    });

    // Generate recommendations
    const recommendations = [];

    if (riskLevel === "high") {
      recommendations.push("Consider reaching out to your instructor for help");
      recommendations.push("Visit the tutoring center for additional support");
    }

    if (trend === "declining") {
      recommendations.push("Review recent course materials");
      recommendations.push("Join a study group");
    }

    if (weeklyLogins < 3) {
      recommendations.push("Increase platform engagement");
    }

    if (avgScore >= 85) {
      recommendations.push("Great job! Consider mentoring other students");
    }

    return NextResponse.json({
      predictions: {
        performanceTrend: trend,
        riskLevel,
        projectedGrade: Math.round(avgScore),
        engagementScore: Math.min((weeklyLogins * 10 + weeklySubmissions * 20), 100),
      },
      recommendations,
      analysis: {
        recentAverageScore: Math.round(avgScore),
        weeklyActivity: {
          logins: weeklyLogins,
          submissions: weeklySubmissions,
        },
      },
    });
  } catch (error) {
    console.error("Predictions error:", error);
    return NextResponse.json({ error: "Failed to generate predictions" }, { status: 500 });
  }
}
