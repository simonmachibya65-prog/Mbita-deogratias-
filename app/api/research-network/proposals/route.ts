import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { z } from "zod";

const proposalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  researchArea: z.string(),
  lookingFor: z.array(z.string()),
  timeline: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const researchArea = searchParams.get("researchArea");

    const where: any = {};
    if (status) where.status = status;
    if (researchArea) where.researchArea = researchArea;

    const proposals = await prisma.collaborationProposal.findMany({
      where,
      include: {
        creator: {
          select: {
            name: true,
            institution: true,
            expertise: true,
          },
        },
        _count: {
          select: { responses: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ proposals });
  } catch (error) {
    console.error("Proposals fetch error:", error);
    return NextResponse.json({ error: "Failed to load proposals" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const result = proposalSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Get or create researcher profile for student
    let researcher = await prisma.researcher.findFirst({
      where: { studentId: session.studentId },
    });

    if (!researcher) {
      const student = await prisma.student.findUnique({
        where: { id: session.studentId },
      });

      researcher = await prisma.researcher.create({
        data: {
          name: `${student?.firstName} ${student?.lastName}`,
          email: student?.email || "",
          studentId: session.studentId,
        },
      });
    }

    const proposal = await prisma.collaborationProposal.create({
      data: {
        ...result.data,
        creatorId: researcher.id,
        status: "open",
      },
    });

    return NextResponse.json({ message: "Proposal created", proposal }, { status: 201 });
  } catch (error) {
    console.error("Proposal creation error:", error);
    return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 });
  }
}
