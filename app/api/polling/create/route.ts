import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { z } from "zod";

const pollSchema = z.object({
  question: z.string().min(1, "Question is required"),
  description: z.string().optional(),
  options: z.array(z.string()).min(2, "At least 2 options required"),
  pollType: z.enum(["poll", "quiz"]),
  correctAnswer: z.number().optional(),
  duration: z.number().optional(),
  anonymous: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const result = pollSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Calculate end time if duration provided
    const endTime = data.duration
      ? new Date(Date.now() + data.duration * 1000)
      : null;

    const poll = await prisma.livePoll.create({
      data: {
        question: data.question,
        description: data.description,
        options: data.options,
        pollType: data.pollType,
        correctAnswer: data.correctAnswer,
        creatorId: session.studentId,
        status: "active",
        endTime,
        anonymous: data.anonymous || false,
      },
    });

    return NextResponse.json({
      message: "Poll created",
      poll,
    }, { status: 201 });
  } catch (error) {
    console.error("Poll creation error:", error);
    return NextResponse.json({ error: "Failed to create poll" }, { status: 500 });
  }
}
