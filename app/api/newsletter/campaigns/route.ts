import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const campaignSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
  template: z.string().optional(),
  scheduledFor: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const campaigns = await prisma.newsletterCampaign.findMany({
      include: {
        _count: {
          select: { sends: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Campaigns error:", error);
    return NextResponse.json({ error: "Failed to load campaigns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = campaignSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    const campaign = await prisma.newsletterCampaign.create({
      data: {
        subject: data.subject,
        content: data.content,
        template: data.template,
        status: data.scheduledFor ? "scheduled" : "draft",
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
      },
    });

    return NextResponse.json({
      message: "Campaign created",
      campaign,
    }, { status: 201 });
  } catch (error) {
    console.error("Campaign creation error:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
