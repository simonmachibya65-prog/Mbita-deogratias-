import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { z } from "zod";

const experimentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  hypothesis: z.string().optional(),
  methodology: z.string().optional(),
  category: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = { studentId: session.studentId };
    if (status) where.status = status;

    const experiments = await prisma.labExperiment.findMany({
      where,
      include: {
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ experiments });
  } catch (error) {
    console.error("Experiments error:", error);
    return NextResponse.json({ error: "Failed to load experiments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const result = experimentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const experiment = await prisma.labExperiment.create({
      data: {
        ...result.data,
        studentId: session.studentId,
        status: "in_progress",
      },
    });

    return NextResponse.json({
      message: "Experiment created",
      experiment,
    }, { status: 201 });
  } catch (error) {
    console.error("Experiment creation error:", error);
    return NextResponse.json({ error: "Failed to create experiment" }, { status: 500 });
  }
}
