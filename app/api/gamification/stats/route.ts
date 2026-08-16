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

    // Get total points
    const pointRecords = await prisma.studentPoint.findMany({
      where: { studentId: session.studentId },
      select: { points: true },
    });

    const totalPoints = pointRecords.reduce((sum, p) => sum + p.points, 0);

    // Calculate level (100 points per level)
    const level = Math.floor(totalPoints / 100) + 1;
    const pointsToNextLevel = (level * 100) - totalPoints;

    // Get badges count
    const badgesCount = await prisma.studentBadge.count({
      where: { studentId: session.studentId },
    });

    // Get rank
    const allStudentPoints = await prisma.studentPoint.groupBy({
      by: ['studentId'],
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
    });

    const rank = allStudentPoints.findIndex(s => s.studentId === session.studentId) + 1;

    // Get achievements
    const achievements = await prisma.studentBadge.findMany({
      where: { studentId: session.studentId },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: 'desc' },
    });

    return NextResponse.json({
      totalPoints,
      level,
      pointsToNextLevel,
      badgesCount,
      rank,
      achievements: achievements.map(a => ({
        id: a.badge.id,
        name: a.badge.name,
        description: a.badge.description,
        icon: a.badge.icon,
        rarity: a.badge.rarity,
        earnedAt: a.earnedAt,
      })),
    });

  } catch (error) {
    console.error("Gamification stats error:", error);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}
