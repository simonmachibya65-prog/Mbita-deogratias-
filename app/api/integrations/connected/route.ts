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

    const integrations = await prisma.integration.findMany({
      where: { studentId: session.studentId },
      select: {
        id: true,
        service: true,
        status: true,
        connectedAt: true,
        lastSyncAt: true,
      },
    });

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error("Connected integrations error:", error);
    return NextResponse.json({ error: "Failed to load integrations" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get("id");

    if (!integrationId) {
      return NextResponse.json({ error: "Integration ID required" }, { status: 400 });
    }

    // Verify ownership
    const integration = await prisma.integration.findFirst({
      where: {
        id: integrationId,
        studentId: session.studentId,
      },
    });

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    await prisma.integration.delete({
      where: { id: integrationId },
    });

    return NextResponse.json({ message: "Integration disconnected" });
  } catch (error) {
    console.error("Integration disconnect error:", error);
    return NextResponse.json({ error: "Failed to disconnect integration" }, { status: 500 });
  }
}
