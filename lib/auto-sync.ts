/**
 * Auto-Sync Service
 * Automatically fetches content from connected academic accounts
 * Supports: Google Scholar, ORCID, ResearchGate, GitHub, etc.
 */

import { prisma } from "@/lib/prisma";

// Platform-specific fetchers
interface SyncResult {
  success: boolean;
  itemsFetched: number;
  error?: string;
}

// Google Scholar Scraper (uses serpapi.com or scholarpy)
async function syncGoogleScholar(account: any): Promise<SyncResult> {
  try {
    const scholarId = account.accountId;
    
    // Use SerpAPI or direct scraping
    const response = await fetch(
      `https://serpapi.com/search.json?engine=google_scholar_author&author_id=${scholarId}&api_key=${account.apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Google Scholar API error: ${response.status}`);
    }
    
    const data = await response.json();
    const articles = data.articles || [];
    
    let imported = 0;
    
    for (const article of articles) {
      await prisma.syncedContent.upsert({
        where: {
          platform_externalId: {
            platform: "google-scholar",
            externalId: article.citation_id || article.link,
          },
        },
        create: {
          platform: "google-scholar",
          externalId: article.citation_id || article.link,
          contentType: "publication",
          title: article.title,
          content: article.snippet || "",
          metadata: article,
          authors: article.authors?.split(",").map((a: string) => a.trim()) || [],
          publishedDate: article.year ? new Date(article.year, 0, 1) : null,
          citations: parseInt(article.cited_by?.value || "0"),
          url: article.link,
        },
        update: {
          title: article.title,
          content: article.snippet || "",
          metadata: article,
          citations: parseInt(article.cited_by?.value || "0"),
          lastFetchedAt: new Date(),
        },
      });
      imported++;
    }
    
    return { success: true, itemsFetched: imported };
  } catch (error: any) {
    return { success: false, itemsFetched: 0, error: error.message };
  }
}

// ORCID API Integration
async function syncORCID(account: any): Promise<SyncResult> {
  try {
    const orcidId = account.accountId;
    const accessToken = account.accessToken;
    
    const response = await fetch(
      `https://pub.orcid.org/v3.0/${orcidId}/works`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`ORCID API error: ${response.status}`);
    }
    
    const data = await response.json();
    const works = data.group || [];
    
    let imported = 0;
    
    for (const work of works) {
      const summary = work["work-summary"]?.[0];
      if (!summary) continue;
      
      await prisma.syncedContent.upsert({
        where: {
          platform_externalId: {
            platform: "orcid",
            externalId: summary["put-code"].toString(),
          },
        },
        create: {
          platform: "orcid",
          externalId: summary["put-code"].toString(),
          contentType: "publication",
          title: summary.title?.title?.value || "Untitled",
          content: summary.subtitle?.subtitle?.value || "",
          metadata: summary,
          authors: summary.contributors?.contributor?.map((c: any) => 
            c["credit-name"]?.value || ""
          ) || [],
          publishedDate: summary["publication-date"] 
            ? new Date(
                summary["publication-date"].year.value,
                (summary["publication-date"].month?.value || 1) - 1,
                summary["publication-date"].day?.value || 1
              )
            : null,
          url: summary["external-ids"]?.["external-id"]?.[0]?.["external-id-url"]?.value,
        },
        update: {
          title: summary.title?.title?.value || "Untitled",
          content: summary.subtitle?.subtitle?.value || "",
          metadata: summary,
          lastFetchedAt: new Date(),
        },
      });
      imported++;
    }
    
    return { success: true, itemsFetched: imported };
  } catch (error: any) {
    return { success: false, itemsFetched: 0, error: error.message };
  }
}

// ResearchGate Scraper (no official API)
async function syncResearchGate(account: any): Promise<SyncResult> {
  try {
    // ResearchGate doesn't have public API
    // Would need web scraping or third-party service
    // Placeholder for now
    
    console.log("ResearchGate sync not yet implemented");
    return { success: true, itemsFetched: 0 };
  } catch (error: any) {
    return { success: false, itemsFetched: 0, error: error.message };
  }
}

