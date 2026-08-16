import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";
import { logAction } from "@/lib/activityLog";

interface ORCIDWork {
  "put-code": number;
  title?: { title?: { value?: string } };
  "journal-title"?: { value?: string };
  "publication-date"?: { year?: { value?: string } };
  type?: string;
  "external-ids"?: {
    "external-id"?: Array<{
      "external-id-type"?: string;
      "external-id-value"?: string;
      "external-id-url"?: { value?: string };
    }>;
  };
  contributors?: {
    contributor?: Array<{
      "credit-name"?: { value?: string };
    }>;
  };
}

function mapORCIDType(orcidType: string): string {
  const map: Record<string, string> = {
    "journal-article": "journal",
    "conference-paper": "conference",
    "conference-abstract": "conference",
    "book": "book",
    "book-chapter": "book_chapter",
    "report": "technical_report",
    "working-paper": "technical_report",
    "dissertation": "other",
    "other": "other",
  };
  return map[orcidType?.toLowerCase()] ?? "other";
}

export async function POST() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orcidId = process.env.ORCID_ID;
  if (!orcidId) {
    return NextResponse.json({ error: "ORCID_ID not configured in environment variables." }, { status: 400 });
  }

  try {
    // Fetch works from ORCID public API
    const res = await fetch(
      `https://pub.orcid.org/v3.0/${orcidId}/works`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "ProfessorWebsite/1.0",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: `ORCID API returned ${res.status}. Check your ORCID_ID.` }, { status: 502 });
    }

    const data = await res.json();
    const groups = data?.group ?? [];

    let added = 0;
    let skipped = 0;

    for (const group of groups) {
      const workSummaries = group?.["work-summary"] ?? [];
      if (workSummaries.length === 0) continue;

      const work: ORCIDWork = workSummaries[0];

      const title = work?.title?.title?.value;
      if (!title) { skipped++; continue; }

      const yearStr = work?.["publication-date"]?.year?.value;
      const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();
      const venue = work?.["journal-title"]?.value ?? "Unknown Venue";
      const type = mapORCIDType(work?.type ?? "other");

      // Extract DOI
      const externalIds = work?.["external-ids"]?.["external-id"] ?? [];
      const doiEntry = externalIds.find(e => e["external-id-type"] === "doi");
      const doi = doiEntry?.["external-id-value"] ?? null;
      const url = doiEntry?.["external-id-url"]?.value ?? null;

      // Extract authors
      const contributors = work?.contributors?.contributor ?? [];
      const authors = contributors
        .map(c => c?.["credit-name"]?.value)
        .filter(Boolean) as string[];

      // Check if already exists by DOI or title+year
      const existing = doi
        ? await prisma.publication.findFirst({ where: { doi } })
        : await prisma.publication.findFirst({ where: { title, year } });

      if (existing) { skipped++; continue; }

      await prisma.publication.create({
        data: {
          title,
          authors: authors.length > 0 ? authors : ["Unknown Author"],
          venue,
          year,
          type: type as "journal" | "conference" | "book" | "book_chapter" | "technical_report" | "other",
          doi,
          url,
          published: true,
        },
      });
      added++;
    }

    await logAction("sync", "publications", null, `ORCID sync: +${added} added, ${skipped} skipped`, session.username);

    return NextResponse.json({
      success: true,
      message: `Sync complete: ${added} publications added, ${skipped} already existed.`,
      added,
      skipped,
    });
  } catch (err) {
    console.error("ORCID sync error:", err);
    return NextResponse.json({ error: "Failed to sync from ORCID. Please try again." }, { status: 500 });
  }
}
