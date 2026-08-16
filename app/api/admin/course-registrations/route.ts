import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";
import { z } from "zod";

const schema = z.object({
  courseId: z.string().min(1),
  studentName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

// Public — students register
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  // Check if already registered
  const existing = await prisma.courseRegistration.findFirst({
    where: { courseId: parsed.data.courseId, email: parsed.data.email },
  });
  if (existing) return NextResponse.json({ error: "You are already registered for this course." }, { status: 409 });

  const reg = await prisma.courseRegistration.create({ data: parsed.data });
  return NextResponse.json(reg, { status: 201 });
}

// Admin — view and manage registrations
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const where = courseId ? { courseId } : {};
  const regs = await prisma.courseRegistration.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json(regs);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const reg = await prisma.courseRegistration.update({ where: { id }, data: { status } });
  return NextResponse.json(reg);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.courseRegistration.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
