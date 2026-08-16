import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { researchAreas, minMatchScore = 0.3 } = body;

    // Get user's researcher profile
    const userResearcher = await prisma.researcher.findFirst({
      where: { studentId: session.studentId },
      include: { publications: true },
    });

    if (!userResearcher) {
      return NextResponse.json({ error: "Researcher profile not found" }, { status: 404 });
    }

    // Find matching researchers
    const researchers = await prisma.researcher.findMany({
      where: {
        id: { not: userResearcher.id },
        expertise: researchAreas?.length > 0 ? { hasSome: researchAreas } : undefined,
      },
      include: {
        publications: true,
        _count: {
          select: { collaborations: true },
        },
      },
    });

    // Calculate match scores
    const matches = researchers.map(researcher => {
      let score = 0;
      const reasons: string[] = [];

      // Expertise overlap
      const commonExpertise = (researcher.expertise || []).filter(e =>
        (userResearcher.expertise || []).includes(e)
      );
      if (commonExpertise.length > 0) {
        score += commonExpertise.length * 0.3;
        reasons.push(`${commonExpertise.length} shared expertise areas`);
      }

      // Institution match
      if (researcher.institution === userResearcher.institution) {
        score += 0.2;
        reasons.push("Same institution");
      }

      // Research area match from request
      if (researchAreas?.length > 0) {
        const matchingAreas = (researcher.expertise || []).filter(e => researchAreas.includes(e));
        if (matchingAreas.length > 0) {
          score += matchingAreas.length * 0.25;
          reasons.push(`Matches ${matchingAreas.length} requested areas`);
        }
      }

      // Publication activity
      if (researcher.publications.length > 5) {
        score += 0.15;
        reasons.push("Active researcher");
      }

      return {
        researcher: {
          id: researcher.id,
          name: researcher.name,
          institution: researcher.institution,
          expertise: researcher.expertise,
          bio: researcher.bio,
          profilePicture: researcher.profilePicture,
          publicationsCount: researcher.publications.length,
          collaborationsCount: researcher._count.collaborations,
        },
        matchScore: Math.min(score, 1),
        matchReasons: reasons,
      };
    });

    // Filter and sort by match score
    const filteredMatches = matches
      .filter(m => m.matchScore >= minMatchScore)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);

    return NextResponse.json({ matches: filteredMatches });
  } catch (error) {
    console.error("Matching error:", error);
    return NextResponse.json({ error: "Failed to find matches" }, { status: 500 });
  }
}
