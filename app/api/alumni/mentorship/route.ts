import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { z } from "zod";

const mentorshipSchema = z.object({
  mentorId: z.string(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  goals: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const result = mentorshipSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { mentorId, message, goals } = result.data;

    // Check if mentor exists and is alumni
    const mentor = await prisma.student.findUnique({
      where: { id: mentorId },
    });

    if (!mentor || mentor.status !== "graduated") {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    // Check if request already exists
    const existing = await prisma.mentorshipRequest.findFirst({
      where: {
        menteeId: session.studentId,
        mentorId,
        status: { in: ["pending", "accepted"] },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Request already exists" }, { status: 400 });
    }

    const mentorshipRequest = await prisma.mentorshipRequest.create({
      data: {
        menteeId: session.studentId,
        mentorId,
        message,
        goals,
        status: "pending",
      },
    });

    // Notify mentor
    await prisma.studentNotification.create({
      data: {
        studentId: mentorId,
        title: "New Mentorship Request",
        message: `You have a new mentorship request from a student.`,
        type: "mentorship",
      },
    });

    return NextResponse.json({
      message: "Mentorship request sent",
      request: mentorshipRequest,
    });
  } catch (error) {
    console.error("Mentorship request error:", error);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
}
