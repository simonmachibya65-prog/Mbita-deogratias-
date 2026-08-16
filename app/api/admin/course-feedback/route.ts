import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  courseId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  anonymous: z.boolean().default(true),
});

// Public endpoint — students submit feedback
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const feedback = await prisma.courseFeedback.create({ data: parsed.data });
  return NextResponse.json(feedback, { status: 201 });
}

// Admin endpoint — view feedback
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const where = courseId ? { courseId } : {};
  const feedback = await prisma.courseFeedback.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  // Compute stats
  const avg = feedback.length > 0
    ? feedback.reduce((s, f) => s + f.rating, 0) / feedback.length
    : 0;

  const distribution = [1, 2, 3, 4, 5].map(r => ({
    rating: r,
    count: feedback.filter(f => f.rating === r).length,
  }));

  return NextResponse.json({ feedback, avg: avg.toFixed(1), total: feedback.length, distribution });
}
