import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";
import { logAction } from "@/lib/activityLog";

async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function POST() {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Export all data as JSON backup
    const [
      profile, publications, research, courses, students, awards,
      blogPosts, events, collaborators, resources, gallery,
      testimonials, announcements, siteSettings,
    ] = await Promise.all([
      prisma.profile.findFirst(),
      prisma.publication.findMany(),
      prisma.researchProject.findMany(),
      prisma.course.findMany(),
      prisma.student.findMany(),
      prisma.award.findMany(),
      prisma.blogPost.findMany(),
      prisma.event.findMany(),
      prisma.collaborator.findMany(),
      prisma.resource.findMany(),
      prisma.galleryItem.findMany(),
      prisma.testimonial.findMany(),
      prisma.announcement.findMany(),
      prisma.siteSettings.findFirst(),
    ]);

    const backup = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      data: {
        profile, publications, research, courses, students, awards,
        blogPosts, events, collaborators, resources, gallery,
        testimonials, announcements, siteSettings,
      },
    };

    const filename = `backup-${new Date().toISOString().split("T")[0]}.json`;
    const size = `${(JSON.stringify(backup).length / 1024).toFixed(1)} KB`;

    // Log the backup
    await prisma.backupLog.create({ data: { filename, size, status: "completed" } });
    await logAction("BACKUP", "system", null, filename, session.username);

    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Backup failed:", err);
    await prisma.backupLog.create({ data: { filename: "failed", status: "failed" } });
    return NextResponse.json({ error: "Backup failed" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const logs = await prisma.backupLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  return NextResponse.json(logs);
}
