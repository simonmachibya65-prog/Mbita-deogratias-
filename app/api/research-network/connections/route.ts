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

    const researcher = await prisma.researcher.findFirst({
      where: { studentId: session.studentId },
    });

    if (!researcher) {
      return NextResponse.json({ connections: [] });
    }

    const connections = await prisma.researcherConnection.findMany({
      where: {
        OR: [
          { requesterId: researcher.id, status: "accepted" },
          { receiverId: researcher.id, status: "accepted" },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            institution: true,
            expertise: true,
            profilePicture: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            institution: true,
            expertise: true,
            profilePicture: true,
          },
        },
      },
    });

    const formattedConnections = connections.map(conn => ({
      id: conn.id,
      connectedAt: conn.createdAt,
      researcher: conn.requesterId === researcher.id ? conn.receiver : conn.requester,
    }));

    return NextResponse.json({ connections: formattedConnections });
  } catch (error) {
    console.error("Connections error:", error);
    return NextResponse.json({ error: "Failed to load connections" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { researcherId, message } = body;

    const requester = await prisma.researcher.findFirst({
      where: { studentId: session.studentId },
    });

    if (!requester) {
      return NextResponse.json({ error: "Researcher profile not found" }, { status: 404 });
    }

    // Check if connection already exists
    const existing = await prisma.researcherConnection.findFirst({
      where: {
        OR: [
          { requesterId: requester.id, receiverId: researcherId },
          { requesterId: researcherId, receiverId: requester.id },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Connection already exists" }, { status: 400 });
    }

    const connection = await prisma.researcherConnection.create({
      data: {
        requesterId: requester.id,
        receiverId: researcherId,
        message,
        status: "pending",
      },
    });

    return NextResponse.json({ message: "Connection request sent", connection });
  } catch (error) {
    console.error("Connection request error:", error);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
}
