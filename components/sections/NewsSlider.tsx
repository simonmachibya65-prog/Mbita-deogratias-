"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: Date | string;
  featuredImage?: string | null;
}

interface NewsSliderProps {
  posts: NewsItem[];
}

export default function NewsSlider({ posts }: NewsSliderProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (posts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % posts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [posts.length]);

  if (posts.length === 0) return null;

  const post = posts[current];

  return (
    <div className="relative bg-navy-900 rounded-2xl overflow-hidden min-h-[280px]">
      {/* Background image */}
      {post.featuredImage ? (
        <Image
          src={post.featuredImage}
          alt={post.title}
          fill
          className="object-cover opacity-30"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-navy-900" />
      )}

      {/* Content */}
      <div className="relative z-10 p-8 flex flex-col justify-end h-full min-h-[280px]">
        <span className="text-xs font-semibold text-navy-200 uppercase tracking-widest mb-2">
          Latest News
        </span>
        <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2">{post.title}</h3>
        <p className="text-navy-200 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center text-sm font-semibold text-white bg-primary px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Read More →
        </Link>
      </div>

      {/* Dots */}
      {posts.length > 1 && (
        <div className="absolute bottom-4 right-6 flex gap-2 z-10">
          {posts.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-white w-6" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
