import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const researcherId = searchParams.get("researcherId");

    const where: any = researcherId ? { authorId: researcherId } : {};

    // Get publications with citation data
    const publications = await prisma.publication.findMany({
      where,
      select: {
        id: true,
        title: true,
        citations: true,
        publishedDate: true,
      },
      orderBy: { citations: "desc" },
    });

    // Calculate metrics
    const totalCitations = publications.reduce((sum, p) => sum + (p.citations || 0), 0);
    const totalPublications = publications.length;

    // Calculate h-index
    const sortedCitations = publications
      .map(p => p.citations || 0)
      .sort((a, b) => b - a);

    let hIndex = 0;
    for (let i = 0; i < sortedCitations.length; i++) {
      if (sortedCitations[i] >= i + 1) {
        hIndex = i + 1;
      } else {
        break;
      }
    }

    // Get citation trend (by year)
    const currentYear = new Date().getFullYear();
    const citationTrend = [];

    for (let year = currentYear - 4; year <= currentYear; year++) {
      const yearPubs = publications.filter(p => {
        const pubYear = p.publishedDate ? new Date(p.publishedDate).getFullYear() : 0;
        return pubYear === year;
      });

      const yearCitations = yearPubs.reduce((sum, p) => sum + (p.citations || 0), 0);

      citationTrend.push({
        year,
        citations: yearCitations,
        publications: yearPubs.length,
      });
    }

    return NextResponse.json({
      metrics: {
        totalCitations,
        totalPublications,
        hIndex,
        averageCitationsPerPaper: totalPublications > 0
          ? Math.round((totalCitations / totalPublications) * 10) / 10
          : 0,
      },
      topPublications: publications.slice(0, 10),
      citationTrend,
    });
  } catch (error) {
    console.error("Citations error:", error);
    return NextResponse.json({ error: "Failed to load citation data" }, { status: 500 });
  }
}
