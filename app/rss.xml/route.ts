import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [settings, posts] = await Promise.all([
      prisma.siteSettings.findFirst(),
      prisma.blogPost.findMany({
        where: { draft: false },
        orderBy: { publishedAt: "desc" },
        take: 20,
      }),
    ]);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://example.com";
    const siteTitle = settings?.siteTitle ?? "Professor Personal Website";
    const tagline = settings?.tagline ?? "Academic research and insights";

    const items = posts.map((post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt}]]></description>
    </item>`).join("");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteTitle}</title>
    <link>${baseUrl}</link>
    <description>${tagline}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Error generating RSS feed", { status: 500 });
  }
}
