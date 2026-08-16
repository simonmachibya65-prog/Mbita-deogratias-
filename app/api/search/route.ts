import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Cache search results for 60 seconds at the edge
export const revalidate = 60;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Run all searches in parallel
    const [publications, research, courses, blog] = await Promise.all([
      prisma.publication.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: q } },
            { venue: { contains: q } },
            { abstract: { contains: q } },
          ],
        },
        select: { id: true, title: true, year: true, type: true, venue: true },
        orderBy: { year: "desc" },
        take: 5,
      }),
      prisma.researchProject.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        },
        select: { id: true, slug: true, title: true, status: true, description: true },
        take: 4,
      }),
      prisma.course.findMany({
        where: {
          published: true,
          OR: [
            { name: { contains: q } },
            { code: { contains: q } },
            { description: { contains: q } },
          ],
        },
        select: { id: true, name: true, code: true, term: true, status: true },
        take: 4,
      }),
      prisma.blogPost.findMany({
        where: {
          draft: false,
          OR: [
            { title: { contains: q } },
            { excerpt: { contains: q } },
          ],
        },
        select: { id: true, title: true, slug: true, publishedAt: true, excerpt: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
    ]);

    const results = [
      ...publications.map((p) => ({
        type: "publication" as const,
        id: p.id,
        title: p.title,
        subtitle: `${p.type.replace("_", " ")} · ${p.venue} · ${p.year}`,
        href: `/publications?q=${encodeURIComponent(q)}`,
      })),
      ...research.map((r) => ({
        type: "research" as const,
        id: r.id,
        title: r.title,
        subtitle: `Research · ${r.status}`,
        href: `/research/${r.slug}`,
      })),
      ...courses.map((c) => ({
        type: "course" as const,
        id: c.id,
        title: `${c.code} — ${c.name}`,
        subtitle: `Course · ${c.term}`,
        href: `/teaching`,
      })),
      ...blog.map((b) => ({
        type: "blog" as const,
        id: b.id,
        title: b.title,
        subtitle: `Blog · ${new Date(b.publishedAt).getFullYear()}`,
        href: `/blog/${b.slug}`,
      })),
    ];

    return NextResponse.json({ results }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
