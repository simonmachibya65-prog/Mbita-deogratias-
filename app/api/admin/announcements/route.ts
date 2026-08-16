import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";
import { z } from "zod";
import { logAction } from "@/lib/activityLog";

const schema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  link: z.string().nullable().optional(),
  published: z.boolean().nullable().optional(),
});

async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function GET() {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { published, ...rest } = parsed.data;
  const item = await prisma.announcement.create({ data: { ...rest, published: published ?? undefined } });
  await logAction("create", "announcements", item.id, item.title, session.username);
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const parsed = schema.partial().safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { published, ...updateFields } = parsed.data;
  const item = await prisma.announcement.update({ where: { id }, data: { ...updateFields, published: published ?? undefined } });
  await logAction("update", "announcements", item.id, item.title, session.username);
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.announcement.delete({ where: { id } });
  await logAction("delete", "announcements", id, id, session.username);
  return NextResponse.json({ success: true });
}
