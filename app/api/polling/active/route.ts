import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const polls = await prisma.livePoll.findMany({
      where: {
        active: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ polls });
  } catch (error) {
    console.error("Active polls error:", error);
    return NextResponse.json({ error: "Failed to load polls" }, { status: 500 });
  }
}
