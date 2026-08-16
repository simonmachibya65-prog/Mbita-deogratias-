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
  status: z.string().default("draft"),
  fundingBody: z.string().nullable().optional(),
  amount: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  submittedAt: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  published: z.boolean().nullable().optional(),
});

async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function GET() {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.researchProposal.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { deadline, submittedAt, published, ...rest } = parsed.data;
  const item = await prisma.researchProposal.create({
    data: { ...rest, deadline: deadline ? new Date(deadline) : undefined, submittedAt: submittedAt ? new Date(submittedAt) : undefined, published: published ?? undefined },
  });
  await logAction("create", "proposals", item.id, item.title, session.username);
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, deadline, submittedAt, ...data } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const parsed = schema.partial().safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { published: pub, ...parsedRest } = parsed.data;
  const item = await prisma.researchProposal.update({
    where: { id },
    data: {
      ...parsedRest,
      published: pub ?? undefined,
      ...(deadline ? { deadline: new Date(deadline) } : {}),
      ...(submittedAt ? { submittedAt: new Date(submittedAt) } : {}),
    },
  });
  await logAction("update", "proposals", item.id, item.title, session.username);
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.researchProposal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
