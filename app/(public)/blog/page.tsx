import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import BlogPostCard from "@/components/sections/BlogPostCard";
import NewsletterForm from "@/components/sections/NewsletterForm";
import Link from "next/link";

export const revalidate = 0;

async function getBlogPosts() {
  try {
    return await prisma.blogPost.findMany({
      where: { draft: false },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://example.com";
  return {
    title: "Blog / News & Events",
    description: "Latest blog posts, news, and academic updates.",
    openGraph: {
      title: "Blog / News & Events",
      description: "Read the latest posts and academic news.",
    },
    alternates: {
      types: { "application/rss+xml": `${baseUrl}/rss.xml` },
    },
  };
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  // Collect all unique tags
  const allTags = Array.from(
    new Set(posts.flatMap((p) => (Array.isArray(p.tags) ? (p.tags as string[]) : [])))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-navy-900">Blog / News &amp; Events</h1>
        <a
          href="/rss.xml"
          className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          aria-label="RSS Feed"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
          </svg>
          RSS
        </a>
      </div>

      {/* Tags filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="text-sm text-navy-500 self-center">Topics:</span>
          {allTags.map((tag) => (
            <span key={tag} className="px-3 py-1 bg-primary-light text-primary text-sm rounded-full font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {posts.map((post) => (
            <BlogPostCard
              key={post.id}
              id={post.id}
              title={post.title}
              slug={post.slug}
              publishedAt={post.publishedAt}
              excerpt={post.excerpt}
              featuredImage={post.featuredImage}
              tags={post.tags}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 py-12">
          No posts have been published yet.
        </p>
      )}

      {/* Newsletter subscription */}
      <div className="max-w-2xl mx-auto mb-8">
        <NewsletterForm />
      </div>

      {/* Events link */}
      <div className="text-center">
        <p className="text-navy-600 mb-3">Looking for academic events?</p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          View All Events →
        </Link>
      </div>
    </div>
  );
}
