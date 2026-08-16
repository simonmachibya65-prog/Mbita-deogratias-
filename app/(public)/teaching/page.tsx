import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import TeachingClient from "@/components/sections/TeachingClient";

export const revalidate = 0;

async function getCourses() {
  try {
    return await prisma.course.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Teaching & Courses",
    description: "Courses taught including active and archived offerings, lecture notes, and materials.",
    openGraph: { title: "Teaching & Courses", description: "Academic courses and teaching activities." },
  };
}

export default async function TeachingPage() {
  const courses = await getCourses();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-navy-900 mb-8">Teaching &amp; Courses</h1>
      <TeachingClient courses={courses} />
    </div>
  );
}
