import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { z } from "zod";

const applySchema = z.object({
  opportunityId: z.string(),
  proposalTitle: z.string().min(1, "Proposal title is required"),
  proposalDescription: z.string().min(50, "Description must be at least 50 characters"),
  budgetAmount: z.number().positive("Budget must be positive"),
  documentUrl: z.string().url("Invalid document URL"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const result = applySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check if opportunity exists and is open
    const opportunity = await prisma.fundingOpportunity.findUnique({
      where: { id: data.opportunityId },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    if (opportunity.status !== "open") {
      return NextResponse.json({ error: "Opportunity is not open" }, { status: 400 });
    }

    if (opportunity.deadline && opportunity.deadline < new Date()) {
      return NextResponse.json({ error: "Deadline has passed" }, { status: 400 });
    }

    // Check if already applied
    const existing = await prisma.fundingApplication.findFirst({
      where: {
        opportunityId: data.opportunityId,
        applicantId: session.studentId,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already applied to this opportunity" }, { status: 400 });
    }

    // Create application
    const application = await prisma.fundingApplication.create({
      data: {
        opportunityId: data.opportunityId,
        applicantId: session.studentId,
        proposalTitle: data.proposalTitle,
        proposalDescription: data.proposalDescription,
        budgetAmount: data.budgetAmount,
        documentUrl: data.documentUrl,
        status: "submitted",
      },
    });

    return NextResponse.json({
      message: "Application submitted successfully",
      application,
    }, { status: 201 });
  } catch (error) {
    console.error("Funding application error:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
