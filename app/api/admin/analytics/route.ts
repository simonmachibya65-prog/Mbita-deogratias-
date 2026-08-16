import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      pubCount, researchCount, courseCount, studentCount,
      awardCount, blogCount, eventCount, collabCount,
      galleryCount, messageCount, unreadMessages,
      recentActivity, pubsByType, studentsByDegree,
      upcomingEvents, recentMessages, newsletterCount,
      appointmentCount, testimonialCount, announcementCount,
    ] = await Promise.all([
      prisma.publication.count(),
      prisma.researchProject.count(),
      prisma.course.count(),
      prisma.student.count(),
      prisma.award.count(),
      prisma.blogPost.count(),
      prisma.event.count(),
      prisma.collaborator.count(),
      prisma.galleryItem.count(),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.activityLog.findMany({ orderBy: { performedAt: "desc" }, take: 10 }),
      prisma.publication.groupBy({ by: ["type"], _count: { id: true } }),
      prisma.student.groupBy({ by: ["degreeLevel"], _count: { id: true } }),
      prisma.event.findMany({ where: { date: { gte: now }, published: true }, orderBy: { date: "asc" }, take: 5 }),
      prisma.contactMessage.findMany({ orderBy: { receivedAt: "desc" }, take: 5 }),
      prisma.newsletterSubscriber.count(),
      prisma.appointmentRequest.count({ where: { status: "pending" } }),
      prisma.testimonial.count(),
      prisma.announcement.count({ where: { published: true } }),
    ]);

    // Activity in last 30 days
    const recentActivityCount = await prisma.activityLog.count({
      where: { performedAt: { gte: thirtyDaysAgo } },
    });
    const weeklyActivityCount = await prisma.activityLog.count({
      where: { performedAt: { gte: sevenDaysAgo } },
    });

    return NextResponse.json({
      counts: {
        publications: pubCount,
        research: researchCount,
        courses: courseCount,
        students: studentCount,
        awards: awardCount,
        blog: blogCount,
        events: eventCount,
        collaborators: collabCount,
        gallery: galleryCount,
        messages: messageCount,
        unreadMessages,
        newsletter: newsletterCount,
        appointments: appointmentCount,
        testimonials: testimonialCount,
        services: announcementCount,
      },
      charts: {
        pubsByType: pubsByType.map((p) => ({ label: p.type, value: p._count.id })),
        studentsByDegree: studentsByDegree.map((s) => ({ label: s.degreeLevel, value: s._count.id })),
      },
      activity: {
        recent: recentActivity,
        last30Days: recentActivityCount,
        last7Days: weeklyActivityCount,
      },
      upcomingEvents,
      recentMessages,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
