import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PublicationsClient from "@/components/sections/PublicationsClient";
import Link from "next/link";

export const revalidate = 0;

async function getPublications() {
  try {
    return await prisma.publication.findMany({
      where: { published: true },
      orderBy: { year: "desc" },
    });
  } catch {
    return [];
  }
}

async function getProfile() {
  try {
    return await prisma.profile.findFirst({
      select: { academicProfiles: true, fullName: true },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Publications",
    description: "Browse academic publications including journal articles, conference papers, books, and more.",
    openGraph: { title: "Publications", description: "Academic publications sorted by year." },
  };
}

export default async function PublicationsPage() {
  const [publications, profile] = await Promise.all([getPublications(), getProfile()]);

  // Citation metrics (computed from data)
  const totalPubs = publications.length;
  const journalCount = publications.filter(p => p.type === "journal").length;
  const conferenceCount = publications.filter(p => p.type === "conference").length;
  const bookCount = publications.filter(p => p.type === "book" || p.type === "book_chapter").length;
  const withDOI = publications.filter(p => p.doi).length;
  const years = publications.map(p => p.year);
  const yearRange = years.length > 0 ? `${Math.min(...years)} – ${Math.max(...years)}` : "—";

  // Academic profile links (Google Scholar, ORCID, ResearchGate)
  const academicProfiles = Array.isArray(profile?.academicProfiles)
    ? (profile!.academicProfiles as Array<{ label: string; url: string }>)
    : [];
  const scholarLink = academicProfiles.find(p => p.label.toLowerCase().includes("scholar"));
  const orcidLink = academicProfiles.find(p => p.label.toLowerCase().includes("orcid"));
  const rgLink = academicProfiles.find(p => p.label.toLowerCase().includes("researchgate"));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": publications.map(pub => ({
      "@type": "ScholarlyArticle",
      name: pub.title,
      author: Array.isArray(pub.authors) ? (pub.authors as string[]).map(a => ({ "@type": "Person", name: a })) : [],
      datePublished: String(pub.year),
      isPartOf: { "@type": "Periodical", name: pub.venue },
      ...(pub.doi ? { identifier: `https://doi.org/${pub.doi}` } : {}),
      ...(pub.url ? { url: pub.url } : {}),
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <h1 className="text-4xl font-bold text-navy-900 mb-8">Publications</h1>

      {/* ── CITATION METRICS ── */}
      <section className="mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: "Total", value: totalPubs, icon: "📄" },
            { label: "Journals", value: journalCount, icon: "📰" },
            { label: "Conferences", value: conferenceCount, icon: "🎤" },
            { label: "Books", value: bookCount, icon: "📚" },
            { label: "With DOI", value: withDOI, icon: "🔗" },
            { label: "Year Range", value: yearRange, icon: "📅" },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-border rounded-xl p-4 text-center">
              <p className="text-xl mb-1" aria-hidden="true">{stat.icon}</p>
              <p className="text-xl font-bold text-navy-900">{stat.value}</p>
              <p className="text-xs text-navy-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* External profile links */}
        {(scholarLink || orcidLink || rgLink) && (
          <div className="flex flex-wrap gap-3 mb-2">
            <p className="text-sm text-navy-500 self-center">View on:</p>
            {scholarLink && (
              <a href={scholarLink.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                🎓 Google Scholar
              </a>
            )}
            {orcidLink && (
              <a href={orcidLink.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                🆔 ORCID
              </a>
            )}
            {rgLink && (
              <a href={rgLink.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors">
                🔬 ResearchGate
              </a>
            )}
            <Link href="/admin/sync-publications" className="hidden">ORCID Sync</Link>
          </div>
        )}
      </section>

      <PublicationsClient publications={publications} />
    </div>
  );
}
