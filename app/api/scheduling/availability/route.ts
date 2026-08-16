import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get("instructorId");
    const date = searchParams.get("date");

    if (!instructorId || !date) {
      return NextResponse.json(
        { error: "instructorId and date are required" },
        { status: 400 }
      );
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Get existing appointments
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        instructorId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { not: "cancelled" },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Generate available time slots (9 AM to 5 PM, 30-min slots)
    const slots = [];
    const workStart = 9; // 9 AM
    const workEnd = 17; // 5 PM

    for (let hour = workStart; hour < workEnd; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = new Date(targetDate);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30);

        // Check if slot conflicts with existing appointment
        const isBooked = existingAppointments.some(apt => {
          const aptStart = new Date(apt.startTime);
          const aptEnd = new Date(apt.endTime);
          return slotStart < aptEnd && slotEnd > aptStart;
        });

        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          available: !isBooked,
        });
      }
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json({ error: "Failed to load availability" }, { status: 500 });
  }
}
