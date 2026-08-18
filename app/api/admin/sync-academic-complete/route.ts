import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/activityLog";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

async function getUsername(request: NextRequest): Promise<string> {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(request, res, sessionOptions);
  return session.username ?? "admin";
}

// Extract Google Scholar ID
function extractScholarID(url: string): string | null {
  const match = url.match(/user=([^&]+)/);
  return match ? match[1] : null;
}

// Extract ORCID
function extractORCID(url: string): string | null {
  const match = url.match(/(\d{4}-\d{4}-\d{4}-\d{3}[0-9X])/);
  return match ? match[1] : null;
}

interface SyncedContent {
  publications: any[];
  profile: {
    name?: string;
    affiliation?: string;
    bio?: string;
    photoUrl?: string;
    stats?: {
      citations?: number;
      hIndex?: number;
      i10Index?: number;
    };
  };
  coAuthors: any[];
  researchInterests: string[];
  images: any[];
}

// Fetch complete profile from Google Scholar
async function fetchCompleteGoogleScholar(scholarId: string): Promise<SyncedContent> {
  try {
    const url = `https://scholar.google.com/citations?user=${scholarId}&hl=en`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
      },
    });

    if (!response.ok) {
      console.error(`Google Scholar fetch failed: ${response.status}`);
      return { publications: [], profile: {}, coAuthors: [], researchInterests: [], images: [] };
    }

    const html = await response.text();

    // Extract profile name
    const nameMatch = html.match(/<div[^>]*id="gsc_prf_in"[^>]*>(.*?)<\/div>/);
    const name = nameMatch ? nameMatch[1].trim() : undefined;

    // Extract affiliation
    const affiliationMatch = html.match(/<div[^>]*class="gsc_prf_il"[^>]*>(.*?)<\/div>/);
    const affiliation = affiliationMatch ? affiliationMatch[1].replace(/<[^>]*>/g, '').trim() : undefined;

    // Extract profile image
    const imageMatch = html.match(/<img[^>]*id="gsc_prf_pup-img"[^>]*src="([^"]+)"/);
    const photoUrl = imageMatch ? imageMatch[1] : undefined;

    // Extract citation stats
    const citationsMatch = html.match(/<td[^>]*class="gsc_rsb_std"[^>]*>(\d+)<\/td>/);
    const hIndexMatch = html.matchAll(/<td[^>]*class="gsc_rsb_std"[^>]*>(\d+)<\/td>/g);
    const stats = Array.from(hIndexMatch).map(m => parseInt(m[1]));

    // Extract research interests
    const interestsRegex = /<a[^>]*class="gsc_prf_inta[^>]*>(.*?)<\/a>/g;
    const researchInterests: string[] = [];
    let interestMatch;
    while ((interestMatch = interestsRegex.exec(html)) !== null) {
      researchInterests.push(interestMatch[1].trim());
    }

    // Extract co-authors
    const coAuthorsRegex = /<a[^>]*href="\/citations\?user=([^"]+)"[^>]*class="gsc_rsb_aa"[^>]*>(.*?)<\/a>/g;
    const coAuthors: any[] = [];
    let coAuthorMatch;
    while ((coAuthorMatch = coAuthorsRegex.exec(html)) !== null) {
      coAuthors.push({
        name: coAuthorMatch[2].trim(),
        scholarId: coAuthorMatch[1],
        profileUrl: `https://scholar.google.com/citations?user=${coAuthorMatch[1]}`,
      });
    }

    // Extract publications (same as before)
    const titleRegex = /<a[^>]*class="gsc_a_at"[^>]*>(.*?)<\/a>/g;
    const yearRegex = /<span class="gsc_a_h gsc_a_hc gs_ibl">(\d{4})<\/span>/g;
    const citationRegex = /<a[^>]*class="gsc_a_ac gs_ibl"[^>]*>(\d+)<\/a>/g;
    
    const titles: string[] = [];
    let titleMatch;
    while ((titleMatch = titleRegex.exec(html)) !== null) {
      const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
      if (title) titles.push(title);
    }

    const years: number[] = [];
    let yearMatch;
    while ((yearMatch = yearRegex.exec(html)) !== null) {
      years.push(parseInt(yearMatch[1]));
    }

    const citations: number[] = [];
    let citationMatch;
    while ((citationMatch = citationRegex.exec(html)) !== null) {
      citations.push(parseInt(citationMatch[1]));
    }

    const publications: any[] = [];
    for (let i = 0; i < titles.length; i++) {
      publications.push({
        title: titles[i],
        year: years[i] || new Date().getFullYear(),
        venue: "Journal/Conference",
        authors: [],
        citations: citations[i] || 0,
        type: "journal",
        source: "Google Scholar",
      });
    }

    return {
      publications,
      profile: {
        name,
        affiliation,
        photoUrl: photoUrl ? `https:${photoUrl}` : undefined,
        stats: {
          citations: stats[0] || 0,
          hIndex: stats[2] || 0,
          i10Index: stats[4] || 0,
        },
      },
      coAuthors,
      researchInterests,
      images: [], // Google Scholar doesn't have gallery images
    };
  } catch (error) {
    console.error("Complete Google Scholar fetch error:", error);
    return { publications: [], profile: {}, coAuthors: [], researchInterests: [], images: [] };
  }
}

