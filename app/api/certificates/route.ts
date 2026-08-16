import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const certificates = await prisma.certificate.findMany({
      where: { studentId: session.studentId },
      include: {
        course: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: { issuedDate: "desc" },
    });

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error("Certificates error:", error);
    return NextResponse.json({ error: "Failed to load certificates" }, { status: 500 });
  }
}
