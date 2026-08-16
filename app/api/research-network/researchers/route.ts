import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const expertise = searchParams.get("expertise");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { expertise: { hasSome: [search] } },
        { institution: { contains: search, mode: "insensitive" } },
      ];
    }

    if (expertise) {
      where.expertise = { has: expertise };
    }

    const [researchers, total] = await Promise.all([
      prisma.researcher.findMany({
        where,
        include: {
          _count: {
            select: {
              publications: true,
              proposals: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.researcher.count({ where }),
    ]);

    return NextResponse.json({
      researchers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Researchers error:", error);
    return NextResponse.json(
      { error: "Failed to load researchers" },
      { status: 500 }
    );
  }
}