// Fetch complete profile from ORCID
async function fetchCompleteORCID(orcidId: string): Promise<SyncedContent> {
  try {
    // Fetch person data
    const personResponse = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/person`, {
      headers: { 'Accept': 'application/json' },
    });

    let profile: any = {};
    if (personResponse.ok) {
      const personData = await personResponse.json();
      profile = {
        name: personData.name?.['given-names']?.value + ' ' + personData.name?.['family-name']?.value,
        bio: personData.biography?.content,
      };
    }

    // Fetch works
    const worksResponse = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/works`, {
      headers: { 'Accept': 'application/json' },
    });

    const publications: any[] = [];
    if (worksResponse.ok) {
      const data = await worksResponse.json();
      for (const workGroup of data.group || []) {
        const workSummary = workGroup['work-summary']?.[0];
        if (!workSummary) continue;

        const title = workSummary.title?.title?.value;
        const year = workSummary['publication-date']?.year?.value;
        const venue = workSummary['journal-title']?.value;

        if (title) {
          publications.push({
            title,
            year: year ? parseInt(year) : new Date().getFullYear(),
            venue: venue || "Unknown Journal",
            authors: [],
            type: "journal",
            source: "ORCID",
          });
        }
      }
    }

    return {
      publications,
      profile,
      coAuthors: [],
      researchInterests: [],
      images: [],
    };
  } catch (error) {
    console.error("Complete ORCID fetch error:", error);
    return { publications: [], profile: {}, coAuthors: [], researchInterests: [], images: [] };
  }
}

