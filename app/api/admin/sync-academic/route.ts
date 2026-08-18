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

// Helper to extract ORCID from URL or raw ID
function extractORCID(input: string): string | null {
  const match = input.match(/(\d{4}-\d{4}-\d{4}-\d{3}[0-9X])/);
  return match ? match[1] : null;
}

// Helper to extract Google Scholar ID
function extractScholarID(input: string): string | null {
  const match = input.match(/user=([^&]+)/);
  return match ? match[1] : null;
}

// Fetch from Google Scholar using web scraping
async function fetchFromGoogleScholar(scholarId: string) {
  try {
    console.log(`Fetching Google Scholar for user: ${scholarId}`);
    
    // Use a more reliable approach - fetch the page with proper headers
    const url = `https://scholar.google.com/citations?user=${scholarId}&hl=en&cstart=0&pagesize=100`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      console.error(`Google Scholar fetch failed: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const publications: any[] = [];

    // Parse HTML to extract publications
    // Google Scholar uses specific class names for publication data
    const titleRegex = /<a[^>]*class="gsc_a_at"[^>]*>(.*?)<\/a>/g;
    const yearRegex = /<span class="gsc_a_h gsc_a_hc gs_ibl">(\d{4})<\/span>/g;
    const citationRegex = /<a[^>]*class="gsc_a_ac gs_ibl"[^>]*>(\d+)<\/a>/g;
    
    // Extract titles
    const titles: string[] = [];
    let titleMatch;
    while ((titleMatch = titleRegex.exec(html)) !== null) {
      const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
      if (title) titles.push(title);
    }

    // Extract years
    const years: number[] = [];
    let yearMatch;
    while ((yearMatch = yearRegex.exec(html)) !== null) {
      years.push(parseInt(yearMatch[1]));
    }

    // Extract citations
    const citations: number[] = [];
    let citationMatch;
    while ((citationMatch = citationRegex.exec(html)) !== null) {
      citations.push(parseInt(citationMatch[1]));
    }

    console.log(`Extracted from Google Scholar: ${titles.length} titles, ${years.length} years, ${citations.length} citations`);

    // Combine data
    for (let i = 0; i < titles.length; i++) {
      publications.push({
        title: titles[i],
        year: years[i] || new Date().getFullYear(),
        venue: "Journal/Conference", // Google Scholar doesn't always show venue in list
        authors: [],
        citations: citations[i] || 0,
        type: "article",
        source: "Google Scholar",
      });
    }

    console.log(`Successfully extracted ${publications.length} publications from Google Scholar`);
    return publications;
  } catch (error) {
    console.error("Google Scholar fetch error:", error);
    return [];
  }
}

// Fetch from ORCID API
async function fetchFromORCID(orcidId: string) {
  try {
    const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/works`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const publications: any[] = [];

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
          type: "journal-article",
          source: "ORCID",
        });
      }
    }

    return publications;
  } catch (error) {
    console.error("ORCID fetch error:", error);
    return [];
  }
}

// Fetch from Semantic Scholar by Author Name
async function fetchFromSemanticScholar(authorName: string) {
  try {
    // Search for author
    const searchResponse = await fetch(
      `https://api.semanticscholar.org/graph/v1/author/search?query=${encodeURIComponent(authorName)}&limit=5`
    );

    if (!searchResponse.ok) return [];

    const searchData = await searchResponse.json();
    
    if (!searchData.data || searchData.data.length === 0) {
      console.log(`No Semantic Scholar author found for "${authorName}"`);
      return [];
    }

    // Try first few results to find the best match
    for (const author of searchData.data) {
      const authorId = author.authorId;
      if (!authorId) continue;

      // Get author's papers
      const papersResponse = await fetch(
        `https://api.semanticscholar.org/graph/v1/author/${authorId}/papers?fields=title,year,authors,venue,citationCount,publicationTypes&limit=100`
      );

      if (!papersResponse.ok) continue;

      const papersData = await papersResponse.json();
      
      if (papersData.data && papersData.data.length > 0) {
        const publications: any[] = [];

        for (const paper of papersData.data) {
          if (paper.title) {
            publications.push({
              title: paper.title,
              year: paper.year || new Date().getFullYear(),
              venue: paper.venue || "Unknown Venue",
              authors: paper.authors?.map((a: any) => a.name) || [],
              citations: paper.citationCount || 0,
              type: paper.publicationTypes?.[0] || "article",
              source: "Semantic Scholar",
            });
          }
        }

        if (publications.length > 0) {
          console.log(`Found ${publications.length} papers from Semantic Scholar for author ID ${authorId}`);
          return publications;
        }
      }
    }

    return [];
  } catch (error) {
    console.error("Semantic Scholar fetch error:", error);
    return [];
  }
}

