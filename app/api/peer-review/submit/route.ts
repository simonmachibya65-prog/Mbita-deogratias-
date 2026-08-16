import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { z } from "zod";

const submitSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  documentUrl: z.string().url("Invalid document URL"),
  reviewType: z.enum(["academic", "code", "design", "general"]),
  deadline: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const result = submitSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    const submission = await prisma.peerReviewSubmission.create({
      data: {
        authorId: session.studentId,
        title: data.title,
        description: data.description,
        documentUrl: data.documentUrl,
        reviewType: data.reviewType,
        status: "pending",
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
    });

    // Award points for submitting work for review
    await prisma.studentPoint.create({
      data: {
        studentId: session.studentId,
        points: 5,
        source: "peer_review_submit",
        description: `Submitted work for peer review: ${data.title}`,
      },
    });

    return NextResponse.json({
      message: "Submission created successfully",
      submission,
    }, { status: 201 });
  } catch (error) {
    console.error("Peer review submission error:", error);
    return NextResponse.json({ error: "Failed to submit for review" }, { status: 500 });
  }
}
