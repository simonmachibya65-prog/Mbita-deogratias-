import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProfessorAvatar from "@/components/ui/ProfessorAvatar";
import rehypeSanitize from "rehype-sanitize";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import Link from "next/link";
import Image from "next/image";
import { getPhotoForSlot } from "@/lib/profilePhotos";

export const revalidate = 0;

interface AcademicProfile {
  label: string;
  url: string;
}

interface EducationItem {
  degree: string;
  institution: string;
  year: string;
  logoUrl?: string;
}

interface WorkExperienceItem {
  role: string;
  organization: string;
  period: string;
  description?: string;
}

interface SkillItem {
  name: string;
  level: number; // 0-100
}

interface CertificationItem {
  name: string;
  issuer: string;
  year: string;
  imageUrl?: string;
}

interface LeadershipItem {
  role: string;
  organization: string;
  period: string;
  description?: string;
}

interface MediaAppearanceItem {
  title: string;
  outlet: string;
  date: string;
  url?: string;
  imageUrl?: string;
  type?: string; // interview, article, podcast, tv
}

async function getProfile() {
  try {
    return await prisma.profile.findFirst();
  } catch {
    return null;
  }
}

async function getAwards() {
  try {
    return await prisma.award.findMany({
      where: { published: true },
      orderBy: { year: "desc" },
      take: 12,
      select: { id: true, name: true, organization: true, year: true, category: true, imageUrl: true },
    });
  } catch {
    return [];
  }
}

