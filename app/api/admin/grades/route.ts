import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";
import { z } from "zod";

const schema = z.object({
  courseId: z.string().min(1),
  studentName: z.string().min(1),
  assessment: z.string().min(1),
  score: z.number().min(0),
  maxScore: z.number().min(1).default(100),
  notes: z.string().optional(),
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
  const grades = await prisma.courseGrade.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json(grades);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const grade = await prisma.courseGrade.create({ data: parsed.data });
  return NextResponse.json(grade, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const grade = await prisma.courseGrade.update({ where: { id }, data });
  return NextResponse.json(grade);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.courseGrade.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
