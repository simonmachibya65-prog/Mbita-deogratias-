import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { certificateCode: params.code },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        course: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json({
        valid: false,
        message: "Certificate not found",
      }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      certificate: {
        id: certificate.id,
        title: certificate.title,
        recipientName: certificate.recipientName,
        issuedDate: certificate.issuedDate,
        achievementType: certificate.achievementType,
        course: certificate.course,
      },
    });
  } catch (error) {
    console.error("Certificate verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
