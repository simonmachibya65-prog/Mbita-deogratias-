"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/publications?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} role="search" className="max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <label htmlFor="site-search" className="sr-only">Search publications and research</label>
        <input
          id="site-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search publications, research projects..."
          className="w-full px-5 py-3.5 pr-14 rounded-xl border border-border bg-white text-navy-900 placeholder-navy-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-3 p-2 text-navy-500 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
}
