import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";
import { z } from "zod";
import { logAction } from "@/lib/activityLog";

const schema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  email: z.string().email().nullable().optional().or(z.literal("")),
  photoUrl: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  researchArea: z.string().nullable().optional(),
  joinedYear: z.number().nullable().optional(),
  published: z.boolean().nullable().optional(),
});

async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function GET() {
  const members = await prisma.teamMember.findMany({
    where: { published: true },
    orderBy: { joinedYear: "asc" },
  });
  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { published, ...createFields } = parsed.data;
  const member = await prisma.teamMember.create({ data: { ...createFields, published: published ?? undefined } });
  await logAction("create", "team", member.id, member.name, session.username);
  return NextResponse.json(member, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const parsed = schema.partial().safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { published: pub, ...updateFields } = parsed.data;
  const member = await prisma.teamMember.update({ where: { id }, data: { ...updateFields, published: pub ?? undefined } });
  await logAction("update", "team", member.id, member.name, session.username);
  return NextResponse.json(member);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.teamMember.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
