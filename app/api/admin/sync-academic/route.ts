import { NextRequest, NextResponse } from 'next/server';
import { syncAcademicProfiles, importPublications } from '@/lib/academicSync';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';

async function getSession(req: NextRequest, res: NextResponse) {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

/**
 * GET /api/admin/sync-academic
 * Fetch publications from all connected academic profiles
 */
export async function GET(req: NextRequest) {
  const response = NextResponse.json({});
  const session = await getSession(req, response);

  if (!session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncAcademicProfiles();

    return NextResponse.json({
      success: result.success,
      publicationsFound: result.publications.length,
      publications: result.publications,
      sources: result.sources,
      errors: result.errors,
      message: result.success 
        ? `Found ${result.publications.length} publications from ${result.sources.join(', ')}`
        : 'No publications found'
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Sync failed',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/sync-academic
 * Fetch and import publications to database
 */
export async function POST(req: NextRequest) {
  const response = NextResponse.json({});
  const session = await getSession(req, response);

  if (!session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch publications
    const result = await syncAcademicProfiles();

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'No publications found',
        errors: result.errors
      }, { status: 404 });
    }

    // Import to database
    const imported = await importPublications(result.publications);

    return NextResponse.json({
      success: true,
      totalFound: result.publications.length,
      imported,
      skipped: result.publications.length - imported,
      sources: result.sources,
      message: `Successfully imported ${imported} new publications (${result.publications.length - imported} already existed)`
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Import failed',
      details: error.message
    }, { status: 500 });
  }
}
