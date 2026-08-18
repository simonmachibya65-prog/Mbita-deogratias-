/**
 * Academic Profile Auto-Sync Service
 * Fetches publications and data from various academic platforms
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { prisma } from './prisma';

export interface Publication {
  title: string;
  authors: string[];
  venue: string;
  year: number;
  url?: string;
  doi?: string;
  abstract?: string;
  citations?: number;
}

/**
 * Fetch publications from ORCID
 * Most reliable - uses official API
 */
export async function fetchFromORCID(orcidId: string): Promise<Publication[]> {
  try {
    const response = await axios.get(
      `https://pub.orcid.org/v3.0/${orcidId}/works`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    const publications: Publication[] = [];
    const works = response.data.group || [];

    for (const group of works) {
      const summary = group['work-summary']?.[0];
      if (!summary) continue;

      const title = summary.title?.title?.value || 'Untitled';
      const year = summary['publication-date']?.year?.value || new Date().getFullYear();
      const journal = summary['journal-title']?.value || 'Unknown Venue';
      
      // Get DOI if available
      const externalIds = summary['external-ids']?.['external-id'] || [];
      const doiObj = externalIds.find((id: any) => id['external-id-type'] === 'doi');
      const doi = doiObj?.['external-id-value'];

      publications.push({
        title,
        authors: [], // ORCID doesn't provide full author list in summary
        venue: journal,
        year: parseInt(year),
        doi,
        url: doi ? `https://doi.org/${doi}` : undefined,
      });
    }

    return publications;
  } catch (error: any) {
    console.error('ORCID fetch error:', error.message);
    return [];
  }
}

/**
 * Fetch publications from Semantic Scholar
 * Free API, good coverage
 */
export async function fetchFromSemanticScholar(authorName: string): Promise<Publication[]> {
  try {
    // Search for author
    const searchResponse = await axios.get(
      `https://api.semanticscholar.org/graph/v1/author/search`,
      {
        params: { query: authorName, limit: 1 }
      }
    );

    const authorId = searchResponse.data.data?.[0]?.authorId;
    if (!authorId) return [];

    // Get author's papers
    const papersResponse = await axios.get(
      `https://api.semanticscholar.org/graph/v1/author/${authorId}/papers`,
      {
        params: {
          fields: 'title,authors,year,venue,externalIds,citationCount,abstract',
          limit: 100
        }
      }
    );

    const publications: Publication[] = [];
    const papers = papersResponse.data.data || [];

    for (const paper of papers) {
      publications.push({
        title: paper.title || 'Untitled',
        authors: paper.authors?.map((a: any) => a.name) || [],
        venue: paper.venue || 'Unknown',
        year: paper.year || new Date().getFullYear(),
        doi: paper.externalIds?.DOI,
        url: paper.externalIds?.DOI ? `https://doi.org/${paper.externalIds.DOI}` : undefined,
        abstract: paper.abstract,
        citations: paper.citationCount || 0,
      });
    }

    return publications;
  } catch (error: any) {
    console.error('Semantic Scholar fetch error:', error.message);
    return [];
  }
}

/**
 * Fetch publications from Google Scholar (via scraping)
 * Less reliable, use as fallback
 * Note: Google may block this - use sparingly
 */
export async function fetchFromGoogleScholar(userId: string): Promise<Publication[]> {
  try {
    const url = `https://scholar.google.com/citations?user=${userId}&hl=en`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const publications: Publication[] = [];

    $('.gsc_a_tr').each((_, element) => {
      const title = $(element).find('.gsc_a_at').text().trim();
      const authorsVenue = $(element).find('.gs_gray').first().text().trim();
      const venue = $(element).find('.gs_gray').last().text().trim();
      const year = parseInt($(element).find('.gsc_a_y').text().trim()) || new Date().getFullYear();
      const citedBy = parseInt($(element).find('.gsc_a_c').text().trim()) || 0;
      const link = $(element).find('.gsc_a_at').attr('href');

      if (title) {
        publications.push({
          title,
          authors: authorsVenue.split(',').map(a => a.trim()),
          venue: venue || 'Unknown',
          year,
          citations: citedBy,
          url: link ? `https://scholar.google.com${link}` : undefined,
        });
      }
    });

    return publications;
  } catch (error: any) {
    console.error('Google Scholar fetch error:', error.message);
    return [];
  }
}

/**
 * Fetch publications from CrossRef by author name
 * Good for DOI lookups
 */
export async function fetchFromCrossRef(authorName: string): Promise<Publication[]> {
  try {
    const response = await axios.get(
      `https://api.crossref.org/works`,
      {
        params: {
          query: authorName,
          filter: 'type:journal-article',
          rows: 50
        }
      }
    );

    const publications: Publication[] = [];
    const items = response.data.message?.items || [];

    for (const item of items) {
      const title = item.title?.[0] || 'Untitled';
      const authors = item.author?.map((a: any) => `${a.given} ${a.family}`.trim()) || [];
      const venue = item['container-title']?.[0] || 'Unknown';
      const year = item['published-print']?.['date-parts']?.[0]?.[0] || 
                   item['published-online']?.['date-parts']?.[0]?.[0] || 
                   new Date().getFullYear();
      const doi = item.DOI;

      publications.push({
        title,
        authors,
        venue,
        year,
        doi,
        url: doi ? `https://doi.org/${doi}` : undefined,
        abstract: item.abstract,
      });
    }

    return publications;
  } catch (error: any) {
    console.error('CrossRef fetch error:', error.message);
    return [];
  }
}

/**
 * Main sync function - tries multiple sources
 */
export async function syncAcademicProfiles(): Promise<{
  success: boolean;
  publications: Publication[];
  sources: string[];
  errors: string[];
}> {
  const publications: Publication[] = [];
  const sources: string[] = [];
  const errors: string[] = [];

  try {
    // Get profile with academic links
    const profile = await prisma.profile.findFirst();
    if (!profile) {
      return { success: false, publications: [], sources: [], errors: ['No profile found'] };
    }

    const academicProfiles = profile.academicProfiles as any || {};

    // Try ORCID first (most reliable)
    if (profile.orcidId) {
      try {
        const orcidPubs = await fetchFromORCID(profile.orcidId);
        publications.push(...orcidPubs);
        sources.push('ORCID');
      } catch (error: any) {
        errors.push(`ORCID: ${error.message}`);
      }
    }

    // Try Semantic Scholar
    if (profile.fullName) {
      try {
        const semanticPubs = await fetchFromSemanticScholar(profile.fullName);
        publications.push(...semanticPubs);
        sources.push('Semantic Scholar');
      } catch (error: any) {
        errors.push(`Semantic Scholar: ${error.message}`);
      }
    }

    // Try Google Scholar (if user ID is available)
    const googleScholarUrl = academicProfiles.googleScholar || '';
    const googleScholarMatch = googleScholarUrl.match(/user=([^&]+)/);
    if (googleScholarMatch) {
      try {
        const scholarPubs = await fetchFromGoogleScholar(googleScholarMatch[1]);
        publications.push(...scholarPubs);
        sources.push('Google Scholar');
      } catch (error: any) {
        errors.push(`Google Scholar: ${error.message}`);
      }
    }

    // Deduplicate by title (case-insensitive)
    const seen = new Set<string>();
    const uniquePubs = publications.filter(pub => {
      const key = pub.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return {
      success: uniquePubs.length > 0,
      publications: uniquePubs,
      sources,
      errors
    };

  } catch (error: any) {
    return {
      success: false,
      publications: [],
      sources: [],
      errors: [error.message]
    };
  }
}

/**
 * Import publications to database
 */
export async function importPublications(publications: Publication[]): Promise<number> {
  let imported = 0;

  for (const pub of publications) {
    try {
      // Check if already exists
      const existing = await prisma.publication.findFirst({
        where: { title: pub.title }
      });

      if (!existing) {
        await prisma.publication.create({
          data: {
            title: pub.title,
            authors: pub.authors,
            venue: pub.venue,
            year: pub.year,
            type: 'journal', // Default type
            doi: pub.doi,
            url: pub.url,
            abstract: pub.abstract,
            published: true,
          }
        });
        imported++;
      }
    } catch (error) {
      console.error(`Failed to import: ${pub.title}`, error);
    }
  }

  return imported;
}