// Fetch from CrossRef by Author Name
async function fetchFromCrossRef(authorName: string) {
  try {
    const response = await fetch(
      `https://api.crossref.org/works?query.author=${encodeURIComponent(authorName)}&rows=100&select=title,author,published-print,container-title,type,DOI`
    );

    if (!response.ok) return [];

    const data = await response.json();
    const publications: any[] = [];

    for (const item of data.message?.items || []) {
      const title = item.title?.[0];
      if (!title) continue;

      const year = item['published-print']?.['date-parts']?.[0]?.[0];
      const authors = item.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()) || [];

      publications.push({
        title,
        year: year || new Date().getFullYear(),
        venue: item['container-title']?.[0] || "Unknown Journal",
        authors,
        type: item.type || "article",
        doi: item.DOI || null,
        source: "CrossRef",
      });
    }

    console.log(`Found ${publications.length} papers from CrossRef`);
    return publications;
  } catch (error) {
    console.error("CrossRef fetch error:", error);
    return [];
  }
}

// GET - Preview publications without importing
export async function GET(request: NextRequest) {
  try {
    // Get profile with academic links
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

    console.log("🔍 Auto-Sync Debug Info:");
    console.log("Profile Name:", profile.fullName);
    console.log("Academic Profiles Count:", academicProfiles.length);
    console.log("Academic Profiles:", JSON.stringify(academicProfiles, null, 2));

    const allPublications: any[] = [];
    const sources: string[] = [];
    const errors: string[] = [];
    const debugInfo: string[] = [];

    debugInfo.push(`Searching for: ${profile.fullName}`);
    debugInfo.push(`Academic profiles configured: ${academicProfiles.length}`);

    // Try Google Scholar first (most comprehensive for academic profiles)
    const scholarProfile = academicProfiles.find((p) => 
      p.label.toLowerCase().includes("scholar") || 
      p.url.toLowerCase().includes("scholar.google")
    );

    if (scholarProfile) {
      const scholarId = extractScholarID(scholarProfile.url);
      debugInfo.push(`Google Scholar profile found: ${scholarProfile.url}`);
      debugInfo.push(`Extracted Scholar ID: ${scholarId || "FAILED"}`);
      
      if (scholarId) {
        const scholarPubs = await fetchFromGoogleScholar(scholarId);
        debugInfo.push(`Google Scholar returned ${scholarPubs.length} publications`);
        if (scholarPubs.length > 0) {
          allPublications.push(...scholarPubs);
          sources.push("Google Scholar");
        }
      } else {
        errors.push("Invalid Google Scholar ID in URL: " + scholarProfile.url);
      }
    } else {
      debugInfo.push("No Google Scholar profile found in academic links");
    }

    // Try ORCID
    const orcidProfile = academicProfiles.find((p) => 
      p.label.toLowerCase().includes("orcid") || p.url.toLowerCase().includes("orcid")
    );

    if (orcidProfile) {
      const orcidId = extractORCID(orcidProfile.url);
      debugInfo.push(`ORCID profile found: ${orcidProfile.url}`);
      debugInfo.push(`Extracted ORCID ID: ${orcidId || "FAILED"}`);
      
      if (orcidId) {
        const orcidPubs = await fetchFromORCID(orcidId);
        debugInfo.push(`ORCID returned ${orcidPubs.length} publications`);
        if (orcidPubs.length > 0) {
          allPublications.push(...orcidPubs);
          sources.push("ORCID");
        }
      } else {
        errors.push("Invalid ORCID ID format in URL: " + orcidProfile.url);
      }
    } else {
      debugInfo.push("No ORCID profile found in academic links");
    }

    // Try Semantic Scholar (only if Google Scholar didn't return results)
    if (allPublications.length === 0) {
      debugInfo.push(`Searching Semantic Scholar for: ${profile.fullName}`);
      const scholarPubs = await fetchFromSemanticScholar(profile.fullName);
      debugInfo.push(`Semantic Scholar returned ${scholarPubs.length} publications`);
      if (scholarPubs.length > 0) {
        allPublications.push(...scholarPubs);
        sources.push("Semantic Scholar");
      }
    }

    // Try CrossRef (only if no results from Google Scholar or Semantic Scholar)
    if (allPublications.length === 0) {
      debugInfo.push(`Searching CrossRef for: ${profile.fullName}`);
      const crossRefPubs = await fetchFromCrossRef(profile.fullName);
      debugInfo.push(`CrossRef returned ${crossRefPubs.length} publications`);
      if (crossRefPubs.length > 0) {
        allPublications.push(...crossRefPubs);
        sources.push("CrossRef");
      }
    }

    console.log("Debug Info:", debugInfo);

    // Remove duplicates by title
    const uniquePubs = allPublications.filter((pub, index, self) =>
      index === self.findIndex((p) => 
        p.title.toLowerCase().trim() === pub.title.toLowerCase().trim()
      )
    );

    debugInfo.push(`Total publications after deduplication: ${uniquePubs.length}`);

    if (uniquePubs.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No publications found. See debug info below.",
        errors: errors.length > 0 ? errors : ["No data returned from any source"],
        debugInfo,
      });
    }

    return NextResponse.json({
      success: true,
      publicationsFound: uniquePubs.length,
      publications: uniquePubs.sort((a, b) => (b.year || 0) - (a.year || 0)), // Sort by year descending
      sources,
      message: `Found ${uniquePubs.length} publications from ${sources.join(", ")}`,
      errors: errors.length > 0 ? errors : undefined,
      debugInfo,
    });
  } catch (error) {
    console.error("Sync preview error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch publications",
      errors: [(error as Error).message],
    });
  }
}

