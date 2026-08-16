import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";
import { z } from "zod";
import { logAction } from "@/lib/activityLog";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  repoUrl: z.string().nullable().optional(),
  demoUrl: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  stars: z.number().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  published: z.boolean().nullable().optional(),
});

async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function GET() {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.researchRepository.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { published, stars, tags, ...createFields } = parsed.data;
  const item = await prisma.researchRepository.create({ data: { ...createFields, published: published ?? undefined, stars: stars ?? undefined, tags: tags ?? undefined } });
  await logAction("create", "repository", item.id, item.title, session.username);
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
  const { published: pub, stars, tags, ...updateFields } = parsed.data;
  const item = await prisma.researchRepository.update({ where: { id }, data: { ...updateFields, published: pub ?? undefined, stars: stars ?? undefined, tags: tags ?? undefined } });
  await logAction("update", "repository", item.id, item.title, session.username);
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.researchRepository.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
