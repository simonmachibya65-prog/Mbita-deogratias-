import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";
import { z } from "zod";

const schema = z.object({
  studentId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  completed: z.boolean().optional(),
});

async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const where = studentId ? { studentId } : {};
  const items = await prisma.studentMilestone.findMany({ where, orderBy: { createdAt: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { dueDate, ...rest } = parsed.data;
  const item = await prisma.studentMilestone.create({
    data: { ...rest, dueDate: dueDate ? new Date(dueDate) : undefined },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, completed, dueDate, ...rest } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const item = await prisma.studentMilestone.update({
    where: { id },
    data: {
      ...rest,
      ...(completed !== undefined ? { completed, completedAt: completed ? new Date() : null } : {}),
      ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.studentMilestone.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
