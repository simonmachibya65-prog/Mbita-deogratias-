import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/activityLog";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
  externalUrl: z.string().nullable().optional().or(z.literal("")),
  posterImage: z.string().nullable().optional().or(z.literal("")),
  registrationUrl: z.string().nullable().optional().or(z.literal("")),
  streamUrl: z.string().nullable().optional().or(z.literal("")),
  published: z.boolean().nullable().optional(),
});

async function getUsername(request: NextRequest): Promise<string> {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(request, res, sessionOptions);
  return session.username ?? "admin";
}

export async function GET() {
  try {
    const events = await prisma.event.findMany({ orderBy: { date: "desc" } });
    return NextResponse.json(events);
  } catch {
    return NextResponse.json({ error: "Failed to fetch events.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const performedBy = await getUsername(request);
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON.", code: "INVALID_JSON" }, { status: 400 });
  }

  const result = eventSchema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (field) fields[field] = issue.message;
    }
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR", fields }, { status: 400 });
  }

  const { date, ...rest } = result.data;
  try {
    const event = await prisma.event.create({
      data: { ...rest, date: new Date(date), published: rest.published ?? true },
    });
    revalidatePath("/events");
    revalidateTag("home");
    await logAction("CREATE", "events", event.id, event.name, performedBy);
    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create event.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const performedBy = await getUsername(request);
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON.", code: "INVALID_JSON" }, { status: 400 });
  }

  const withId = z.object({ id: z.string() }).merge(eventSchema.partial());
  const result = withId.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const { id, date, published, ...rest } = result.data;
  try {
    const event = await prisma.event.update({
      where: { id },
      data: { ...rest, ...(date ? { date: new Date(date) } : {}), published: published ?? undefined },
    });
    revalidatePath("/events");
    revalidateTag("home");
    await logAction("UPDATE", "events", event.id, event.name, performedBy);
    return NextResponse.json(event);
  } catch {
    return NextResponse.json({ error: "Failed to update event.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const performedBy = await getUsername(request);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required.", code: "MISSING_ID" }, { status: 400 });

  try {
    const event = await prisma.event.delete({ where: { id } });
    revalidatePath("/events");
    revalidateTag("home");
    await logAction("DELETE", "events", event.id, event.name, performedBy);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete event.", code: "DB_ERROR" }, { status: 500 });
  }
}
