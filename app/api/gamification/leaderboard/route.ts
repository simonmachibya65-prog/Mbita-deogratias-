import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all"; // all, week, month
    const limit = parseInt(searchParams.get("limit") || "10");

    let dateFilter: Date | undefined;
    if (period === "week") {
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "month") {
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get student points
    const studentPoints = await prisma.studentPoint.groupBy({
      by: ['studentId'],
      where: dateFilter ? { awardedAt: { gte: dateFilter } } : undefined,
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: limit,
    });

    // Get student details
    const leaderboard = await Promise.all(
      studentPoints.map(async (sp) => {
        const student = await prisma.student.findUnique({
          where: { id: sp.studentId },
          select: {
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        });

        const badgesCount = await prisma.studentBadge.count({
          where: { studentId: sp.studentId },
        });

        const level = Math.floor((sp._sum.points || 0) / 100) + 1;

        return {
          studentId: sp.studentId,
          name: `${student?.firstName} ${student?.lastName}`,
          profilePicture: student?.profilePicture,
          points: sp._sum.points || 0,
          level,
          badgesCount,
        };
      })
    );

    return NextResponse.json({ leaderboard });

  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to load leaderboard" },
      { status: 500 }
    );
  }
}
