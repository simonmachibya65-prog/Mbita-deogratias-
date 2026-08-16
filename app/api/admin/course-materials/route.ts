import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";
import { z } from "zod";
import { logAction } from "@/lib/activityLog";

const schema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(["lecture_note", "video", "assignment", "quiz", "other"]),
  url: z.string().optional(),
  content: z.string().optional(),
  order: z.number().optional(),
  published: z.boolean().optional(),
});

async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const where = courseId ? { courseId } : {};
  const items = await prisma.courseMaterial.findMany({ where, orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const item = await prisma.courseMaterial.create({ data: { ...parsed.data, order: parsed.data.order ?? 0 } });
  await logAction("create", "course-materials", item.id, item.title, session.username);
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const item = await prisma.courseMaterial.update({ where: { id }, data });
  await logAction("update", "course-materials", item.id, item.title, session.username);
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.courseMaterial.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
