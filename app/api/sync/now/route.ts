import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { syncAllAccounts, syncPlatform } from "@/lib/auto-sync";
import { prisma } from "@/lib/prisma";

// POST - Trigger manual sync
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { platform } = body;

    let result;

    if (platform) {
      // Sync specific platform
      result = await syncPlatform(platform);
      return NextResponse.json({
        message: `Synced ${platform}`,
        itemsFetched: result.itemsFetched,
        success: result.success,
        error: result.error,
      });
    } else {
      // Sync all platforms
      result = await syncAllAccounts();
      return NextResponse.json({
        message: "Sync completed",
        total: result.total,
        successful: result.successful,
        failed: result.failed,
        results: result.results,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Sync failed" },
      { status: 500 }
    );
  }
}

// GET - Get sync status
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await prisma.connectedAccount.findMany({
      select: {
        platform: true,
        syncStatus: true,
        lastSyncedAt: true,
        syncError: true,
      },
    });

    const profile = await prisma.profile.findFirst({
      select: {
        autoSyncEnabled: true,
        lastSyncAt: true,
      },
    });

    return NextResponse.json({
      autoSyncEnabled: profile?.autoSyncEnabled || false,
      lastSync: profile?.lastSyncAt,
      accounts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get sync status" },
      { status: 500 }
    );
  }
}
