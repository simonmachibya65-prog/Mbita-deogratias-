import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import GalleryClient from "@/components/sections/GalleryClient";

export const revalidate = 0;

async function getGalleryItems() {
  try {
    const items = await prisma.galleryItem.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
    return items;
  } catch {
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Gallery",
    description: "Photo gallery from academic activities, lab work, conferences, and events.",
    openGraph: {
      title: "Gallery",
      description: "Photos from academic activities and events.",
    },
  };
}

export default async function GalleryPage() {
  const items = await getGalleryItems();

  // Extract unique categories for filter controls
  const categories = Array.from(new Set(items.map((item) => item.category))).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-navy-900 mb-8">Gallery</h1>

      <GalleryClient items={items} categories={categories} />
    </div>
  );
}