// GitHub Repositories
async function syncGitHub(account: any): Promise<SyncResult> {
  try {
    const username = account.accountId;
    
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          ...(account.accessToken && { Authorization: `token ${account.accessToken}` }),
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const repos = await response.json();
    let imported = 0;
    
    for (const repo of repos) {
      await prisma.syncedContent.upsert({
        where: {
          platform_externalId: {
            platform: "github",
            externalId: repo.id.toString(),
          },
        },
        create: {
          platform: "github",
          externalId: repo.id.toString(),
          contentType: "code",
          title: repo.name,
          content: repo.description || "",
          metadata: repo,
          authors: [repo.owner.login],
          publishedDate: new Date(repo.created_at),
          url: repo.html_url,
        },
        update: {
          title: repo.name,
          content: repo.description || "",
          metadata: repo,
          lastFetchedAt: new Date(),
        },
      });
      imported++;
    }
    
    return { success: true, itemsFetched: imported };
  } catch (error: any) {
    return { success: false, itemsFetched: 0, error: error.message };
  }
}

// Main sync function - syncs all connected accounts
export async function syncAllAccounts(): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: any[];
}> {
  const accounts = await prisma.connectedAccount.findMany({
    where: { isActive: true },
  });
  
  const results = [];
  let successful = 0;
  let failed = 0;
  
  for (const account of accounts) {
    console.log(`Syncing ${account.platform} account: ${account.accountId}`);
    
    // Update status to syncing
    await prisma.connectedAccount.update({
      where: { id: account.id },
      data: { syncStatus: "syncing" },
    });
    
    let result: SyncResult;
    
    switch (account.platform) {
      case "google-scholar":
        result = await syncGoogleScholar(account);
        break;
      case "orcid":
        result = await syncORCID(account);
        break;
      case "researchgate":
        result = await syncResearchGate(account);
        break;
      case "github":
        result = await syncGitHub(account);
        break;
      default:
        result = { success: false, itemsFetched: 0, error: "Unsupported platform" };
    }
    
    // Update account sync status
    await prisma.connectedAccount.update({
      where: { id: account.id },
      data: {
        syncStatus: result.success ? "success" : "error",
        syncError: result.error || null,
        lastSyncedAt: new Date(),
      },
    });
    
    if (result.success) {
      successful++;
    } else {
      failed++;
    }
    
    results.push({
      platform: account.platform,
      accountId: account.accountId,
      ...result,
    });
  }
  
  // Update profile last sync time
  await prisma.profile.update({
    where: { id: 1 },
    data: { lastSyncAt: new Date() },
  });
  
  return {
    total: accounts.length,
    successful,
    failed,
    results,
  };
}

// Sync specific platform
export async function syncPlatform(platform: string): Promise<SyncResult> {
  const account = await prisma.connectedAccount.findFirst({
    where: { platform, isActive: true },
  });
  
  if (!account) {
    return { success: false, itemsFetched: 0, error: "Account not found" };
  }
  
  await prisma.connectedAccount.update({
    where: { id: account.id },
    data: { syncStatus: "syncing" },
  });
  
  let result: SyncResult;
  
  switch (platform) {
    case "google-scholar":
      result = await syncGoogleScholar(account);
      break;
    case "orcid":
      result = await syncORCID(account);
      break;
    case "researchgate":
      result = await syncResearchGate(account);
      break;
    case "github":
      result = await syncGitHub(account);
      break;
    default:
      result = { success: false, itemsFetched: 0, error: "Unsupported platform" };
  }
  
  await prisma.connectedAccount.update({
    where: { id: account.id },
    data: {
      syncStatus: result.success ? "success" : "error",
      syncError: result.error || null,
      lastSyncedAt: new Date(),
    },
  });
  
  return result;
}

// Auto-import synced content to main database tables
export async function importSyncedContent(limit = 100): Promise<number> {
  const content = await prisma.syncedContent.findMany({
    where: { importedToDb: false },
    take: limit,
    orderBy: { publishedDate: "desc" },
  });
  
  let imported = 0;
  
  for (const item of content) {
    try {
      if (item.contentType === "publication") {
        // Import to publications table
        await prisma.publication.create({
          data: {
            title: item.title,
            type: "journal_article",
            abstract: item.content,
            year: item.publishedDate?.getFullYear() || new Date().getFullYear(),
            month: item.publishedDate?.getMonth() || 0,
            authors: item.authors.join(", "),
            citations: item.citations,
            url: item.url || "",
            pdfUrl: "",
            featured: false,
          },
        });
      } else if (item.contentType === "code") {
        // Could import to a projects or repositories table if exists
        console.log(`Skipping import for type: ${item.contentType}`);
      }
      
      // Mark as imported
      await prisma.syncedContent.update({
        where: { id: item.id },
        data: { importedToDb: true },
      });
      
      imported++;
    } catch (error) {
      console.error(`Error importing content ${item.id}:`, error);
    }
  }
  
  return imported;
}
