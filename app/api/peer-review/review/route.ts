import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { z } from "zod";

const reviewSchema = z.object({
  submissionId: z.string(),
  rating: z.number().min(1).max(5),
  feedback: z.string().min(10, "Feedback must be at least 10 characters"),
  strengths: z.string().optional(),
  improvements: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const result = reviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check if submission exists
    const submission = await prisma.peerReviewSubmission.findUnique({
      where: { id: data.submissionId },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Check if user is not the author
    if (submission.authorId === session.studentId) {
      return NextResponse.json({ error: "Cannot review your own submission" }, { status: 400 });
    }

    // Check if already reviewed
    const existingReview = await prisma.peerReview.findFirst({
      where: {
        submissionId: data.submissionId,
        reviewerId: session.studentId,
      },
    });

    if (existingReview) {
      return NextResponse.json({ error: "Already reviewed this submission" }, { status: 400 });
    }

    // Create review
    const review = await prisma.peerReview.create({
      data: {
        submissionId: data.submissionId,
        reviewerId: session.studentId,
        rating: data.rating,
        feedback: data.feedback,
        strengths: data.strengths,
        improvements: data.improvements,
        status: "completed",
      },
    });

    // Award points to reviewer
    await prisma.studentPoint.create({
      data: {
        studentId: session.studentId,
        points: 15,
        source: "peer_review_complete",
        description: `Completed peer review: ${submission.title}`,
      },
    });

    // Update submission status
    const reviewCount = await prisma.peerReview.count({
      where: { submissionId: data.submissionId },
    });

    if (reviewCount >= 3) {
      await prisma.peerReviewSubmission.update({
        where: { id: data.submissionId },
        data: { status: "reviewed" },
      });
    }

    // Notify author
    await prisma.studentNotification.create({
      data: {
        studentId: submission.authorId,
        title: "New Peer Review Received",
        message: `Your submission "${submission.title}" has received a new review.`,
        type: "peer_review",
      },
    });

    return NextResponse.json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
