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

    // Get submissions that need reviewing (not created by current user)
    const submissions = await prisma.peerReviewSubmission.findMany({
      where: {
        authorId: { not: session.studentId },
        status: { in: ["pending", "in_progress"] },
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        reviews: {
          where: { reviewerId: session.studentId },
          select: { id: true, status: true },
        },
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter out submissions already reviewed by current user
    const availableSubmissions = submissions.filter(s => s.reviews.length === 0);

    return NextResponse.json({
      submissions: availableSubmissions.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        documentUrl: s.documentUrl,
        reviewType: s.reviewType,
        deadline: s.deadline,
        createdAt: s.createdAt,
        author: s.author,
        reviewCount: s._count.reviews,
      })),
    });
  } catch (error) {
    console.error("Pending reviews error:", error);
    return NextResponse.json({ error: "Failed to load pending reviews" }, { status: 500 });
  }
}
