import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/activityLog";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

const publicationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  authors: z.array(z.string()).min(1, "At least one author is required"),
  venue: z.string().min(1, "Venue is required"),
  year: z.number().int().min(1900).max(2100),
  type: z.enum(["journal", "conference", "book", "book_chapter", "technical_report", "other"]),
  doi: z.string().nullable().optional().or(z.literal("")),
  url: z.string().nullable().optional().or(z.literal("")),
  abstract: z.string().nullable().optional(),
  pdfUrl: z.string().nullable().optional().or(z.literal("")),
  coverImage: z.string().nullable().optional().or(z.literal("")),
  published: z.boolean().nullable().optional(),
});

async function getUsername(request: NextRequest): Promise<string> {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(request, res, sessionOptions);
  return session.username ?? "admin";
}

export async function GET() {
  try {
    const publications = await prisma.publication.findMany({
      orderBy: { year: "desc" },
    });
    return NextResponse.json(publications);
  } catch {
    return NextResponse.json({ error: "Failed to fetch publications.", code: "DB_ERROR" }, { status: 500 });
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

  const result = publicationSchema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (field) fields[field] = issue.message;
    }
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR", fields }, { status: 400 });
  }

  try {
    const pub = await prisma.publication.create({
      data: { ...result.data, published: result.data.published ?? true },
    });
    revalidatePath("/publications");
    revalidateTag("publications");
    revalidateTag("home");
    await logAction("CREATE", "publications", pub.id, pub.title, performedBy);
    return NextResponse.json(pub, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create publication.", code: "DB_ERROR" }, { status: 500 });
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

  const withId = z.object({ id: z.string() }).merge(publicationSchema.partial());
  const result = withId.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const { id, published, ...data } = result.data;

  try {
    const pub = await prisma.publication.update({ where: { id }, data: { ...data, published: published ?? undefined } });
    revalidatePath("/publications");
    revalidateTag("publications");
    revalidateTag("home");
    await logAction("UPDATE", "publications", pub.id, pub.title, performedBy);
    return NextResponse.json(pub);
  } catch {
    return NextResponse.json({ error: "Failed to update publication.", code: "DB_ERROR" }, { status: 500 });
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
    const pub = await prisma.publication.delete({ where: { id } });
    revalidatePath("/publications");
    revalidateTag("publications");
    revalidateTag("home");
    await logAction("DELETE", "publications", pub.id, pub.title, performedBy);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete publication.", code: "DB_ERROR" }, { status: 500 });
  }
}
