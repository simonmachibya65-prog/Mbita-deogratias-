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
    if (!token) return NextResponse.json({ error: "Token is required" }, { status: 400 });

    const user = await prisma.adminUser.findUnique({ where: { username: session.username } });
    if (!user?.totpSecret) return NextResponse.json({ error: "MFA not set up" }, { status: 400 });

    const result = await verify({ token: String(token), secret: user.totpSecret });
    if (!result.valid) return NextResponse.json({ error: "Invalid code. Please try again." }, { status: 400 });

    // Enable MFA
    await prisma.adminUser.update({
      where: { username: session.username },
      data: { totpEnabled: true },
    });

    return NextResponse.json({ success: true, message: "MFA enabled successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
