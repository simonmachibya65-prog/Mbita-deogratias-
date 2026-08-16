import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { z } from "zod";

const bookingSchema = z.object({
  instructorId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  purpose: z.string().min(1, "Purpose is required"),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const result = bookingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    // Check if slot is still available
    const conflicting = await prisma.appointment.findFirst({
      where: {
        instructorId: data.instructorId,
        status: { not: "cancelled" },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
        ],
      },
    });

    if (conflicting) {
      return NextResponse.json(
        { error: "Time slot is no longer available" },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        studentId: session.studentId,
        instructorId: data.instructorId,
        startTime,
        endTime,
        purpose: data.purpose,
        notes: data.notes,
        status: "scheduled",
      },
    });

    // Notify instructor
    const instructor = await prisma.instructor.findUnique({
      where: { id: data.instructorId },
      select: { id: true, email: true },
    });

    if (instructor) {
      // You can send email notification here
      console.log(`Appointment booked with ${instructor.email}`);
    }

    return NextResponse.json({
      message: "Appointment booked successfully",
      appointment,
    }, { status: 201 });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Failed to book appointment" }, { status: 500 });
  }
}
