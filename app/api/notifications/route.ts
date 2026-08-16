import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const where: any = { studentId: session.studentId };
    if (unreadOnly) where.read = false;

    const notifications = await prisma.studentNotification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.studentNotification.count({
      where: { studentId: session.studentId, read: false },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, action } = body;

    if (action === "mark_read") {
      await prisma.studentNotification.update({
        where: { id: notificationId },
        data: { read: true },
      });

      return NextResponse.json({ message: "Marked as read" });
    }

    if (action === "mark_all_read") {
      await prisma.studentNotification.updateMany({
        where: { studentId: session.studentId, read: false },
        data: { read: true },
      });

      return NextResponse.json({ message: "All marked as read" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Notification action error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
