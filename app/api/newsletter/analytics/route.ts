import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    if (campaignId) {
      // Get specific campaign analytics
      const campaign = await prisma.newsletterCampaign.findUnique({
        where: { id: campaignId },
        include: {
          sends: true,
        },
      });

      if (!campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
      }

      const delivered = campaign.sends.filter(s => s.status === "delivered").length;
      const failed = campaign.sends.filter(s => s.status === "failed").length;
      const opened = campaign.sends.filter(s => s.openedAt !== null).length;
      const clicked = campaign.sends.filter(s => s.clickedAt !== null).length;

      const openRate = delivered > 0 ? Math.round((opened / delivered) * 100) : 0;
      const clickRate = opened > 0 ? Math.round((clicked / opened) * 100) : 0;

      return NextResponse.json({
        campaign: {
          id: campaign.id,
          subject: campaign.subject,
          status: campaign.status,
          sentAt: campaign.sentAt,
        },
        analytics: {
          totalSent: campaign.sends.length,
          delivered,
          failed,
          opened,
          clicked,
          openRate,
          clickRate,
        },
      });
    }

    // Get overall newsletter analytics
    const totalSubscribers = await prisma.newsletterSubscriber.count({
      where: { status: "active" },
    });

    const totalCampaigns = await prisma.newsletterCampaign.count();

    const sentCampaigns = await prisma.newsletterCampaign.count({
      where: { status: "sent" },
    });

    const allSends = await prisma.newsletterSend.findMany({
      select: {
        status: true,
        openedAt: true,
        clickedAt: true,
      },
    });

    const totalSent = allSends.length;
    const totalOpened = allSends.filter(s => s.openedAt !== null).length;
    const totalClicked = allSends.filter(s => s.clickedAt !== null).length;

    const avgOpenRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
    const avgClickRate = totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 100) : 0;

    return NextResponse.json({
      overview: {
        totalSubscribers,
        totalCampaigns,
        sentCampaigns,
        totalEmailsSent: totalSent,
        averageOpenRate: avgOpenRate,
        averageClickRate: avgClickRate,
      },
    });
  } catch (error) {
    console.error("Newsletter analytics error:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
