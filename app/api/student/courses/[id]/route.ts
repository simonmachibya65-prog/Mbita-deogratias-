import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);

    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const courseId = params.id;

    // Check if student is enrolled
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId: session.studentId,
        courseId,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
          },
        },
        department: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get assignments
    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      include: {
        submissions: {
          where: { studentId: session.studentId },
          select: {
            id: true,
            status: true,
            grade: true,
            submittedAt: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    // Get course materials
    const materials = await prisma.courseMaterial.findMany({
      where: { courseId },
      orderBy: { uploadedAt: "desc" },
    });

    // Get announcements
    const announcements = await prisma.courseAnnouncement.findMany({
      where: { courseId },
      orderBy: { postedAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      course,
      enrollment,
      assignments: assignments.map(a => ({
        ...a,
        submission: a.submissions[0] || null,
      })),
      materials,
      announcements,
    });

  } catch (error) {
    console.error("Course details error:", error);
    return NextResponse.json(
      { error: "Failed to load course details" },
      { status: 500 }
    );
  }
}
