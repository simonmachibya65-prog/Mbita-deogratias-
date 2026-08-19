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

// Helper function to map external publication types to Prisma enum
function mapPublicationType(externalType: string): string {
  const typeMap: Record<string, string> = {
    // CrossRef types
    'journal-article': 'journal',
    'proceedings-article': 'conference',
    'book-chapter': 'book_chapter',
    'book': 'book',
    'report': 'technical_report',
    'posted-content': 'other',
    // Google Scholar / Semantic Scholar types
    'article': 'journal',
    'conference': 'conference',
    'chapter': 'book_chapter',
    'preprint': 'other',
    // Already-mapped values (idempotent mapping)
    'journal': 'journal',
    'book_chapter': 'book_chapter',
    'technical_report': 'technical_report',
    // Fallback
    'other': 'other',
  };

  const normalized = externalType.toLowerCase().replace(/\s+/g, '-');
  return typeMap[normalized] || 'other';
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

// Extract ResearchGate profile name
function extractResearchGateProfile(url: string): string | null {
  const match = url.match(/researchgate\.net\/profile\/([^/?]+)/);
  return match ? match[1] : null;
}

// Extract Academia.edu profile
function extractAcademiaProfile(url: string): string | null {
  const match = url.match(/academia\.edu\/([^/?]+)/);
  return match ? match[1] : null;
}

// Extract Scopus author ID
function extractScopusID(url: string): string | null {
  const match = url.match(/authorId=(\d+)/);
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
        type: mapPublicationType("article"), // Google Scholar publications, default to article
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
            type: mapPublicationType("journal-article"),
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

// Fetch from Scopus by author name (using Semantic Scholar as proxy since Scopus requires auth)
async function fetchFromScopus(authorName: string): Promise<SyncedContent> {
  // Scopus API requires institutional access, so we use Semantic Scholar as backup
  // which also indexes Scopus papers
  console.log(`Scopus detected - using Semantic Scholar API as data source`);
  
  try {
    const searchResponse = await fetch(
      `https://api.semanticscholar.org/graph/v1/author/search?query=${encodeURIComponent(authorName)}&limit=5`
    );

    if (!searchResponse.ok) return { publications: [], profile: {}, coAuthors: [], researchInterests: [], images: [] };

    const searchData = await searchResponse.json();
    
    if (!searchData.data || searchData.data.length === 0) {
      return { publications: [], profile: {}, coAuthors: [], researchInterests: [], images: [] };
    }

    const authorId = searchData.data[0]?.authorId;
    if (!authorId) return { publications: [], profile: {}, coAuthors: [], researchInterests: [], images: [] };

    const papersResponse = await fetch(
      `https://api.semanticscholar.org/graph/v1/author/${authorId}/papers?fields=title,year,authors,venue,citationCount,publicationTypes&limit=100`
    );

    if (!papersResponse.ok) return { publications: [], profile: {}, coAuthors: [], researchInterests: [], images: [] };

    const papersData = await papersResponse.json();
    const publications: any[] = [];

    for (const paper of papersData.data || []) {
      if (paper.title) {
        publications.push({
          title: paper.title,
          year: paper.year || new Date().getFullYear(),
          venue: paper.venue || "Unknown Venue",
          authors: paper.authors?.map((a: any) => a.name) || [],
          citations: paper.citationCount || 0,
          type: mapPublicationType(paper.publicationTypes?.[0] || "article"),
          source: "Scopus (via Semantic Scholar)",
        });
      }
    }

    return {
      publications,
      profile: {},
      coAuthors: [],
      researchInterests: [],
      images: [],
    };
  } catch (error) {
    console.error("Scopus fetch error:", error);
    return { publications: [], profile: {}, coAuthors: [], researchInterests: [], images: [] };
  }
}

// Fetch from ResearchGate by scraping author name
async function fetchFromResearchGate(profileName: string, authorName: string): Promise<SyncedContent> {
  console.log(`ResearchGate detected - using CrossRef as data source`);
  
  // ResearchGate requires API key, so we use CrossRef as backup
  try {
    const response = await fetch(
      `https://api.crossref.org/works?query.author=${encodeURIComponent(authorName)}&rows=100&select=title,author,published-print,container-title,type,DOI`
    );

    if (!response.ok) return { publications: [], profile: {}, coAuthors: [], researchInterests: [], images: [] };

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
        type: mapPublicationType(item.type || "article"),
        doi: item.DOI || null,
        source: "ResearchGate (via CrossRef)",
      });
    }

    return {
      publications,
      profile: {},
      coAuthors: [],
      researchInterests: [],
      images: [],
    };
  } catch (error) {
    console.error("ResearchGate fetch error:", error);
    return { publications: [], profile: {}, coAuthors: [], researchInterests: [], images: [] };
  }
}

