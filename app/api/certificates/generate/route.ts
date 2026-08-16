import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { z } from "zod";
import QRCode from "qrcode";

const generateSchema = z.object({
  courseId: z.string().optional(),
  achievementType: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const result = generateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Generate unique certificate code
    const code = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Generate QR code
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/certificates/verify/${code}`;
    const qrCode = await QRCode.toDataURL(verificationUrl);

    // Get student info
    const student = await prisma.student.findUnique({
      where: { id: session.studentId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    // Create certificate
    const certificate = await prisma.certificate.create({
      data: {
        studentId: session.studentId,
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        achievementType: data.achievementType,
        certificateCode: code,
        qrCode,
        issuedDate: new Date(),
        recipientName: `${student?.firstName} ${student?.lastName}`,
        recipientEmail: student?.email || "",
      },
    });

    // Award points
    await prisma.studentPoint.create({
      data: {
        studentId: session.studentId,
        points: 50,
        source: "certificate_earned",
        description: `Earned certificate: ${data.title}`,
      },
    });

    return NextResponse.json({
      message: "Certificate generated",
      certificate,
    }, { status: 201 });
  } catch (error) {
    console.error("Certificate generation error:", error);
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 });
  }
}
