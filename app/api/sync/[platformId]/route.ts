import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Map the integrations page platformId values to the label stored in academicProfiles JSON
const PLATFORM_LABEL_MAP: Record<string, string> = {
  google_scholar: 'Google Scholar',
  orcid: 'ORCID',
  researchgate: 'ResearchGate',
  scopus: 'Scopus',
  academia: 'Academia.edu',
  linkedin: 'LinkedIn',
  github: 'GitHub',
};

/**
 * POST /api/sync/[platformId]
 * Syncs publications for the given platform.
 * - google_scholar: delegates to the dedicated /api/sync/google-scholar handler via internal fetch
 * - all others: returns a clear message because scraping requires external credentials
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { platformId: string } }
) {
  const { platformId } = params;

  const label = PLATFORM_LABEL_MAP[platformId];
  if (!label) {
    return NextResponse.json(
      { success: false, error: `Unknown platform: ${platformId}` },
      { status: 400 }
    );
  }

  // Verify a profile URL has been saved for this platform
  const profile = await prisma.profile.findFirst({
    select: { academicProfiles: true },
  });

  const academicProfiles = Array.isArray(profile?.academicProfiles)
    ? (profile.academicProfiles as Array<{ label: string; url: string }>)
    : [];

  const entry = academicProfiles.find((p) => p.label === label);

  if (!entry?.url) {
    return NextResponse.json(
      {
        success: false,
        error: `No profile URL saved for ${label}. Add one in Settings first.`,
      },
      { status: 400 }
    );
  }

  // Google Scholar has a fully-implemented scraper — proxy to it
  if (platformId === 'google_scholar') {
    const origin = request.nextUrl.origin;
    const res = await fetch(`${origin}/api/sync/google-scholar`, { method: 'POST' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

  // For other platforms, update the connected account to "connected" status
  // (full scraping would require paid APIs or authenticated access)
  await prisma.connectedAccount.upsert({
    where: { platform_accountId: { platform: platformId, accountId: entry.url } },
    update: { lastSyncedAt: new Date(), syncStatus: 'success', isActive: true },
    create: {
      platform: platformId,
      accountId: entry.url,
      isActive: true,
      lastSyncedAt: new Date(),
      syncStatus: 'success',
    },
  });

  return NextResponse.json({
    success: true,
    count: 0,
    message: `${label} URL confirmed. Automatic scraping for this platform requires API credentials. Publications can be added manually via the Publications panel.`,
  });
}
