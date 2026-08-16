import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET - List all connected accounts
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await prisma.connectedAccount.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        platform: true,
        accountId: true,
        isActive: true,
        lastSyncedAt: true,
        syncStatus: true,
        syncError: true,
        createdAt: true,
        // Don't expose tokens/keys
      },
    });

    return NextResponse.json({ accounts });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

// POST - Add new connected account
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { platform, accountId, accessToken, refreshToken, apiKey, metadata } = body;

    if (!platform || !accountId) {
      return NextResponse.json(
        { error: "Platform and accountId are required" },
        { status: 400 }
      );
    }

    // Check if account already exists
    const existing = await prisma.connectedAccount.findUnique({
      where: {
        platform_accountId: {
          platform,
          accountId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Account already connected" },
        { status: 409 }
      );
    }

    const account = await prisma.connectedAccount.create({
      data: {
        platform,
        accountId,
        accessToken,
        refreshToken,
        apiKey,
        metadata: metadata || {},
        isActive: true,
        syncStatus: "pending",
      },
    });

    return NextResponse.json({
      message: "Account connected successfully",
      account: {
        id: account.id,
        platform: account.platform,
        accountId: account.accountId,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add account" },
      { status: 500 }
    );
  }
}

// DELETE - Remove connected account
export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Account ID required" }, { status: 400 });
    }

    await prisma.connectedAccount.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Account disconnected successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to remove account" },
      { status: 500 }
    );
  }
}
