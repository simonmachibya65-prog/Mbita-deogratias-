import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const graduationYear = searchParams.get("graduationYear");
    const industry = searchParams.get("industry");

    const where: any = { status: "graduated" };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { currentCompany: { contains: search, mode: "insensitive" } },
      ];
    }

    if (graduationYear) {
      where.graduationYear = parseInt(graduationYear);
    }

    if (industry) {
      where.industry = industry;
    }

    const alumni = await prisma.student.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profilePicture: true,
        graduationYear: true,
        currentCompany: true,
        currentPosition: true,
        industry: true,
        linkedin: true,
      },
      orderBy: { graduationYear: "desc" },
    });

    return NextResponse.json({ alumni });
  } catch (error) {
    console.error("Alumni directory error:", error);
    return NextResponse.json({ error: "Failed to load alumni" }, { status: 500 });
  }
}
