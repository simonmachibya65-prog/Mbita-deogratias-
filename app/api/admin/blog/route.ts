import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/activityLog";
import { validateExcerpt } from "@/lib/blog";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  publishedAt: z.string().min(1, "Published date is required"),
  excerpt: z.string().min(1, "Excerpt is required").max(200, "Excerpt must be 200 characters or less"),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).nullable().optional(),
  featuredImage: z.string().nullable().optional(),
  draft: z.boolean().nullable().optional(),
});

async function getUsername(request: NextRequest): Promise<string> {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(request, res, sessionOptions);
  return session.username ?? "admin";
}

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } });
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: "Failed to fetch blog posts.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const performedBy = await getUsername(request);
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON.", code: "INVALID_JSON" }, { status: 400 });
  }

  const result = blogPostSchema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (field) fields[field] = issue.message;
    }
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR", fields }, { status: 400 });
  }

  const { publishedAt, excerpt, ...rest } = result.data;

  try {
    const post = await prisma.blogPost.create({
      data: {
        ...rest,
        excerpt: validateExcerpt(excerpt),
        publishedAt: new Date(publishedAt),
        draft: rest.draft ?? false,
        tags: rest.tags ?? [],
      },
    });
    revalidatePath("/blog");
    revalidatePath("/blog/[slug]");
    revalidateTag("home");
    await logAction("CREATE", "blog", post.id, post.title, performedBy);
    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create blog post.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const performedBy = await getUsername(request);
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON.", code: "INVALID_JSON" }, { status: 400 });
  }

  const withId = z.object({ id: z.string() }).merge(blogPostSchema.partial());
  const result = withId.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const { id, publishedAt, excerpt, tags, draft, ...rest } = result.data;

  try {
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...rest,
        ...(excerpt !== undefined ? { excerpt: validateExcerpt(excerpt) } : {}),
        ...(publishedAt !== undefined ? { publishedAt: new Date(publishedAt) } : {}),
        ...(tags !== undefined && tags !== null ? { tags } : {}),
        ...(draft !== undefined && draft !== null ? { draft } : {}),
      },
    });
    revalidatePath("/blog");
    revalidatePath("/blog/[slug]");
    revalidateTag("home");
    await logAction("UPDATE", "blog", post.id, post.title, performedBy);
    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "Failed to update blog post.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const performedBy = await getUsername(request);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required.", code: "MISSING_ID" }, { status: 400 });

  try {
    const post = await prisma.blogPost.delete({ where: { id } });
    revalidatePath("/blog");
    revalidatePath("/blog/[slug]");
    revalidateTag("home");
    await logAction("DELETE", "blog", post.id, post.title, performedBy);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete blog post.", code: "DB_ERROR" }, { status: 500 });
  }
}
