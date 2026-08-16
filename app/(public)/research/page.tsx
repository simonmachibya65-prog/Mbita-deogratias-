import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ResearchClient from "@/components/sections/ResearchClient";

export const revalidate = 0;

async function getResearchProjects() {
  try {
    return await prisma.researchProject.findMany({
      where: { published: true },
      orderBy: { startYear: "desc" },
    });
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
  const profile = await getProfile();
  return {
    title: "Research & Projects",
    description: profile
      ? `Research projects and interests of ${profile.fullName}, ${profile.title} at ${profile.institution}.`
      : "Research projects and academic interests.",
    openGraph: {
      title: "Research & Projects",
      description: "Explore research projects and academic interests.",
    },
  };
}

export default async function ResearchPage() {
  const [projects, profile] = await Promise.all([getResearchProjects(), getProfile()]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-navy-900 mb-8">Research &amp; Projects</h1>
      <ResearchClient projects={projects} profileBio={profile?.bio} />
    </div>
  );
}
