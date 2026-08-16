import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";

async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function GET() {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [logs, stats] = await Promise.all([
    prisma.securityLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.securityLog.groupBy({
      by: ["event"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
  ]);

  return NextResponse.json({ logs, stats });
}
