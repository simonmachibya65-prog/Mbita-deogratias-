import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";
import { verify } from "otplib";

export async function POST(req: NextRequest) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { token } = await req.json();
    const user = await prisma.adminUser.findUnique({ where: { username: session.username } });
    if (!user?.totpSecret || !user.totpEnabled) {
      return NextResponse.json({ error: "MFA is not enabled" }, { status: 400 });
    }

    const result = await verify({ token: String(token), secret: user.totpSecret });
    if (!result.valid) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

    await prisma.adminUser.update({
      where: { username: session.username },
      data: { totpEnabled: false, totpSecret: null },
    });

    return NextResponse.json({ success: true, message: "MFA disabled" });
  } catch {
    return NextResponse.json({ error: "Failed to disable MFA" }, { status: 500 });
  }
}
