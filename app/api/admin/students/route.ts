import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/activityLog";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  degreeLevel: z.enum(["PhD", "Masters"]),
  researchTopic: z.string().min(1, "Research topic is required"),
  status: z.enum(["current", "alumni"]),
  thesisTitle: z.string().nullable().optional(),
  graduationYear: z.number().int().min(1900).max(2100).nullable().optional(),
  currentPosition: z.string().nullable().optional(),
  profileUrl: z.string().nullable().optional().or(z.literal("")),
  photoUrl: z.string().nullable().optional().or(z.literal("")),
  achievements: z.array(z.unknown()).nullable().optional(),
  published: z.boolean().nullable().optional(),
});

async function getUsername(request: NextRequest): Promise<string> {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(request, res, sessionOptions);
  return session.username ?? "admin";
}

export async function GET() {
  try {
    const students = await prisma.student.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(students);
  } catch {
    return NextResponse.json({ error: "Failed to fetch students.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const performedBy = await getUsername(request);
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON.", code: "INVALID_JSON" }, { status: 400 });
  }

  const result = studentSchema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (field) fields[field] = issue.message;
    }
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR", fields }, { status: 400 });
  }

  try {
    const { published, achievements, ...createRest } = result.data;
    const student = await prisma.student.create({
      data: { ...createRest, published: published ?? true, ...(achievements !== undefined && achievements !== null ? { achievements: achievements as unknown as import("@prisma/client").Prisma.InputJsonValue } : {}) },
    });
    revalidatePath("/students");
    revalidateTag("home");
    await logAction("CREATE", "students", student.id, student.name, performedBy);
    return NextResponse.json(student, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create student.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const performedBy = await getUsername(request);
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON.", code: "INVALID_JSON" }, { status: 400 });
  }

  const withId = z.object({ id: z.string() }).merge(studentSchema.partial());
  const result = withId.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const { id, published, achievements, ...updateRest } = result.data;
  try {
    const student = await prisma.student.update({ where: { id }, data: { ...updateRest, published: published ?? undefined, ...(achievements !== undefined && achievements !== null ? { achievements: achievements as unknown as import("@prisma/client").Prisma.InputJsonValue } : {}) } });
    revalidatePath("/students");
    revalidateTag("home");
    await logAction("UPDATE", "students", student.id, student.name, performedBy);
    return NextResponse.json(student);
  } catch {
    return NextResponse.json({ error: "Failed to update student.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const performedBy = await getUsername(request);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required.", code: "MISSING_ID" }, { status: 400 });

  try {
    const student = await prisma.student.delete({ where: { id } });
    revalidatePath("/students");
    revalidateTag("home");
    await logAction("DELETE", "students", student.id, student.name, performedBy);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete student.", code: "DB_ERROR" }, { status: 500 });
  }
}