async function renderMarkdown(markdown: string): Promise<string> {
  try {
    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(markdown);
    return String(result);
  } catch {
    return `<p>${markdown}</p>`;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  if (!profile) return { title: "About", description: "About the professor" };
  return {
    title: "About",
    description: `Learn more about ${profile.fullName}, ${profile.title} at ${profile.institution}.`,
    openGraph: {
      title: `About — ${profile.fullName}`,
      description: `${profile.fullName} is ${profile.title} at ${profile.institution}.`,
      images: profile.photoUrl ? [{ url: profile.photoUrl }] : [],
    },
  };
}

export default async function AboutPage() {
  const [profile, awards] = await Promise.all([getProfile(), getAwards()]);

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-600">Profile information not available.</p>
      </div>
    );
  }

  const bioHtml = await renderMarkdown(profile.bio);
  const education = Array.isArray(profile.education) ? (profile.education as unknown as EducationItem[]) : [];
  const workExperience = Array.isArray(profile.workExperience) ? (profile.workExperience as unknown as WorkExperienceItem[]) : [];
  const skills = Array.isArray(profile.skills) ? (profile.skills as unknown as SkillItem[]) : [];
  const certifications = Array.isArray(profile.certifications) ? (profile.certifications as unknown as CertificationItem[]) : [];
  const memberships = Array.isArray(profile.memberships) ? (profile.memberships as unknown as string[]) : [];
  const languages = Array.isArray(profile.languages) ? (profile.languages as unknown as string[]) : [];
  const leadershipPositions = Array.isArray(profile.leadershipPositions) ? (profile.leadershipPositions as unknown as LeadershipItem[]) : [];
  const mediaAppearances = Array.isArray(profile.mediaAppearances) ? (profile.mediaAppearances as unknown as MediaAppearanceItem[]) : [];
  const academicProfiles = Array.isArray(profile.academicProfiles) ? (profile.academicProfiles as unknown as AcademicProfile[]) : [];
  // Use about-specific photo slot
  const aboutPhoto = getPhotoForSlot(profile, "about");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-navy-900 mb-10">About</h1>

      {/* ── PROFILE HEADER ── */}
      <section className="flex flex-col md:flex-row gap-8 mb-14">
        <div className="flex-shrink-0 flex flex-col items-center md:items-start gap-4">
          <ProfessorAvatar
            photoUrl={aboutPhoto || profile.photoUrl}
            alt={`${profile.fullName} — ${profile.title}`}
            width={200}
            height={200}
            className="shadow-md"
          />
          <div className="text-center md:text-left">
            <p className="font-bold text-navy-900 text-lg">{profile.fullName}</p>
            <p className="text-navy-700">{profile.title}</p>
            <p className="text-navy-600 text-sm">{profile.department}</p>
            <p className="text-navy-600 text-sm">{profile.institution}</p>
          </div>
          {/* Download CV */}
          <a
            href={profile.cvUrl || "/cv.pdf"}
            download="curriculum-vitae.pdf"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download CV
          </a>

          {/* Academic profile links */}
          {academicProfiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {academicProfiles.map((ap, i) => {
                const url = ap.url.toLowerCase();
                const label = ap.label.toLowerCase();
                const isScholar = url.includes("scholar.google") || label.includes("scholar");
                const isOrcid = url.includes("orcid.org") || label.includes("orcid");
                const isResearchGate = url.includes("researchgate") || label.includes("researchgate");
                const isLinkedIn = url.includes("linkedin.com") || label.includes("linkedin");
                const isScopus = url.includes("scopus.com") || label.includes("scopus");
                const isAcademia = url.includes("academia.edu") || label.includes("academia");
                const isGitHub = url.includes("github.com") || label.includes("github");
                const isTwitter = url.includes("twitter.com") || url.includes("x.com") || label.includes("twitter");

                let bgClass: string;
                let icon: React.ReactNode;

                if (isScholar) {
                  bgClass = "bg-blue-600 hover:bg-blue-700";
                  icon = <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0" aria-hidden="true"><path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l4.838 3.94A8 8 0 0 1 12 10a8 8 0 0 1 7.162 3.44L24 9.5z"/></svg>;
                } else if (isOrcid) {
                  bgClass = "bg-green-600 hover:bg-green-700";
                  icon = <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0" aria-hidden="true"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 3.872-2.484 3.872-3.722 0-2.016-1.284-3.722-3.872-3.722h-2.297z"/></svg>;
                } else if (isResearchGate) {
                  bgClass = "bg-teal-600 hover:bg-teal-700";
                  icon = <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0" aria-hidden="true"><path d="M19.586 0c-.818 0-1.508.19-2.073.565-.563.377-.97.936-1.213 1.68a12.193 12.193 0 0 0-.39 2.948c0 .68.07 1.335.21 1.965.14.63.36 1.2.66 1.71.3.51.7.92 1.2 1.23.5.31 1.1.47 1.8.47.7 0 1.3-.16 1.8-.47.5-.31.9-.72 1.2-1.23.3-.51.52-1.08.66-1.71.14-.63.21-1.285.21-1.965 0-1.1-.13-2.07-.39-2.948-.26-.877-.67-1.436-1.213-1.68A3.8 3.8 0 0 0 19.586 0zm-7.5 0C5.41 0 0 5.41 0 12.086c0 6.677 5.41 12.086 12.086 12.086 6.677 0 12.086-5.41 12.086-12.086C24.172 5.41 18.763 0 12.086 0zm0 1.5c5.845 0 10.586 4.74 10.586 10.586 0 5.845-4.74 10.586-10.586 10.586C6.24 22.672 1.5 17.931 1.5 12.086 1.5 6.24 6.24 1.5 12.086 1.5z"/></svg>;
                } else if (isLinkedIn) {
                  bgClass = "bg-blue-700 hover:bg-blue-800";
                  icon = <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
                } else if (isScopus) {
                  bgClass = "bg-orange-600 hover:bg-orange-700";
                  icon = <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>;
                } else if (isAcademia) {
                  bgClass = "bg-red-600 hover:bg-red-700";
                  icon = <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0" aria-hidden="true"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>;
                } else if (isGitHub) {
                  bgClass = "bg-gray-800 hover:bg-gray-900";
                  icon = <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>;
                } else if (isTwitter) {
                  bgClass = "bg-sky-500 hover:bg-sky-600";
                  icon = <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
                } else {
                  bgClass = "bg-navy-600 hover:bg-navy-700";
                  icon = <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0" aria-hidden="true"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>;
                }

                return (
                  <a
                    key={i}
                    href={ap.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={ap.label}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${bgClass} text-white text-xs font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                  >
                    {icon}
                    {ap.label}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-1">
          {/* Biography */}
          <article
            className="prose prose-navy max-w-none text-navy-700 leading-relaxed mb-6"
            dangerouslySetInnerHTML={{ __html: bioHtml }}
          />

          {/* Vision & Mission */}
          {(profile.vision || profile.mission) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {profile.vision && (
                <div className="p-5 bg-navy-50 rounded-xl border border-navy-100">
                  <h3 className="font-semibold text-navy-900 mb-2 flex items-center gap-2">
                    <span aria-hidden="true">🎯</span> Vision
                  </h3>
                  <p className="text-navy-700 text-sm leading-relaxed">{profile.vision}</p>
                </div>
              )}
              {profile.mission && (
                <div className="p-5 bg-primary-light rounded-xl border border-navy-100">
                  <h3 className="font-semibold text-navy-900 mb-2 flex items-center gap-2">
                    <span aria-hidden="true">🚀</span> Mission
                  </h3>
                  <p className="text-navy-700 text-sm leading-relaxed">{profile.mission}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── VIDEO INTRODUCTION ── */}
      {profile.videoIntroUrl && (
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Video Introduction</h2>
          <div className="aspect-video max-w-3xl rounded-xl overflow-hidden shadow-lg">
            <iframe
              src={profile.videoIntroUrl}
              title="Professor video introduction"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </section>
      )}

      {/* ── EDUCATION HISTORY ── */}
      {education.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Education</h2>
          <div className="relative border-l-2 border-primary-light pl-8 space-y-8">
            {education.map((edu, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[2.6rem] w-4 h-4 rounded-full bg-primary border-2 border-white shadow" aria-hidden="true" />
                <div className="flex items-start gap-4">
                  {edu.logoUrl && (
                    <Image
                      src={edu.logoUrl}
                      alt={edu.institution}
                      width={48}
                      height={48}
                      className="rounded-lg object-contain flex-shrink-0 border border-border bg-white p-1"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-navy-900">{edu.degree}</p>
                    <p className="text-navy-700">{edu.institution}</p>
                    <p className="text-sm text-navy-500">{edu.year}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── WORK EXPERIENCE TIMELINE ── */}
      {workExperience.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Professional Journey</h2>
          <div className="relative border-l-2 border-primary-light pl-8 space-y-8">
            {workExperience.map((exp, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[2.6rem] w-4 h-4 rounded-full bg-accent-blue border-2 border-white shadow" aria-hidden="true" />
                <p className="font-semibold text-navy-900">{exp.role}</p>
                <p className="text-navy-700">{exp.organization}</p>
                <p className="text-sm text-navy-500 mb-1">{exp.period}</p>
                {exp.description && <p className="text-sm text-navy-600">{exp.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── SKILLS ── */}
      {skills.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Skills &amp; Expertise</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skills.map((skill, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-navy-800">{skill.name}</span>
                  <span className="text-sm text-navy-500">{skill.level}%</span>
                </div>
                <div className="w-full bg-navy-100 rounded-full h-2.5" role="progressbar" aria-valuenow={skill.level} aria-valuemin={0} aria-valuemax={100} aria-label={`${skill.name}: ${skill.level}%`}>
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CERTIFICATIONS ── */}
      {certifications.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Certifications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((cert, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white border border-border rounded-xl">
                {cert.imageUrl ? (
                  <Image
                    src={cert.imageUrl}
                    alt={cert.name}
                    width={56}
                    height={56}
                    className="rounded-lg object-contain flex-shrink-0 border border-border bg-white p-1"
                  />
                ) : (
                  <div className="w-14 h-14 bg-accent-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-navy-900 text-sm">{cert.name}</p>
                  <p className="text-navy-600 text-xs">{cert.issuer}</p>
                  <p className="text-navy-400 text-xs">{cert.year}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── MEMBERSHIPS & LANGUAGES ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
        {memberships.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-navy-900 mb-4">Professional Memberships</h2>
            <ul className="space-y-2">
              {memberships.map((m, i) => (
                <li key={i} className="flex items-center gap-2 text-navy-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" aria-hidden="true" />
                  {m}
                </li>
              ))}
            </ul>
          </section>
        )}

        {languages.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-navy-900 mb-4">Languages</h2>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang, i) => (
                <span key={i} className="px-3 py-1.5 bg-navy-100 text-navy-800 text-sm rounded-full font-medium">
                  {lang}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── LEADERSHIP POSITIONS ── */}
      {leadershipPositions.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Leadership Positions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leadershipPositions.map((pos, i) => (
              <div key={i} className="flex items-start gap-4 p-5 bg-white border border-border rounded-xl hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl" aria-hidden="true">👑</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">{pos.role}</p>
                  <p className="text-navy-700 text-sm">{pos.organization}</p>
                  <p className="text-navy-500 text-xs mt-0.5">{pos.period}</p>
                  {pos.description && <p className="text-navy-600 text-sm mt-1">{pos.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── MEDIA APPEARANCES ── */}
      {mediaAppearances.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Media Appearances</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaAppearances.map((media, i) => (
              <div key={i} className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                {media.imageUrl ? (
                  <Image src={media.imageUrl} alt={media.title} width={400} height={160} className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-24 bg-gradient-to-br from-navy-50 to-navy-100 flex items-center justify-center">
                    <span className="text-3xl" aria-hidden="true">
                      {media.type === "podcast" ? "🎙️" : media.type === "tv" ? "📺" : media.type === "interview" ? "🎤" : "📰"}
                    </span>
                  </div>
                )}
                <div className="p-4">
                  {media.type && (
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">{media.type}</span>
                  )}
                  <p className="font-semibold text-navy-900 text-sm mt-1 line-clamp-2">{media.title}</p>
                  <p className="text-navy-600 text-xs mt-0.5">{media.outlet}</p>
                  <p className="text-navy-400 text-xs">{media.date}</p>
                  {media.url && (
                    <a href={media.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-2 inline-block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded">
                      View →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── ACHIEVEMENT GALLERY ── */}
      {awards.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Achievement Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {awards.map((award, i) => (
              <div key={i} className="group bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                {award.imageUrl ? (
                  <div className="relative h-36 overflow-hidden">
                    <Image src={award.imageUrl} alt={award.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 50vw, 25vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs font-semibold line-clamp-2">{award.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-36 bg-gradient-to-br from-amber-50 to-amber-100 flex flex-col items-center justify-center p-3">
                    <span className="text-3xl mb-2" aria-hidden="true">
                      {award.category === "award" ? "🏆" : award.category === "grant" ? "💰" : award.category === "fellowship" ? "🎓" : "⭐"}
                    </span>
                    <p className="text-amber-900 text-xs font-semibold text-center line-clamp-2">{award.name}</p>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-navy-600 text-xs">{award.organization}</p>
                  <p className="text-navy-400 text-xs">{award.year}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── BACK TO HOME ── */}
      <div className="mt-8">
        <Link href="/" className="text-primary hover:underline text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
