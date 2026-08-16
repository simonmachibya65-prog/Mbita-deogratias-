import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Lightweight sync trigger - checks if sync is needed
 * This endpoint is called on page load and determines if a full sync should run
 */

export async function POST() {
  try {
    // Check if auto-sync is enabled
    const profile = await prisma.profile.findFirst({
      select: {
        autoSyncEnabled: true,
        lastSyncAt: true,
      },
    });

    if (!profile?.autoSyncEnabled) {
      return NextResponse.json({
        synced: false,
        reason: "Auto-sync disabled",
      });
    }

    // Check when last sync happened
    const now = new Date();
    const lastSync = profile.lastSyncAt;
    const timeSinceSync = lastSync 
      ? (now.getTime() - lastSync.getTime()) / 1000 
      : Infinity;

    // Only sync if more than 30 seconds since last sync
    // This prevents hammering external APIs
    if (timeSinceSync < 30) {
      return NextResponse.json({
        synced: false,
        reason: "Recently synced",
        lastSync,
        nextSyncIn: Math.ceil(30 - timeSinceSync),
      });
    }

    // Check for active accounts
    const accountCount = await prisma.connectedAccount.count({
      where: { isActive: true },
    });

    if (accountCount === 0) {
      return NextResponse.json({
        synced: false,
        reason: "No connected accounts",
      });
    }

    // Queue a background sync (don't wait for it)
    // In production, you'd use a job queue like BullMQ, Inngest, or Vercel Cron
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sync/background`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger: 'page-load' }),
    }).catch(err => console.error('Background sync failed:', err));

    return NextResponse.json({
      synced: true,
      reason: "Sync triggered",
      accountCount,
      lastSync,
    });
  } catch (error: any) {
    console.error('[Sync Trigger] Error:', error);
    return NextResponse.json(
      { synced: false, reason: "Error", error: error.message },
      { status: 500 }
    );
  }
}

// GET - Check sync status without triggering
export async function GET() {
  try {
    const profile = await prisma.profile.findFirst({
      select: {
        autoSyncEnabled: true,
        lastSyncAt: true,
      },
    });

    const accounts = await prisma.connectedAccount.findMany({
      where: { isActive: true },
      select: {
        platform: true,
        lastSyncedAt: true,
        syncStatus: true,
      },
    });

    return NextResponse.json({
      enabled: profile?.autoSyncEnabled || false,
      lastSync: profile?.lastSyncAt,
      accounts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
