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

    // Get user's submissions with reviews
    const submissions = await prisma.peerReviewSubmission.findMany({
      where: { authorId: session.studentId },
      include: {
        reviews: {
          include: {
            reviewer: {
              select: {
                firstName: true,
                lastName: true,
                profilePicture: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Received reviews error:", error);
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
  }
}
