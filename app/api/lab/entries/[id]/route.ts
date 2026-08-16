import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const entry = await prisma.labEntry.findUnique({
      where: { id: params.id },
      include: {
        experiment: {
          select: {
            id: true,
            title: true,
            studentId: true,
          },
        },
      },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Verify ownership
    if (entry.experiment.studentId !== session.studentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Lab entry fetch error:", error);
    return NextResponse.json({ error: "Failed to load entry" }, { status: 500 });
  }
}
