import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const status = searchParams.get("status") || "open";

    const where: any = { status };

    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { funder: { contains: search, mode: "insensitive" } },
      ];
    }

    const opportunities = await prisma.fundingOpportunity.findMany({
      where,
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { deadline: "asc" },
    });

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error("Funding opportunities error:", error);
    return NextResponse.json({ error: "Failed to load opportunities" }, { status: 500 });
  }
}
