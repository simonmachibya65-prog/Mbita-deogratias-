import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProfessorAvatar from "@/components/ui/ProfessorAvatar";
import StatsCounter from "@/components/sections/StatsCounter";
import NewsSlider from "@/components/sections/NewsSlider";
import TestimonialCard from "@/components/sections/TestimonialCard";
import HomeSearch from "@/components/sections/HomeSearch";
import { getPhotoForSlot } from "@/lib/profilePhotos";

interface AcademicProfile {
  label: string;
  url: string;
}

export const revalidate = 0;
export const dynamic = "force-dynamic";

async function getHomeData() {
  try {
    const [profile, settings, recentPosts, upcomingEvents, recentPubs, testimonials, announcements, stats, researchHighlights, achievements] =
      await Promise.all([
        prisma.profile.findFirst(),
        prisma.siteSettings.findFirst(),
        prisma.blogPost.findMany({
          where: { draft: false },
          orderBy: { publishedAt: "desc" },
          take: 5,
          select: { id: true, title: true, slug: true, publishedAt: true, excerpt: true, featuredImage: true },
        }),
        prisma.event.findMany({
          where: { published: true, date: { gte: new Date() } },
          orderBy: { date: "asc" },
          take: 3,
        }),
        prisma.publication.findMany({
          where: { published: true },
          orderBy: { year: "desc" },
          take: 4,
          select: { id: true, title: true, authors: true, venue: true, year: true, type: true, coverImage: true, doi: true, url: true },
        }),
        prisma.testimonial.findMany({
          where: { published: true },
          take: 6,
        }),
        prisma.announcement.findMany({
          where: { published: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        Promise.all([
          prisma.publication.count({ where: { published: true } }),
          prisma.researchProject.count({ where: { published: true } }),
          prisma.student.count({ where: { published: true } }),
          prisma.course.count({ where: { published: true } }),
        ]),
        prisma.researchProject.findMany({
          where: { published: true, status: "active" },
          orderBy: { startYear: "desc" },
          take: 3,
          select: { id: true, slug: true, title: true, description: true, status: true, imageUrl: true, tags: true },
        }),
        prisma.award.findMany({
          where: { published: true },
          orderBy: { year: "desc" },
          take: 4,
          select: { id: true, name: true, organization: true, year: true, category: true, imageUrl: true },
        }),
      ]);

    return { profile, settings, recentPosts, upcomingEvents, recentPubs, testimonials, announcements, stats, researchHighlights, achievements };
  } catch {
    return { profile: null, settings: null, recentPosts: [], upcomingEvents: [], recentPubs: [], testimonials: [], announcements: [], stats: [0, 0, 0, 0], researchHighlights: [], achievements: [] };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getHomeData();
  if (!profile) return { title: "Home", description: "Professor personal website" };
  return {
    title: "Home",
    description: `${profile.fullName} — ${profile.title} at ${profile.institution}. ${profile.bio.substring(0, 150)}...`,
    openGraph: {
      title: `${profile.fullName} — ${profile.title}`,
      description: profile.bio.substring(0, 200),
      type: "profile",
      images: profile.photoUrl ? [{ url: profile.photoUrl }] : [],
    },
  };
}

export default async function HomePage() {
  const { profile, settings, recentPosts, upcomingEvents, recentPubs, testimonials, announcements, stats, researchHighlights, achievements } =
    await getHomeData();

  const academicProfiles = Array.isArray(profile?.academicProfiles) ? profile!.academicProfiles : [];
  const [pubCount, researchCount, studentCount, courseCount] = stats;

  const statItems = [
    { label: "Publications", value: pubCount },
    { label: "Research Projects", value: researchCount },
    { label: "Students Supervised", value: studentCount },
    { label: "Courses Taught", value: courseCount },
  ];

  const heroVideoUrl = settings?.heroVideoUrl;
  const heroImageUrl = settings?.heroImageUrl;
  // Use hero-specific photo slot for the homepage hero
  const heroPhoto = getPhotoForSlot(profile, "hero");

  // Section visibility from settings (default all true)
  const show = {
    announcements: settings?.showAnnouncements ?? true,
    stats: settings?.showStats ?? true,
    newsSlider: settings?.showNewsSlider ?? true,
    upcomingEvents: settings?.showUpcomingEvents ?? true,
    publications: settings?.showPublications ?? true,
    testimonials: settings?.showTestimonials ?? true,
    researchHighlights: settings?.showResearchHighlights ?? true,
    achievements: settings?.showAchievements ?? true,
    quickLinks: settings?.showQuickLinks ?? true,
  };

  // Hero text overrides
  const heroTitle = settings?.heroTitle || profile?.fullName || "Professor";
  const heroSubtitle = settings?.heroSubtitle || null;
  const heroCTAText = settings?.heroCTAText || "Get in Touch";
  const heroCTALink = settings?.heroCTALink || "/contact";

  return (
    <div className="min-h-screen">
      {/* ── HERO SECTION ── */}
      <section className="relative bg-navy-900 text-white overflow-hidden min-h-[520px] flex items-center">
        {/* Background video or image */}
        {heroVideoUrl ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            aria-hidden="true"
          >
            <source src={heroVideoUrl} type="video/mp4" />
          </video>
        ) : heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt="Hero background"
            fill
            className="object-cover opacity-20"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-primary" />
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Profile photo */}
            <div className="flex-shrink-0">
              <div className="ring-4 ring-white/20 rounded-full">
                <ProfessorAvatar
                  photoUrl={heroPhoto || profile?.photoUrl}
                  alt={profile ? `${profile.fullName} — ${profile.title}` : "Professor"}
                  width={220}
                  height={220}
                  className="shadow-2xl"
                />
              </div>
            </div>

            {/* Profile info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                {heroTitle}
              </h1>
              <p className="text-xl text-navy-200 mb-1">{heroSubtitle ?? profile?.title}</p>
              <p className="text-lg text-navy-300 mb-1">{profile?.department}</p>
              <p className="text-lg text-navy-300 mb-6">{profile?.institution}</p>

              <p className="text-navy-200 leading-relaxed max-w-2xl mb-8">
                {profile?.bio.substring(0, 280)}{profile && profile.bio.length > 280 && "..."}
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <a
                  href={profile?.cvUrl || "/cv.pdf"}
                  download="curriculum-vitae.pdf"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-navy-900 font-semibold rounded-lg hover:bg-navy-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download CV
                </a>
                <Link
                  href={heroCTALink}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {heroCTAText}
                </Link>
              </div>

              {/* Academic profile links */}
              {academicProfiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start">
                  {(academicProfiles as unknown as AcademicProfile[]).map((ap, i) => {
                    const url = ap.url.toLowerCase();
                    const label = ap.label.toLowerCase();

                    // Detect platform from URL or label
                    const isScholar = url.includes("scholar.google") || label.includes("scholar");
                    const isOrcid = url.includes("orcid.org") || label.includes("orcid");
                    const isResearchGate = url.includes("researchgate") || label.includes("researchgate");
                    const isLinkedIn = url.includes("linkedin.com") || label.includes("linkedin");
                    const isGitHub = url.includes("github.com") || label.includes("github");
                    const isTwitter = url.includes("twitter.com") || url.includes("x.com") || label.includes("twitter");
                    const isScopus = url.includes("scopus.com") || label.includes("scopus");
                    const isSemanticScholar = url.includes("semanticscholar") || label.includes("semantic");
                    const isAcademia = url.includes("academia.edu") || label.includes("academia");
                    const isPubMed = url.includes("pubmed") || label.includes("pubmed");
                    const isWebOfScience = url.includes("webofscience") || url.includes("wos") || label.includes("web of science");
                    const isMendeley = url.includes("mendeley") || label.includes("mendeley");
                    const isIEEE = url.includes("ieee.org") || label.includes("ieee");
                    const isArxiv = url.includes("arxiv.org") || label.includes("arxiv");

                    let icon: React.ReactNode;
                    let bgClass: string;

                    if (isScholar) {
                      bgClass = "bg-blue-600/80 hover:bg-blue-600";
                      icon = (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                          <path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l4.838 3.94A8 8 0 0 1 12 10a8 8 0 0 1 7.162 3.44L24 9.5z"/>
                        </svg>
                      );
                    } else if (isOrcid) {
                      bgClass = "bg-green-600/80 hover:bg-green-600";
                      icon = (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                          <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 3.872-2.484 3.872-3.722 0-2.016-1.284-3.722-3.872-3.722h-2.297z"/>
                        </svg>
                      );
                    } else if (isResearchGate) {
                      bgClass = "bg-teal-600/80 hover:bg-teal-600";
                      icon = (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                          <path d="M19.586 0c-.818 0-1.508.19-2.073.565-.563.377-.97.936-1.213 1.68a12.193 12.193 0 0 0-.39 2.948c0 .68.07 1.335.21 1.965.14.63.36 1.2.66 1.71.3.51.7.92 1.2 1.23.5.31 1.1.47 1.8.47.7 0 1.3-.16 1.8-.47.5-.31.9-.72 1.2-1.23.3-.51.52-1.08.66-1.71.14-.63.21-1.285.21-1.965 0-1.1-.13-2.07-.39-2.948-.26-.877-.67-1.436-1.213-1.68A3.8 3.8 0 0 0 19.586 0zm-7.5 0C5.41 0 0 5.41 0 12.086c0 6.677 5.41 12.086 12.086 12.086 6.677 0 12.086-5.41 12.086-12.086C24.172 5.41 18.763 0 12.086 0zm0 1.5c5.845 0 10.586 4.74 10.586 10.586 0 5.845-4.74 10.586-10.586 10.586C6.24 22.672 1.5 17.931 1.5 12.086 1.5 6.24 6.24 1.5 12.086 1.5z"/>
                        </svg>
                      );
                    } else if (isLinkedIn) {
                      bgClass = "bg-blue-700/80 hover:bg-blue-700";
                      icon = (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      );
                    } else if (isGitHub) {
                      bgClass = "bg-gray-800/80 hover:bg-gray-800";
                      icon = (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                        </svg>
                      );
                    } else if (isTwitter) {
                      bgClass = "bg-sky-500/80 hover:bg-sky-500";
                      icon = (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      );
                    } else if (isScopus) {
                      bgClass = "bg-orange-600/80 hover:bg-orange-600";
                      icon = (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                        </svg>
                      );
                    } else if (isSemanticScholar) {
                      bgClass = "bg-indigo-600/80 hover:bg-indigo-600";
                      icon = (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                          <path d="M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3c4.86-2.34 8-7 8-11.5C20 5.81 16.19 2 11.5 2zm1 14.5h-2v-2h2v2zm0-4h-2c0-3.25 3-3 3-5 0-1.1-.9-2-2-2s-2 .9-2 2h-2c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.5-3 2.75-3 5z"/>
                        </svg>
                      );
                    } else if (isAcademia) {
                      bgClass = "bg-red-600/80 hover:bg-red-600";
                      icon = (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                          <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                        </svg>
                      );
                    } else if (isPubMed) {
                      bgClass = "bg-blue-500/80 hover:bg-blue-500";
                      icon = (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>
                        </svg>
                      );
                    } else if (isWebOfScience) {
                      bgClass = "bg-purple-600/80 hover:bg-purple-600";
                      icon = (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      );
                    } else if (isMendeley) {
                      bgClass = "bg-red-500/80 hover:bg-red-500";
                      icon = (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                          <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2zm-7 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm14 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
                        </svg>
                      );
                    } else if (isIEEE) {
                      bgClass = "bg-blue-800/80 hover:bg-blue-800";
                      icon = (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                          <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                        </svg>
                      );
                    } else if (isArxiv) {
                      bgClass = "bg-red-700/80 hover:bg-red-700";
                      icon = (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
                        </svg>
                      );
                    } else {
                      bgClass = "bg-white/10 hover:bg-white/20";
                      icon = (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                        </svg>
                      );
                    }

                    return (
                      <a
                        key={i}
                        href={ap.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={ap.label}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${bgClass} text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
                      >
                        {icon}
                        {ap.label}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── SEARCH BAR ── */}
        <section className="py-8">
          <HomeSearch />
        </section>

        {/* ── SERVICES WE OFFER ── */}
        {show.announcements && announcements.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">Services We Offer</h2>
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-navy-900">{ann.title}</p>
                    <p className="text-sm text-navy-700 mt-0.5">{ann.content}</p>
                    {ann.link && (
                      <a href={ann.link} className="text-sm text-primary hover:underline mt-1 inline-block" target="_blank" rel="noopener noreferrer">
                        Learn more →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── STATS ── */}
        {show.stats && (
          <section className="mb-16">
            <StatsCounter stats={statItems} />
          </section>
        )}

        {/* ── NEWS SLIDER + UPCOMING EVENTS ── */}
        {(show.newsSlider || show.upcomingEvents) && (
          <section className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* News slider */}
            {show.newsSlider && (
              <div>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">Latest News</h2>
                <NewsSlider posts={recentPosts} />
              </div>
            )}

            {/* Upcoming events */}
            {show.upcomingEvents && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-navy-900">Upcoming Events</h2>
                  <Link href="/events" className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                    View all →
                  </Link>
                </div>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="flex gap-4 p-4 bg-white border border-border rounded-xl hover:shadow-sm transition-shadow">
                        {event.posterImage ? (
                          <Image
                            src={event.posterImage}
                            alt={event.name}
                            width={64}
                            height={64}
                            className="rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-navy-900 truncate">{event.name}</p>
                          <p className="text-sm text-navy-600">
                            {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                          <p className="text-sm text-navy-500 truncate">{event.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-navy-500 text-sm">No upcoming events.</p>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── LATEST PUBLICATIONS ── */}
        {show.publications && recentPubs.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-navy-900">Latest Publications</h2>
              <Link href="/publications" className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentPubs.map((pub) => {
                const authors = Array.isArray(pub.authors) ? (pub.authors as string[]) : [];
                return (
                  <div key={pub.id} className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                    {pub.coverImage ? (
                      <Image
                        src={pub.coverImage}
                        alt={pub.title}
                        width={300}
                        height={160}
                        className="w-full h-36 object-cover"
                      />
                    ) : (
                      <div className="w-full h-36 bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center">
                        <svg className="w-10 h-10 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-1">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">{pub.type.replace("_", " ")}</span>
                      <h3 className="text-sm font-semibold text-navy-900 line-clamp-2 mb-1">{pub.title}</h3>
                      <p className="text-xs text-navy-500 mb-2">{authors.slice(0, 2).join(", ")}{authors.length > 2 ? " et al." : ""} · {pub.year}</p>
                      <p className="text-xs text-navy-400 line-clamp-1 mb-3">{pub.venue}</p>
                      {(pub.doi || pub.url) && (
                        <a
                          href={pub.doi ? `https://doi.org/${pub.doi}` : pub.url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                        >
                          View Publication →
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── TESTIMONIALS ── */}
        {show.testimonials && testimonials.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">What Students Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <TestimonialCard
                  key={t.id}
                  name={t.name}
                  role={t.role}
                  content={t.content}
                  photoUrl={t.photoUrl}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── RESEARCH HIGHLIGHTS ── */}
        {show.researchHighlights && researchHighlights.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-navy-900">Research Highlights</h2>
              <Link href="/research" className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {researchHighlights.map((project) => {
                const tags = Array.isArray(project.tags) ? (project.tags as string[]) : [];
                return (
                  <Link
                    key={project.id}
                    href={`/research/${project.slug}`}
                    className="group bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {project.imageUrl ? (
                      <Image src={project.imageUrl} alt={project.title} width={400} height={160} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-36 bg-gradient-to-br from-primary-light to-navy-100 flex items-center justify-center">
                        <span className="text-4xl" aria-hidden="true">🔬</span>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-primary-light text-primary text-xs rounded-full">{tag}</span>
                        ))}
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                      </div>
                      <h3 className="font-semibold text-navy-900 text-sm line-clamp-2 group-hover:text-primary transition-colors">{project.title}</h3>
                      <p className="text-xs text-navy-500 mt-1 line-clamp-2">{project.description.substring(0, 100)}...</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── ACADEMIC ACHIEVEMENTS ── */}
        {show.achievements && achievements.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-navy-900">Academic Achievements</h2>
              <Link href="/cv" className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((award) => (
                <div key={award.id} className="bg-white border border-border rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                  {award.imageUrl ? (
                    <Image src={award.imageUrl} alt={award.name} width={60} height={60} className="w-14 h-14 object-contain mx-auto mb-3 rounded-lg" />
                  ) : (
                    <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl" aria-hidden="true">
                        {award.category === "award" ? "🏆" : award.category === "grant" ? "💰" : award.category === "fellowship" ? "🎓" : "⭐"}
                      </span>
                    </div>
                  )}
                  <p className="font-semibold text-navy-900 text-xs line-clamp-2">{award.name}</p>
                  <p className="text-navy-500 text-xs mt-0.5">{award.organization}</p>
                  <p className="text-navy-400 text-xs">{award.year}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {show.quickLinks && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Explore</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: "/about", label: "About", icon: "👤", description: "Biography, education, and professional journey" },
              { href: "/research", label: "Research & Projects", icon: "🔬", description: "Current and past research projects" },
              { href: "/publications", label: "Publications", icon: "📄", description: "Academic papers, books, and articles" },
              { href: "/teaching", label: "Teaching & Courses", icon: "🎓", description: "Courses taught and teaching materials" },
              { href: "/students", label: "Students & Supervision", icon: "👥", description: "Current students and alumni" },
              { href: "/contact", label: "Contact", icon: "✉️", description: "Get in touch for collaborations" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-start gap-4 p-5 bg-white border border-border rounded-xl hover:shadow-md hover:border-primary/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="text-2xl flex-shrink-0" aria-hidden="true">{link.icon}</span>
                <div>
                  <h3 className="font-semibold text-navy-900 mb-1">{link.label}</h3>
                  <p className="text-sm text-navy-500">{link.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
        )}

      </div>
    </div>
  );
}
