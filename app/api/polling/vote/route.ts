import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { z } from "zod";

const voteSchema = z.object({
  pollId: z.string(),
  selectedOption: z.number().min(0),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const result = voteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { pollId, selectedOption } = result.data;

    // Check if poll exists and is active
    const poll = await prisma.livePoll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    if (poll.status !== "active") {
      return NextResponse.json({ error: "Poll is not active" }, { status: 400 });
    }

    if (poll.endTime && poll.endTime < new Date()) {
      return NextResponse.json({ error: "Poll has ended" }, { status: 400 });
    }

    // Validate option index
    if (selectedOption >= poll.options.length) {
      return NextResponse.json({ error: "Invalid option" }, { status: 400 });
    }

    // Check if already voted
    const existingVote = await prisma.pollResponse.findFirst({
      where: {
        pollId,
        studentId: session.studentId,
      },
    });

    if (existingVote) {
      return NextResponse.json({ error: "Already voted" }, { status: 400 });
    }

    // Create response
    const response = await prisma.pollResponse.create({
      data: {
        pollId,
        studentId: session.studentId,
        selectedOption,
      },
    });

    // Award points
    let points = 2; // Base points for participation
    if (poll.pollType === "quiz" && poll.correctAnswer !== null) {
      if (selectedOption === poll.correctAnswer) {
        points = 10; // Correct answer bonus
      }
    }

    await prisma.studentPoint.create({
      data: {
        studentId: session.studentId,
        points,
        source: poll.pollType === "quiz" ? "quiz_participation" : "poll_participation",
        description: `Participated in ${poll.pollType}: ${poll.question}`,
      },
    });

    // Check if it was correct (for quiz)
    const isCorrect = poll.pollType === "quiz" && poll.correctAnswer !== null
      ? selectedOption === poll.correctAnswer
      : null;

    return NextResponse.json({
      message: "Vote recorded",
      response,
      isCorrect,
      points,
    });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
  }
}
