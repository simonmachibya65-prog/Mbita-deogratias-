import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string(),
  description: z.string(),
  jobType: z.enum(["full_time", "part_time", "contract", "internship"]),
  salary: z.string().optional(),
  applyUrl: z.string().url("Invalid URL"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobType = searchParams.get("jobType");
    const search = searchParams.get("search");

    const where: any = { status: "active" };

    if (jobType) where.jobType = jobType;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const jobs = await prisma.jobPosting.findMany({
      where,
      include: {
        poster: {
          select: {
            firstName: true,
            lastName: true,
            currentCompany: true,
          },
        },
      },
      orderBy: { postedAt: "desc" },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Jobs error:", error);
    return NextResponse.json({ error: "Failed to load jobs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = jobSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Note: In production, verify poster is alumni
    const job = await prisma.jobPosting.create({
      data: {
        ...result.data,
        status: "active",
        posterId: body.posterId, // Should come from session
      },
    });

    return NextResponse.json({ message: "Job posted", job }, { status: 201 });
  } catch (error) {
    console.error("Job posting error:", error);
    return NextResponse.json({ error: "Failed to post job" }, { status: 500 });
  }
}
