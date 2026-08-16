import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.adminUser.findUnique({
    where: { username: session.username },
    select: { totpEnabled: true },
  });

  return NextResponse.json({ totpEnabled: user?.totpEnabled ?? false });
}