// GET - Preview all content
export async function GET(request: NextRequest) {
  try {
    const profile = await prisma.profile.findFirst({
      select: {
        fullName: true,
        academicProfiles: true,
      },
    });

    if (!profile) {
      return NextResponse.json({
        success: false,
        message: "Profile not found",
      });
    }

    const academicProfiles = Array.isArray(profile.academicProfiles)
      ? profile.academicProfiles as { label: string; url: string }[]
      : [];

    const result: SyncedContent = {
      publications: [],
      profile: {},
      coAuthors: [],
      researchInterests: [],
      images: [],
    };

    const debugInfo: string[] = [];

    // Try Google Scholar
    const scholarProfile = academicProfiles.find((p) => 
      p.label.toLowerCase().includes("scholar") || 
      p.url.toLowerCase().includes("scholar.google")
    );

    if (scholarProfile) {
      const scholarId = extractScholarID(scholarProfile.url);
      if (scholarId) {
        debugInfo.push(`Fetching complete Google Scholar profile...`);
        const scholarData = await fetchCompleteGoogleScholar(scholarId);
        
        result.publications.push(...scholarData.publications);
        result.profile = { ...result.profile, ...scholarData.profile };
        result.coAuthors.push(...scholarData.coAuthors);
        result.researchInterests.push(...scholarData.researchInterests);
        result.images.push(...scholarData.images);
        
        debugInfo.push(`✅ Google Scholar: ${scholarData.publications.length} publications, ${scholarData.coAuthors.length} co-authors`);
      }
    }

    // Try ORCID
    const orcidProfile = academicProfiles.find((p) => 
      p.label.toLowerCase().includes("orcid") || p.url.toLowerCase().includes("orcid")
    );

    if (orcidProfile) {
      const orcidId = extractORCID(orcidProfile.url);
      if (orcidId) {
        debugInfo.push(`Fetching complete ORCID profile...`);
        const orcidData = await fetchCompleteORCID(orcidId);
        
        result.publications.push(...orcidData.publications);
        if (orcidData.profile.name) result.profile.name = orcidData.profile.name;
        if (orcidData.profile.bio) result.profile.bio = orcidData.profile.bio;
        
        debugInfo.push(`✅ ORCID: ${orcidData.publications.length} publications`);
      }
    }

    // Remove duplicate publications
    const uniquePubs = result.publications.filter((pub, index, self) =>
      index === self.findIndex((p) => 
        p.title.toLowerCase().trim() === pub.title.toLowerCase().trim()
      )
    );

    return NextResponse.json({
      success: true,
      publications: uniquePubs,
      profile: result.profile,
      coAuthors: result.coAuthors,
      researchInterests: result.researchInterests,
      images: result.images,
      debugInfo,
      message: `Found ${uniquePubs.length} publications, ${result.coAuthors.length} co-authors, ${result.researchInterests.length} research interests`,
    });
  } catch (error) {
    console.error("Complete sync error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch complete profile",
      errors: [(error as Error).message],
    }, { status: 500 });
  }
}

// POST - Import everything
export async function POST(request: NextRequest) {
  const performedBy = await getUsername(request);

  try {
    const previewResponse = await GET(request);
    const data = await previewResponse.json();

    if (!data.success) {
      return NextResponse.json(data);
    }

    let imported = {
      publications: 0,
      collaborators: 0,
      galleryItems: 0,
    };

    // Import publications
    for (const pub of data.publications || []) {
      const existing = await prisma.publication.findFirst({
        where: { title: { equals: pub.title, mode: 'insensitive' } },
      });

      if (!existing) {
        await prisma.publication.create({
          data: {
            title: pub.title,
            authors: pub.authors.length > 0 ? pub.authors : [data.profile.name || "Unknown"],
            year: pub.year,
            venue: pub.venue,
            type: "journal",
            citations: pub.citations || 0,
            published: true,
          },
        });
        imported.publications++;
      }
    }

    // Import co-authors as collaborators
    for (const coAuthor of data.coAuthors || []) {
      const existing = await prisma.collaborator.findFirst({
        where: { name: { equals: coAuthor.name, mode: 'insensitive' } },
      });

      if (!existing) {
        await prisma.collaborator.create({
          data: {
            name: coAuthor.name,
            institution: "Unknown",
            area: data.researchInterests[0] || "Research",
            profileUrl: coAuthor.profileUrl,
            type: "individual",
            published: true,
          },
        });
        imported.collaborators++;
      }
    }

    // Import profile photo to gallery if available
    if (data.profile.photoUrl) {
      const existing = await prisma.galleryItem.findFirst({
        where: { imageUrl: data.profile.photoUrl },
      });

      if (!existing) {
        await prisma.galleryItem.create({
          data: {
            imageUrl: data.profile.photoUrl,
            alt: `${data.profile.name} - Profile Photo`,
            caption: `Academic profile photo from Google Scholar`,
            category: "Profile",
            published: true,
          },
        });
        imported.galleryItems++;
      }
    }

    await logAction("CREATE", "complete-sync", "bulk", `Imported ${imported.publications} publications, ${imported.collaborators} collaborators`, performedBy);

    return NextResponse.json({
      success: true,
      imported,
      message: `Successfully imported ${imported.publications} publications, ${imported.collaborators} collaborators, and ${imported.galleryItems} images`,
    });
  } catch (error) {
    console.error("Complete import error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to import complete profile",
      errors: [(error as Error).message],
    }, { status: 500 });
  }
}