// POST - Fetch and import publications
export async function POST(request: NextRequest) {
  const performedBy = await getUsername(request);

  try {
    // First, preview to get publications
    const previewResponse = await GET(request);
    const previewData = await previewResponse.json();

    if (!previewData.success || !previewData.publications) {
      return NextResponse.json(previewData);
    }

    const publications = previewData.publications;
    let imported = 0;
    let skipped = 0;

    for (const pub of publications) {
      // Check if publication already exists (by title)
      const existing = await prisma.publication.findFirst({
        where: {
          title: {
            equals: pub.title,
            mode: 'insensitive',
          },
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Create publication
      await prisma.publication.create({
        data: {
          title: pub.title,
          authors: pub.authors.length > 0 ? pub.authors : [previewData.fullName || "Unknown"],
          year: pub.year,
          venue: pub.venue,
          type: pub.type || "journal-article",
          abstract: `Automatically imported from ${pub.source}`,
          citations: pub.citations || 0,
          published: true,
        },
      });

      imported++;
    }

    await logAction("CREATE", "publications", "bulk", `Imported ${imported} publications`, performedBy);

    return NextResponse.json({
      success: true,
      totalFound: publications.length,
      imported,
      skipped,
      sources: previewData.sources,
      message: `Successfully imported ${imported} new publications. ${skipped} already existed.`,
    });
  } catch (error) {
    console.error("Sync import error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to import publications",
      errors: [(error as Error).message],
    }, { status: 500 });
  }
}
