import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/activityLog";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const galleryItemSchema = z.object({
  imageUrl: z.string().min(1, "Image URL is required"),
  alt: z.string().min(1, "Alt text is required"),
  caption: z.string().min(1, "Caption is required"),
  category: z.string().min(1, "Category is required"),
  published: z.boolean().optional(),
});

async function getUsername(request: NextRequest): Promise<string> {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(request, res, sessionOptions);
  return session.username ?? "admin";
}

export async function GET() {
  try {
    const items = await prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch gallery items.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const performedBy = await getUsername(request);

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.formData();
      const file = formData.get("image") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided.", code: "NO_FILE" }, { status: 400 });
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.", code: "INVALID_MIME" },
          { status: 400 }
        );
      }

      const ext = file.type.split("/")[1].replace("jpeg", "jpg");
      const filename = `gallery-${Date.now()}.${ext}`;
      const galleryDir = path.join(process.cwd(), "public", "images", "gallery");
      await mkdir(galleryDir, { recursive: true });
      const filePath = path.join(galleryDir, filename);
      const bytes = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));

      const imageUrl = `/images/gallery/${filename}`;
      return NextResponse.json({ success: true, imageUrl });
    } catch (err) {
      console.error("Gallery image upload failed:", err);
      return NextResponse.json({ error: "Failed to upload image.", code: "WRITE_FAILED" }, { status: 500 });
    }
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON.", code: "INVALID_JSON" }, { status: 400 });
  }

  const result = galleryItemSchema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (field) fields[field] = issue.message;
    }
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR", fields }, { status: 400 });
  }

  try {
    const item = await prisma.galleryItem.create({
      data: { ...result.data, published: result.data.published ?? true },
    });
    revalidatePath("/gallery");
    revalidateTag("home");
    await logAction("CREATE", "gallery", item.id, item.caption, performedBy);
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create gallery item.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const performedBy = await getUsername(request);
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON.", code: "INVALID_JSON" }, { status: 400 });
  }

  const withId = z.object({ id: z.string() }).merge(galleryItemSchema.partial());
  const result = withId.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const { id, ...data } = result.data;
  try {
    const item = await prisma.galleryItem.update({ where: { id }, data });
    revalidatePath("/gallery");
    revalidateTag("home");
    await logAction("UPDATE", "gallery", item.id, item.caption, performedBy);
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Failed to update gallery item.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const performedBy = await getUsername(request);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required.", code: "MISSING_ID" }, { status: 400 });

  try {
    const item = await prisma.galleryItem.delete({ where: { id } });
    revalidatePath("/gallery");
    revalidateTag("home");
    await logAction("DELETE", "gallery", item.id, item.caption, performedBy);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete gallery item.", code: "DB_ERROR" }, { status: 500 });
  }
}
