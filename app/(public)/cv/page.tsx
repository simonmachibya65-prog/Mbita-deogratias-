import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AwardCard from "@/components/sections/AwardCard";
import { AwardCategory } from "@prisma/client";
import Link from "next/link";

export const revalidate = 0;

const categoryOrder: AwardCategory[] = ["award", "grant", "fellowship", "honor", "distinction"];
const categoryHeadings: Record<AwardCategory, string> = {
  award: "Awards",
  grant: "Grants & Funding",
  fellowship: "Fellowships",
  honor: "Honors",
  distinction: "Distinctions",
};
const categoryIcons: Record<AwardCategory, string> = {
  award: "🏆",
  grant: "💰",
  fellowship: "🎓",
  honor: "⭐",
  distinction: "🎖️",
};

async function getAwards() {
  try {
    return await prisma.award.findMany({ where: { published: true }, orderBy: { year: "desc" } });
  } catch {
    return [];
  }
}

async function getProfile() {
  try {
    return await prisma.profile.findFirst();
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "CV & Achievements",
    description: "Awards, grants, fellowships, honors, and distinctions. Download the full CV.",
    openGraph: { title: "CV & Achievements", description: "Academic achievements, awards, and curriculum vitae." },
  };
}

export default async function CVPage() {
  const [awards, profile] = await Promise.all([getAwards(), getProfile()]);

  const grouped = categoryOrder.reduce<Record<AwardCategory, typeof awards>>(
    (acc, cat) => { acc[cat] = awards.filter((a) => a.category === cat); return acc; },
    { award: [], grant: [], fellowship: [], honor: [], distinction: [] }
  );

  // Build career timeline from work experience in profile
  const workExperience = Array.isArray(profile?.workExperience)
    ? (profile!.workExperience as Array<{ role: string; organization: string; period: string; description?: string }>)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-bold text-navy-900">CV &amp; Achievements</h1>
        <a
          href={profile?.cvUrl || "/cv.pdf"}
          download="curriculum-vitae.pdf"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download CV
        </a>
      </div>

      {/* ── CAREER TIMELINE ── */}
      {workExperience.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Career Timeline</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary-light" aria-hidden="true" />
            <div className="space-y-6 pl-12">
              {workExperience.map((exp, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-8 w-4 h-4 rounded-full bg-primary border-2 border-white shadow-sm" aria-hidden="true" />
                  <div className="bg-white border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-semibold text-navy-900">{exp.role}</p>
                        <p className="text-navy-700">{exp.organization}</p>
                      </div>
                      <span className="text-sm text-navy-500 bg-navy-50 px-3 py-1 rounded-full flex-shrink-0">{exp.period}</span>
                    </div>
                    {exp.description && <p className="text-sm text-navy-600 mt-2">{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── AWARDS BY CATEGORY ── */}
      {categoryOrder.map((category) => {
        const items = grouped[category];
        if (items.length === 0) return null;
        return (
          <section key={category} className="mb-12">
            <h2 className="text-2xl font-semibold text-navy-900 mb-6 flex items-center gap-2">
              <span aria-hidden="true">{categoryIcons[category]}</span>
              {categoryHeadings[category]}
              <span className="text-sm font-normal text-navy-500">({items.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((award) => (
                <AwardCard
                  key={award.id}
                  id={award.id}
                  name={award.name}
                  organization={award.organization}
                  year={award.year}
                  category={award.category}
                  amount={award.amount}
                  fundingPeriod={award.fundingPeriod}
                  description={award.description}
                  imageUrl={award.imageUrl}
                />
              ))}
            </div>
          </section>
        );
      })}

      {awards.length === 0 && (
        <p className="text-center text-gray-600 py-12">No achievements listed at this time.</p>
      )}

      {/* Link to About for skills */}
      <div className="mt-8 p-6 bg-navy-50 rounded-xl text-center">
        <p className="text-navy-700 mb-3">Looking for skills, education, and professional background?</p>
        <Link href="/about" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm font-medium">
          View Full Profile →
        </Link>
      </div>
    </div>
  );
}
