import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { z } from "zod";

const submitSchema = z.object({
  assignmentId: z.string(),
  content: z.string().min(1, "Content is required"),
  attachmentUrl: z.string().optional(),
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

    const { assignmentId, content, attachmentUrl } = result.data;

    // Check if assignment exists and is not past due
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          include: {
            enrollments: {
              where: { studentId: session.studentId },
            },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Check if student is enrolled
    if (assignment.course.enrollments.length === 0) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
    }

    // Check if already submitted
    const existingSubmission = await prisma.assignmentSubmission.findFirst({
      where: {
        assignmentId,
        studentId: session.studentId,
      },
    });

    if (existingSubmission && existingSubmission.status !== "pending") {
      return NextResponse.json(
        { error: "Assignment already submitted" },
        { status: 400 }
      );
    }

    // Create or update submission
    const submission = existingSubmission
      ? await prisma.assignmentSubmission.update({
          where: { id: existingSubmission.id },
          data: {
            content,
            attachmentUrl,
            submittedAt: new Date(),
            status: "submitted",
          },
        })
      : await prisma.assignmentSubmission.create({
          data: {
            assignmentId,
            studentId: session.studentId,
            content,
            attachmentUrl,
            submittedAt: new Date(),
            status: "submitted",
          },
        });

    // Award participation points
    await prisma.studentPoint.create({
      data: {
        studentId: session.studentId,
        points: 10,
        source: "assignment_submission",
        description: `Submitted assignment: ${assignment.title}`,
      },
    });

    return NextResponse.json({
      message: "Assignment submitted successfully",
      submission,
    });

  } catch (error) {
    console.error("Assignment submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit assignment" },
      { status: 500 }
    );
  }
}
