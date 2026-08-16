import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const researcherId = searchParams.get("researcherId");

    const where: any = researcherId ? { authorId: researcherId } : {};

    // Get publication metrics
    const publications = await prisma.publication.findMany({
      where,
      select: {
        downloads: true,
        views: true,
        citations: true,
        altmetricScore: true,
      },
    });

    const totalDownloads = publications.reduce((sum, p) => sum + (p.downloads || 0), 0);
    const totalViews = publications.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalCitations = publications.reduce((sum, p) => sum + (p.citations || 0), 0);
    const avgAltmetric = publications.length > 0
      ? publications.reduce((sum, p) => sum + (p.altmetricScore || 0), 0) / publications.length
      : 0;

    // Get collaboration metrics
    const collaborations = await prisma.researcherConnection.count({
      where: {
        OR: [
          { requesterId: researcherId },
          { receiverId: researcherId },
        ],
        status: "accepted",
      },
    });

    // Get funding metrics
    const fundingApplications = await prisma.fundingApplication.findMany({
      where: { applicantId: researcherId },
    });

    const fundingAwarded = fundingApplications
      .filter(a => a.status === "awarded")
      .reduce((sum, a) => sum + a.budgetAmount, 0);

    // Calculate impact score (weighted average)
    const impactScore = Math.round(
      (totalCitations * 0.4 +
        (totalDownloads / 100) * 0.2 +
        (totalViews / 1000) * 0.1 +
        avgAltmetric * 0.15 +
        collaborations * 0.15) *
        10
    ) / 10;

    return NextResponse.json({
      metrics: {
        downloads: totalDownloads,
        views: totalViews,
        citations: totalCitations,
        altmetricScore: Math.round(avgAltmetric * 10) / 10,
        collaborations,
        fundingAwarded,
        impactScore: Math.min(impactScore, 100),
      },
      breakdown: {
        publicationsCount: publications.length,
        avgDownloadsPerPaper: publications.length > 0
          ? Math.round(totalDownloads / publications.length)
          : 0,
        avgCitationsPerPaper: publications.length > 0
          ? Math.round((totalCitations / publications.length) * 10) / 10
          : 0,
      },
    });
  } catch (error) {
    console.error("Metrics error:", error);
    return NextResponse.json({ error: "Failed to load metrics" }, { status: 500 });
  }
}
