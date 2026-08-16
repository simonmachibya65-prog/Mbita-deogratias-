import Link from "next/link";
import Image from "next/image";
import { validateExcerpt } from "@/lib/blog";

interface BlogPostCardProps {
  id: string;
  title: string;
  slug: string;
  publishedAt: Date | string;
  excerpt: string;
  featuredImage?: string | null;
  tags?: unknown;
}

export default function BlogPostCard({ title, slug, publishedAt, excerpt, featuredImage, tags }: BlogPostCardProps) {
  const safeExcerpt = validateExcerpt(excerpt);
  const date = new Date(publishedAt);
  const tagList = Array.isArray(tags) ? (tags as string[]) : [];

  return (
    <article className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Featured image */}
      {featuredImage ? (
        <Link href={`/blog/${slug}`} tabIndex={-1} aria-hidden="true">
          <Image
            src={featuredImage}
            alt={title}
            width={600}
            height={240}
            className="w-full h-48 object-cover"
          />
        </Link>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center">
          <svg className="w-12 h-12 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Tags */}
        {tagList.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tagList.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-primary-light text-primary text-xs rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="text-base font-semibold text-navy-900 mb-2 line-clamp-2">
          <Link
            href={`/blog/${slug}`}
            className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            {title}
          </Link>
        </h3>

        <p className="text-sm text-navy-600 leading-relaxed flex-1 line-clamp-3">{safeExcerpt}</p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <time dateTime={date.toISOString()} className="text-xs text-navy-400">
            {date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </time>
          <Link
            href={`/blog/${slug}`}
            className="text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            Read more →
          </Link>
        </div>
      </div>
    </article>
  );
}
