import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";
import { generateSecret, generateURI } from "otplib";

export async function POST() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const secret = generateSecret();
    const appName = process.env.MFA_APP_NAME ?? "Professor Website";
    const otpauth = generateURI({ issuer: appName, label: session.username, secret });

    // Store secret temporarily (not enabled yet — user must verify first)
    await prisma.adminUser.update({
      where: { username: session.username },
      data: { totpSecret: secret, totpEnabled: false },
    });

    // Generate QR code as data URL using pure base64 encoding of the otpauth URL
    // We use a QR code API to avoid needing the qrcode package
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;

    return NextResponse.json({ secret, otpauth, qrUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to setup MFA" }, { status: 500 });
  }
}
