import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Map platform IDs to the label used in academicProfiles JSON
const PLATFORM_LABELS: Record<string, string> = {
  google_scholar: 'Google Scholar',
  orcid: 'ORCID',
  researchgate: 'ResearchGate',
  scopus: 'Scopus',
  academia: 'Academia.edu',
  linkedin: 'LinkedIn',
  github: 'GitHub',
};

export async function PATCH(request: NextRequest) {
  try {
    const { platformId, profileUrl } = await request.json();

    if (!platformId || !profileUrl) {
      return NextResponse.json(
        { success: false, error: 'platformId and profileUrl are required' },
        { status: 400 }
      );
    }

    const label = PLATFORM_LABELS[platformId];
    if (!label) {
      return NextResponse.json(
        { success: false, error: `Unknown platform: ${platformId}` },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(profileUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Get current profile
    const profile = await prisma.profile.findFirst({
      select: { id: true, academicProfiles: true },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Parse existing academic profiles
    const currentProfiles = Array.isArray(profile.academicProfiles)
      ? (profile.academicProfiles as Array<{ label: string; url: string }>)
      : [];

    // Update or insert this platform's URL
    const existingIndex = currentProfiles.findIndex((p) => p.label === label);
    if (existingIndex >= 0) {
      currentProfiles[existingIndex].url = profileUrl;
    } else {
      currentProfiles.push({ label, url: profileUrl });
    }

    // Save back to database
    await prisma.profile.update({
      where: { id: profile.id },
      data: { academicProfiles: currentProfiles },
    });

    // Also upsert ConnectedAccount so status shows "connected"
    await prisma.connectedAccount.upsert({
      where: { platform_accountId: { platform: platformId, accountId: profileUrl } },
      update: { accountId: profileUrl, isActive: true, syncStatus: 'pending' },
      create: {
        platform: platformId,
        accountId: profileUrl,
        isActive: true,
        syncStatus: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      message: `${label} URL updated successfully`,
      platformId,
      profileUrl,
    });
  } catch (error: any) {
    console.error('Error updating platform URL:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
