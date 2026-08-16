import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: params.id },
      include: {
        playlist: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.video.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ video });

  } catch (error) {
    console.error("Video error:", error);
    return NextResponse.json(
      { error: "Failed to load video" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { progress, completed } = body;

    // Update or create watch progress
    const watchProgress = await prisma.videoWatchProgress.upsert({
      where: {
        studentId_videoId: {
          studentId: session.studentId,
          videoId: params.id,
        },
      },
      update: {
        progress: progress || 0,
        completed: completed || false,
        lastWatched: new Date(),
      },
      create: {
        studentId: session.studentId,
        videoId: params.id,
        progress: progress || 0,
        completed: completed || false,
        lastWatched: new Date(),
      },
    });

    // Award points for completing video
    if (completed) {
      const existingPoints = await prisma.studentPoint.findFirst({
        where: {
          studentId: session.studentId,
          source: "video_completion",
          description: { contains: params.id },
        },
      });

      if (!existingPoints) {
        await prisma.studentPoint.create({
          data: {
            studentId: session.studentId,
            points: 5,
            source: "video_completion",
            description: `Completed video: ${params.id}`,
          },
        });
      }
    }

    return NextResponse.json({
      message: "Progress saved",
      watchProgress,
    });

  } catch (error) {
    console.error("Video progress error:", error);
    return NextResponse.json(
      { error: "Failed to save progress" },
      { status: 500 }
    );
  }
}