// Fetch from Academia.edu by author name
async function fetchFromAcademia(profileName: string, authorName: string): Promise<SyncedContent> {
  console.log(`Academia.edu detected - using CrossRef as data source`);
  
  // Academia.edu has no public API, using CrossRef as backup
  try {
    const response = await fetch(
      `https://api.crossref.org/works?query.author=${encodeURIComponent(authorName)}&rows=50&select=title,author,published-print,container-title,type,DOI`
    );

    if (!response.ok) return { publications: [], profile: {}, coAuthors: [], researchInterests: [], images: [] };

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
        type: mapPublicationType(item.type || "article"),
        doi: item.DOI || null,
        source: "Academia.edu (via CrossRef)",
      });
    }

    return {
      publications,
      profile: {},
      coAuthors: [],
      researchInterests: [],
      images: [],
    };
  } catch (error) {
    console.error("Academia.edu fetch error:", error);
    return { publications: [], profile: {}, coAuthors: [], researchInterests: [], images: [] };
  }
}

// Fetch from PubMed by author name
async function fetchFromPubMed(authorName: string): Promise<SyncedContent> {
  console.log(`PubMed - Fetching medical/biological publications...`);
  
  try {
    // Step 1: Search for author to get PMIDs
    const searchResponse = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(authorName)}[Author]&retmax=100&retmode=json`
    );

    if (!searchResponse.ok) return { publications: [], profile: {}, coAuthors: [], researchInterests: [], images: [] };

    const searchData = await searchResponse.json();
    const pmids = searchData.esearchresult?.idlist || [];

    if (pmids.length === 0) {
      return { publications: [], profile: {}, coAuthors: [], researchInterests: [], images: [] };
    }

    // Step 2: Fetch details for each PMID
    const summaryResponse = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`
    );

    if (!summaryResponse.ok) return { publications: [], profile: {}, coAuthors: [], researchInterests: [], images: [] };

    const summaryData = await summaryResponse.json();
    const publications: any[] = [];

    for (const pmid of pmids) {
      const article = summaryData.result?.[pmid];
      if (!article || !article.title) continue;

      const authors = article.authors?.map((a: any) => a.name) || [];
      const year = article.pubdate ? parseInt(article.pubdate.split(' ')[0]) : new Date().getFullYear();

      publications.push({
        title: article.title,
        year: year,
        venue: article.fulljournalname || article.source || "PubMed Journal",
        authors: authors,
        type: mapPublicationType("journal-article"),
        doi: article.elocationid?.replace('doi: ', '') || null,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        source: "PubMed",
      });
    }

    return {
      publications,
      profile: {},
      coAuthors: [],
      researchInterests: [],
      images: [],
    };
  } catch (error) {
    console.error("PubMed fetch error:", error);
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
    const fetchPromises: Promise<void>[] = [];

    debugInfo.push(`📋 Found ${academicProfiles.length} academic profile links`);
    academicProfiles.forEach((p, idx) => {
      debugInfo.push(`  ${idx + 1}. ${p.label}: ${p.url}`);
    });

    // Fetch from Google Scholar
    const scholarProfile = academicProfiles.find((p) => 
      p.label.toLowerCase().includes("scholar") || 
      p.url.toLowerCase().includes("scholar.google")
    );

    if (scholarProfile) {
      const scholarId = extractScholarID(scholarProfile.url);
      if (scholarId) {
        debugInfo.push(`\n🎓 Fetching from Google Scholar...`);
        fetchPromises.push(
          fetchCompleteGoogleScholar(scholarId).then(scholarData => {
            result.publications.push(...scholarData.publications);
            result.profile = { ...result.profile, ...scholarData.profile };
            result.coAuthors.push(...scholarData.coAuthors);
            result.researchInterests.push(...scholarData.researchInterests);
            result.images.push(...scholarData.images);
            debugInfo.push(`✅ Google Scholar: ${scholarData.publications.length} publications, ${scholarData.coAuthors.length} co-authors`);
          }).catch(err => {
            debugInfo.push(`❌ Google Scholar error: ${err.message}`);
          })
        );
      }
    }

    // Fetch from ORCID
    const orcidProfile = academicProfiles.find((p) => 
      p.label.toLowerCase().includes("orcid") || p.url.toLowerCase().includes("orcid")
    );

    if (orcidProfile) {
      const orcidId = extractORCID(orcidProfile.url);
      if (orcidId) {
        debugInfo.push(`\n🆔 Fetching from ORCID...`);
        fetchPromises.push(
          fetchCompleteORCID(orcidId).then(orcidData => {
            result.publications.push(...orcidData.publications);
            if (orcidData.profile.name) result.profile.name = orcidData.profile.name;
            if (orcidData.profile.bio) result.profile.bio = orcidData.profile.bio;
            debugInfo.push(`✅ ORCID: ${orcidData.publications.length} publications`);
          }).catch(err => {
            debugInfo.push(`❌ ORCID error: ${err.message}`);
          })
        );
      }
    }

    // Fetch from ResearchGate
    const rgProfile = academicProfiles.find((p) => 
      p.label.toLowerCase().includes("researchgate") || 
      p.url.toLowerCase().includes("researchgate.net")
    );

    if (rgProfile) {
      const profileName = extractResearchGateProfile(rgProfile.url);
      debugInfo.push(`\n🔬 Fetching from ResearchGate...`);
      fetchPromises.push(
        fetchFromResearchGate(profileName || '', profile.fullName).then(rgData => {
          result.publications.push(...rgData.publications);
          debugInfo.push(`✅ ResearchGate: ${rgData.publications.length} publications`);
        }).catch(err => {
          debugInfo.push(`❌ ResearchGate error: ${err.message}`);
        })
      );
    }

    // Fetch from Academia.edu
    const academiaProfile = academicProfiles.find((p) => 
      p.label.toLowerCase().includes("academia") || 
      p.url.toLowerCase().includes("academia.edu")
    );

    if (academiaProfile) {
      const profileName = extractAcademiaProfile(academiaProfile.url);
      debugInfo.push(`\n📚 Fetching from Academia.edu...`);
      fetchPromises.push(
        fetchFromAcademia(profileName || '', profile.fullName).then(acadData => {
          result.publications.push(...acadData.publications);
          debugInfo.push(`✅ Academia.edu: ${acadData.publications.length} publications`);
        }).catch(err => {
          debugInfo.push(`❌ Academia.edu error: ${err.message}`);
        })
      );
    }

    // Fetch from Scopus
    const scopusProfile = academicProfiles.find((p) => 
      p.label.toLowerCase().includes("scopus") || 
      p.url.toLowerCase().includes("scopus.com")
    );

    if (scopusProfile) {
      debugInfo.push(`\n📊 Fetching from Scopus...`);
      fetchPromises.push(
        fetchFromScopus(profile.fullName).then(scopusData => {
          result.publications.push(...scopusData.publications);
          debugInfo.push(`✅ Scopus: ${scopusData.publications.length} publications`);
        }).catch(err => {
          debugInfo.push(`❌ Scopus error: ${err.message}`);
        })
      );
    }

    // Fetch from PubMed
    const pubmedProfile = academicProfiles.find((p) => 
      p.label.toLowerCase().includes("pubmed") || 
      p.url.toLowerCase().includes("pubmed.ncbi")
    );

    if (pubmedProfile) {
      debugInfo.push(`\n🏥 Fetching from PubMed...`);
      fetchPromises.push(
        fetchFromPubMed(profile.fullName).then(pubmedData => {
          result.publications.push(...pubmedData.publications);
          debugInfo.push(`✅ PubMed: ${pubmedData.publications.length} publications`);
        }).catch(err => {
          debugInfo.push(`❌ PubMed error: ${err.message}`);
        })
      );
    }

    // Wait for all fetches to complete
    debugInfo.push(`\n⏳ Fetching from ${fetchPromises.length} sources in parallel...`);
    await Promise.all(fetchPromises);
    debugInfo.push(`✅ All fetches completed`);

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
        select: { id: true, title: true }, // Only select minimal fields to avoid citations column error
      });

      if (!existing) {
        const mappedType = mapPublicationType(pub.type || "article");
        console.log(`Creating publication: "${pub.title}" with type: ${pub.type} -> ${mappedType}`);
        
        // Create publication data without citations if column doesn't exist
        const publicationData: any = {
          title: pub.title,
          authors: pub.authors.length > 0 ? pub.authors : [data.profile.name || "Unknown"],
          year: pub.year,
          venue: pub.venue,
          type: mappedType, // Already mapped, no need for 'as any'
          abstract: pub.abstract || `Automatically imported from ${pub.source || 'external source'}`,
          published: true,
        };
        
        // Try to add citations if available
        try {
          publicationData.citations = pub.citations || 0;
        } catch (e) {
          console.log('Citations field not available, skipping');
        }
        
        await prisma.publication.create({
          data: publicationData,
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
