import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId } = body;

    // Get campaign
    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status === "sent") {
      return NextResponse.json({ error: "Campaign already sent" }, { status: 400 });
    }

    // Get all subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { status: "active" },
    });

    if (subscribers.length === 0) {
      return NextResponse.json({ error: "No active subscribers" }, { status: 400 });
    }

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send emails in batches
    let successCount = 0;
    let failCount = 0;

    for (const subscriber of subscribers) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: subscriber.email,
          subject: campaign.subject,
          html: campaign.content,
        });

        // Track send
        await prisma.newsletterSend.create({
          data: {
            campaignId,
            subscriberId: subscriber.id,
            status: "delivered",
          },
        });

        successCount++;
      } catch (err) {
        await prisma.newsletterSend.create({
          data: {
            campaignId,
            subscriberId: subscriber.id,
            status: "failed",
            error: String(err),
          },
        });

        failCount++;
      }
    }

    // Update campaign status
    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: {
        status: "sent",
        sentAt: new Date(),
        totalSent: successCount,
      },
    });

    return NextResponse.json({
      message: "Campaign sent",
      successCount,
      failCount,
      totalSubscribers: subscribers.length,
    });
  } catch (error) {
    console.error("Newsletter send error:", error);
    return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 });
  }
}
