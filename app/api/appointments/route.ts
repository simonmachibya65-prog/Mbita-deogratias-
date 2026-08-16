import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  date: z.string().min(1, "Date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
  purpose: z.string().min(10, "Please describe the purpose (min 10 characters)"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, email, date, timeSlot, purpose } = parsed.data;

    await prisma.appointmentRequest.create({
      data: {
        name,
        email,
        date: new Date(date),
        timeSlot,
        purpose,
      },
    });

    return NextResponse.json({ message: "Appointment request submitted" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
