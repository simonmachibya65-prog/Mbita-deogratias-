import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";

async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

// Track a resource view/download (public)
export async function POST(req: NextRequest) {
  const { resourceId, type } = await req.json();
  if (!resourceId) return NextResponse.json({ error: "resourceId required" }, { status: 400 });

  const existing = await prisma.resourceAnalytics.findFirst({ where: { resourceId } });
  if (existing) {
    await prisma.resourceAnalytics.update({
      where: { id: existing.id },
      data: type === "download" ? { downloads: { increment: 1 } } : { views: { increment: 1 } },
    });
  } else {
    await prisma.resourceAnalytics.create({
      data: { resourceId, views: type === "view" ? 1 : 0, downloads: type === "download" ? 1 : 0 },
    });
  }
  return NextResponse.json({ success: true });
}

// Get analytics (admin)
export async function GET() {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [analytics, resources] = await Promise.all([
    prisma.resourceAnalytics.findMany({ orderBy: { views: "desc" } }),
    prisma.resource.findMany({ select: { id: true, title: true, category: true } }),
  ]);

  const enriched = analytics.map(a => ({
    ...a,
    resource: resources.find(r => r.id === a.resourceId),
  }));

  const totalViews = analytics.reduce((s, a) => s + a.views, 0);
  const totalDownloads = analytics.reduce((s, a) => s + a.downloads, 0);

  return NextResponse.json({ analytics: enriched, totalViews, totalDownloads });
}
