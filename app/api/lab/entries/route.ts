import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { z } from "zod";

const entrySchema = z.object({
  experimentId: z.string(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  observations: z.string().optional(),
  results: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const result = entrySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Verify experiment ownership
    const experiment = await prisma.labExperiment.findFirst({
      where: {
        id: data.experimentId,
        studentId: session.studentId,
      },
    });

    if (!experiment) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
    }

    const entry = await prisma.labEntry.create({
      data: {
        experimentId: data.experimentId,
        title: data.title,
        content: data.content,
        observations: data.observations,
        results: data.results,
        attachments: data.attachments || [],
      },
    });

    // Award points for lab entry
    await prisma.studentPoint.create({
      data: {
        studentId: session.studentId,
        points: 3,
        source: "lab_entry",
        description: `Added lab entry: ${data.title}`,
      },
    });

    return NextResponse.json({
      message: "Entry created",
      entry,
    }, { status: 201 });
  } catch (error) {
    console.error("Lab entry error:", error);
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
}
