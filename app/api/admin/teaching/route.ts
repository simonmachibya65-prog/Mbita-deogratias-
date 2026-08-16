import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/activityLog";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

const courseSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  code: z.string().min(1, "Course code is required"),
  term: z.string().min(1, "Term is required"),
  status: z.enum(["active", "archived"]),
  syllabusUrl: z.string().nullable().optional().or(z.literal("")),
  externalUrl: z.string().nullable().optional().or(z.literal("")),
  description: z.string().nullable().optional(),
  bannerImage: z.string().nullable().optional(),
  zoomUrl: z.string().nullable().optional(),
  classroomUrl: z.string().nullable().optional(),
  schedule: z.unknown().nullable().optional(),
  materials: z.unknown().nullable().optional(),
  published: z.boolean().nullable().optional(),
});

async function getUsername(request: NextRequest): Promise<string> {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(request, res, sessionOptions);
  return session.username ?? "admin";
}

export async function GET() {
  try {
    const courses = await prisma.course.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(courses);
  } catch {
    return NextResponse.json({ error: "Failed to fetch courses.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const performedBy = await getUsername(request);

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON.", code: "INVALID_JSON" }, { status: 400 });
  }

  const result = courseSchema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (field) fields[field] = issue.message;
    }
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR", fields }, { status: 400 });
  }

  try {
    const { published, schedule, materials, ...createRest } = result.data;
    const course = await prisma.course.create({
      data: {
        ...createRest,
        published: published ?? true,
        ...(schedule !== undefined && schedule !== null ? { schedule: schedule as unknown as import("@prisma/client").Prisma.InputJsonValue } : {}),
        ...(materials !== undefined && materials !== null ? { materials: materials as unknown as import("@prisma/client").Prisma.InputJsonValue } : {}),
      },
    });
    revalidatePath("/teaching");
    revalidateTag("home");
    await logAction("CREATE", "teaching", course.id, course.name, performedBy);
    return NextResponse.json(course, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create course.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const performedBy = await getUsername(request);

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON.", code: "INVALID_JSON" }, { status: 400 });
  }

  const withId = z.object({ id: z.string() }).merge(courseSchema.partial());
  const result = withId.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const { id, published, schedule, materials, ...updateRest } = result.data;

  try {
    const course = await prisma.course.update({
      where: { id },
      data: {
        ...updateRest,
        published: published ?? undefined,
        ...(schedule !== undefined && schedule !== null ? { schedule: schedule as unknown as import("@prisma/client").Prisma.InputJsonValue } : {}),
        ...(materials !== undefined && materials !== null ? { materials: materials as unknown as import("@prisma/client").Prisma.InputJsonValue } : {}),
      },
    });
    revalidatePath("/teaching");
    revalidateTag("home");
    await logAction("UPDATE", "teaching", course.id, course.name, performedBy);
    return NextResponse.json(course);
  } catch {
    return NextResponse.json({ error: "Failed to update course.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const performedBy = await getUsername(request);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required.", code: "MISSING_ID" }, { status: 400 });

  try {
    const course = await prisma.course.delete({ where: { id } });
    revalidatePath("/teaching");
    revalidateTag("home");
    await logAction("DELETE", "teaching", course.id, course.name, performedBy);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete course.", code: "DB_ERROR" }, { status: 500 });
  }
}
