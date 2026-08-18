import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function getSession(request: NextRequest) {
  const response = new NextResponse();
  return getIronSession<SessionData>(request, response, sessionOptions);
}

// GET - Fetch current logged-in user's account info
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session.username) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { username: session.username },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        photoUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Also get profile photo if exists
    const profile = await prisma.profile.findFirst({
      select: { adminPhotoUrl: true, photoUrl: true },
    });

    return NextResponse.json({
      ...user,
      photoUrl: user.photoUrl || profile?.adminPhotoUrl || profile?.photoUrl || "",
    });
  } catch (error) {
    console.error("Account fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch account data" }, { status: 500 });
  }
}

// PUT - Update current user's account info
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session.username) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { email, fullName } = body;

    // Validate
    if (!email || !fullName) {
      return NextResponse.json({ error: "Email and full name are required" }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Update user
    const updated = await prisma.user.update({
      where: { username: session.username },
      data: {
        email,
        fullName,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        photoUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Account update error:", error);
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
  }
}
