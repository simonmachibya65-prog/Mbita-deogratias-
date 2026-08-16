import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/activityLog";
import { validateResourceDescription } from "@/lib/resources";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

const collaboratorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  institution: z.string().min(1, "Institution is required"),
  area: z.string().min(1, "Area is required"),
  profileUrl: z.string().nullable().optional().or(z.literal("")),
  logoUrl: z.string().nullable().optional().or(z.literal("")),
  type: z.enum(["individual", "institution"]),
  published: z.boolean().nullable().optional(),
});

const resourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required").max(150, "Description must be 150 characters or less"),
  url: z.string().url("Valid URL is required"),
  category: z.string().optional(),
  published: z.boolean().optional(),
});

async function getUsername(request: NextRequest): Promise<string> {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(request, res, sessionOptions);
  return session.username ?? "admin";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    if (type === "resources") {
      const resources = await prisma.resource.findMany({ orderBy: { createdAt: "desc" } });
      return NextResponse.json(resources);
    }
    const collaborators = await prisma.collaborator.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(collaborators);
  } catch {
    return NextResponse.json({ error: "Failed to fetch data.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const performedBy = await getUsername(request);
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON.", code: "INVALID_JSON" }, { status: 400 });
  }

  if (type === "resource") {
    const result = resourceSchema.safeParse(body);
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (field) fields[field] = issue.message;
      }
      return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR", fields }, { status: 400 });
    }

    try {
      const resource = await prisma.resource.create({
        data: {
          ...result.data,
          description: validateResourceDescription(result.data.description),
          published: result.data.published ?? true,
        },
      });
      revalidatePath("/collaborations");
      revalidateTag("home");
      await logAction("CREATE", "collaborations/resources", resource.id, resource.title, performedBy);
      return NextResponse.json(resource, { status: 201 });
    } catch {
      return NextResponse.json({ error: "Failed to create resource.", code: "DB_ERROR" }, { status: 500 });
    }
  }

  // Default: collaborator
  const result = collaboratorSchema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (field) fields[field] = issue.message;
    }
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR", fields }, { status: 400 });
  }

  try {
    const collaborator = await prisma.collaborator.create({
      data: { ...result.data, published: result.data.published ?? true },
    });
    revalidatePath("/collaborations");
    revalidateTag("home");
    await logAction("CREATE", "collaborations", collaborator.id, collaborator.name, performedBy);
    return NextResponse.json(collaborator, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create collaborator.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const performedBy = await getUsername(request);
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON.", code: "INVALID_JSON" }, { status: 400 });
  }

  if (type === "resource") {
    const withId = z.object({ id: z.string() }).merge(resourceSchema.partial());
    const result = withId.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR" }, { status: 400 });
    }
    const { id, description, ...rest } = result.data;
    try {
      const resource = await prisma.resource.update({
        where: { id },
        data: {
          ...rest,
          ...(description !== undefined ? { description: validateResourceDescription(description) } : {}),
        },
      });
      revalidatePath("/collaborations");
      revalidateTag("home");
      await logAction("UPDATE", "collaborations/resources", resource.id, resource.title, performedBy);
      return NextResponse.json(resource);
    } catch {
      return NextResponse.json({ error: "Failed to update resource.", code: "DB_ERROR" }, { status: 500 });
    }
  }

  const withId = z.object({ id: z.string() }).merge(collaboratorSchema.partial());
  const result = withId.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR" }, { status: 400 });
  }
  const { id, ...data } = result.data;
  try {
    const { published, ...rest } = data;
    const collaborator = await prisma.collaborator.update({ where: { id }, data: { ...rest, published: published ?? undefined } });
    revalidatePath("/collaborations");
    revalidateTag("home");
    await logAction("UPDATE", "collaborations", collaborator.id, collaborator.name, performedBy);
    return NextResponse.json(collaborator);
  } catch {
    return NextResponse.json({ error: "Failed to update collaborator.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const performedBy = await getUsername(request);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");
  if (!id) return NextResponse.json({ error: "ID is required.", code: "MISSING_ID" }, { status: 400 });

  if (type === "resource") {
    try {
      const resource = await prisma.resource.delete({ where: { id } });
      revalidatePath("/collaborations");
      revalidateTag("home");
      await logAction("DELETE", "collaborations/resources", resource.id, resource.title, performedBy);
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ error: "Failed to delete resource.", code: "DB_ERROR" }, { status: 500 });
    }
  }

  try {
    const collaborator = await prisma.collaborator.delete({ where: { id } });
    revalidatePath("/collaborations");
    revalidateTag("home");
    await logAction("DELETE", "collaborations", collaborator.id, collaborator.name, performedBy);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete collaborator.", code: "DB_ERROR" }, { status: 500 });
  }
}
