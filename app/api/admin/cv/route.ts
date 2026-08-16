import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/activityLog";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { writeFile } from "fs/promises";
import path from "path";

const awardSchema = z.object({
  name: z.string().min(1, "Award name is required"),
  organization: z.string().min(1, "Organization is required"),
  year: z.number().int().min(1900).max(2100),
  category: z.enum(["award", "grant", "fellowship", "honor", "distinction"]),
  amount: z.string().nullable().optional(),
  fundingPeriod: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  published: z.boolean().nullable().optional(),
});

async function getUsername(request: NextRequest): Promise<string> {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(request, res, sessionOptions);
  return session.username ?? "admin";
}

export async function GET() {
  try {
    const awards = await prisma.award.findMany({ orderBy: { year: "desc" } });
    return NextResponse.json(awards);
  } catch {
    return NextResponse.json({ error: "Failed to fetch awards.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const performedBy = await getUsername(request);

  // Check if this is a file upload (CV PDF)
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.formData();
      const file = formData.get("cv") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided.", code: "NO_FILE" }, { status: 400 });
      }

      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { error: "Invalid file type. Only PDF files are allowed.", code: "INVALID_MIME" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(process.cwd(), "public", "cv.pdf");
      await writeFile(filePath, buffer);

      revalidatePath("/cv");
      revalidateTag("home");
      await logAction("UPDATE", "cv", null, "CV PDF", performedBy);

      return NextResponse.json({ success: true, url: "/cv.pdf" });
    } catch (err) {
      console.error("CV upload failed:", err);
      return NextResponse.json({ error: "Failed to upload CV.", code: "WRITE_FAILED" }, { status: 500 });
    }
  }

  // Otherwise, create a new award
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON.", code: "INVALID_JSON" }, { status: 400 });
  }

  const result = awardSchema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (field) fields[field] = issue.message;
    }
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR", fields }, { status: 400 });
  }

  try {
    const award = await prisma.award.create({
      data: { ...result.data, published: result.data.published ?? true },
    });
    revalidatePath("/cv");
    revalidateTag("home");
    await logAction("CREATE", "cv", award.id, award.name, performedBy);
    return NextResponse.json(award, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create award.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const performedBy = await getUsername(request);
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON.", code: "INVALID_JSON" }, { status: 400 });
  }

  const withId = z.object({ id: z.string() }).merge(awardSchema.partial());
  const result = withId.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const { id, ...data } = result.data;
  try {
    const { published, ...rest } = data;
    const award = await prisma.award.update({ where: { id }, data: { ...rest, published: published ?? undefined } });
    revalidatePath("/cv");
    revalidateTag("home");
    await logAction("UPDATE", "cv", award.id, award.name, performedBy);
    return NextResponse.json(award);
  } catch {
    return NextResponse.json({ error: "Failed to update award.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const performedBy = await getUsername(request);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required.", code: "MISSING_ID" }, { status: 400 });

  try {
    const award = await prisma.award.delete({ where: { id } });
    revalidatePath("/cv");
    revalidateTag("home");
    await logAction("DELETE", "cv", award.id, award.name, performedBy);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete award.", code: "DB_ERROR" }, { status: 500 });
  }
}
