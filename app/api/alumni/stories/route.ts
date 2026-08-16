import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured") === "true";

    const where: any = { status: "published" };
    if (featured) where.featured = true;

    const stories = await prisma.alumniStory.findMany({
      where,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            profilePicture: true,
            currentCompany: true,
            currentPosition: true,
            graduationYear: true,
          },
        },
      },
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json({ stories });
  } catch (error) {
    console.error("Alumni stories error:", error);
    return NextResponse.json({ error: "Failed to load stories" }, { status: 500 });
  }
}
