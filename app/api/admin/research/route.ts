import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/activityLog";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

const researchSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["active", "completed"]),
  startYear: z.number().int().min(1900).max(2100),
  endYear: z.number().int().min(1900).max(2100).nullable().optional(),
  fundingSources: z.array(z.string()).nullable().optional(),
  collaborators: z.array(z.string()).nullable().optional(),
  externalUrl: z.string().nullable().optional().or(z.literal("")),
  imageUrl: z.string().nullable().optional().or(z.literal("")),
  githubUrl: z.string().nullable().optional().or(z.literal("")),
  tags: z.array(z.string()).nullable().optional(),
  teamMembers: z.array(z.unknown()).nullable().optional(),
  documents: z.array(z.unknown()).nullable().optional(),
  milestones: z.array(z.unknown()).nullable().optional(),
  published: z.boolean().nullable().optional(),
});

async function getUsername(request: NextRequest): Promise<string> {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(request, res, sessionOptions);
  return session.username ?? "admin";
}

export async function GET() {
  try {
    const projects = await prisma.researchProject.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch research projects.", code: "DB_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const performedBy = await getUsername(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON.", code: "INVALID_JSON" }, { status: 400 });
  }

  const result = researchSchema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (field) fields[field] = issue.message;
    }
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR", fields }, { status: 400 });
  }

  try {
    const { published, teamMembers, documents, milestones, tags, fundingSources, collaborators, ...createRest } = result.data;
    const project = await prisma.researchProject.create({
      data: {
        ...createRest,
        fundingSources: fundingSources ?? [],
        collaborators: collaborators ?? [],
        published: published ?? true,
        ...(teamMembers !== undefined && teamMembers !== null ? { teamMembers: teamMembers as unknown as import("@prisma/client").Prisma.InputJsonValue } : {}),
        ...(documents !== undefined && documents !== null ? { documents: documents as unknown as import("@prisma/client").Prisma.InputJsonValue } : {}),
        ...(milestones !== undefined && milestones !== null ? { milestones: milestones as unknown as import("@prisma/client").Prisma.InputJsonValue } : {}),
        ...(tags !== undefined && tags !== null ? { tags } : {}),
      },
    });
    revalidatePath("/research");
    revalidateTag("home");
    await logAction("CREATE", "research", project.id, project.title, performedBy);
    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create project.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const performedBy = await getUsername(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON.", code: "INVALID_JSON" }, { status: 400 });
  }

  const withId = z.object({ id: z.string() }).merge(researchSchema.partial());
  const result = withId.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const { id, published, teamMembers, documents, milestones, tags, fundingSources, collaborators, ...updateRest } = result.data;

  try {
    const project = await prisma.researchProject.update({
      where: { id },
      data: {
        ...updateRest,
        published: published ?? undefined,
        ...(fundingSources !== undefined && fundingSources !== null ? { fundingSources } : {}),
        ...(collaborators !== undefined && collaborators !== null ? { collaborators } : {}),
        ...(teamMembers !== undefined && teamMembers !== null ? { teamMembers: teamMembers as unknown as import("@prisma/client").Prisma.InputJsonValue } : {}),
        ...(documents !== undefined && documents !== null ? { documents: documents as unknown as import("@prisma/client").Prisma.InputJsonValue } : {}),
        ...(milestones !== undefined && milestones !== null ? { milestones: milestones as unknown as import("@prisma/client").Prisma.InputJsonValue } : {}),
        ...(tags !== undefined && tags !== null ? { tags } : {}),
      },
    });
    revalidatePath("/research");
    revalidateTag("home");
    await logAction("UPDATE", "research", project.id, project.title, performedBy);
    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: "Failed to update project.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const performedBy = await getUsername(request);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID is required.", code: "MISSING_ID" }, { status: 400 });
  }

  try {
    const project = await prisma.researchProject.delete({ where: { id } });
    revalidatePath("/research");
    revalidateTag("home");
    await logAction("DELETE", "research", project.id, project.title, performedBy);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete project.", code: "DB_ERROR" }, { status: 500 });
  }
}
