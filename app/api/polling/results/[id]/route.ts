import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const poll = await prisma.livePoll.findUnique({
      where: { id: params.id },
      include: {
        responses: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // Calculate results
    const totalVotes = poll.responses.length;
    const results = poll.options.map((option, index) => {
      const votes = poll.responses.filter(r => r.selectedOption === index).length;
      const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

      return {
        option,
        votes,
        percentage,
        isCorrect: poll.pollType === "quiz" && poll.correctAnswer === index,
      };
    });

    return NextResponse.json({
      poll: {
        id: poll.id,
        question: poll.question,
        description: poll.description,
        pollType: poll.pollType,
        status: poll.status,
        createdAt: poll.createdAt,
        endTime: poll.endTime,
        creator: poll.creator,
      },
      results,
      totalVotes,
    });
  } catch (error) {
    console.error("Poll results error:", error);
    return NextResponse.json({ error: "Failed to load results" }, { status: 500 });
  }
}
