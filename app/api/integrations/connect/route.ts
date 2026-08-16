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
    const { integrationId, accessToken, refreshToken, expiresAt } = body;

    // Check if already connected
    const existing = await prisma.integration.findFirst({
      where: {
        studentId: session.studentId,
        service: integrationId,
      },
    });

    if (existing) {
      // Update existing connection
      const updated = await prisma.integration.update({
        where: { id: existing.id },
        data: {
          accessToken,
          refreshToken,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          status: "connected",
        },
      });

      return NextResponse.json({
        message: "Integration updated",
        integration: updated,
      });
    }

    // Create new connection
    const integration = await prisma.integration.create({
      data: {
        studentId: session.studentId,
        service: integrationId,
        accessToken,
        refreshToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        status: "connected",
      },
    });

    return NextResponse.json({
      message: "Integration connected",
      integration,
    }, { status: 201 });
  } catch (error) {
    console.error("Integration connect error:", error);
    return NextResponse.json({ error: "Failed to connect integration" }, { status: 500 });
  }
}
