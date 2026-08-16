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

    const applications = await prisma.fundingApplication.findMany({
      where: { applicantId: session.studentId },
      include: {
        opportunity: {
          select: {
            title: true,
            funder: true,
            amount: true,
            deadline: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Applications error:", error);
    return NextResponse.json({ error: "Failed to load applications" }, { status: 500 });
  }
}
