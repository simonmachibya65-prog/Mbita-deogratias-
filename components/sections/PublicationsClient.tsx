"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import PublicationCard from "@/components/sections/PublicationCard";

interface Publication {
  id: string;
  title: string;
  authors: unknown;
  venue: string;
  year: number;
  type: "journal" | "conference" | "book" | "book_chapter" | "technical_report" | "other";
  doi: string | null;
  url: string | null;
  abstract: string | null;
  pdfUrl?: string | null;
  coverImage?: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PublicationsClientProps {
  publications: Publication[];
}

const TYPE_LABELS: Record<string, string> = {
  journal: "Journal Article",
  conference: "Conference Paper",
  book: "Book",
  book_chapter: "Book Chapter",
  technical_report: "Technical Report",
  other: "Other",
};

const TYPE_COLORS: Record<string, string> = {
  journal: "bg-blue-100 text-blue-800 border-blue-200",
  conference: "bg-green-100 text-green-800 border-green-200",
  book: "bg-purple-100 text-purple-800 border-purple-200",
  book_chapter: "bg-amber-100 text-amber-800 border-amber-200",
  technical_report: "bg-red-100 text-red-800 border-red-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function PublicationsClient({ publications }: PublicationsClientProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");
  const [sortBy, setSortBy] = useState<"year_desc" | "year_asc" | "title_asc" | "title_desc">("year_desc");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input — only filter after user stops typing for 200ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  // Derive unique filter options from data
  const years = useMemo(() =>
    Array.from(new Set(publications.map((p) => p.year))).sort((a, b) => b - a),
    [publications]
  );

  const allAuthors = useMemo(() => {
    const set = new Set<string>();
    publications.forEach((p) => {
      if (Array.isArray(p.authors)) (p.authors as string[]).forEach((a) => set.add(a));
    });
    return [...set].sort();
  }, [publications]);

  const venues = useMemo(() =>
    Array.from(new Set(publications.map((p) => p.venue).filter(Boolean))).sort(),
    [publications]
  );

  const activeFilterCount = [selectedType, selectedYear, selectedAuthor, selectedVenue, debouncedSearch]
    .filter(Boolean).length;

  const filtered = useMemo(() => {
    let result = publications;

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        (Array.isArray(p.authors) && (p.authors as string[]).some((a) => a.toLowerCase().includes(q))) ||
        p.venue.toLowerCase().includes(q) ||
        (p.abstract ?? "").toLowerCase().includes(q)
      );
    }
    if (selectedType) result = result.filter((p) => p.type === selectedType);
    if (selectedYear) result = result.filter((p) => p.year === parseInt(selectedYear));
    if (selectedAuthor) result = result.filter((p) =>
      Array.isArray(p.authors) && (p.authors as string[]).some((a) => a === selectedAuthor)
    );
    if (selectedVenue) result = result.filter((p) => p.venue === selectedVenue);

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "year_asc": return a.year - b.year;
        case "year_desc": return b.year - a.year;
        case "title_asc": return a.title.localeCompare(b.title);
        case "title_desc": return b.title.localeCompare(a.title);
        default: return b.year - a.year;
      }
    });
  }, [publications, debouncedSearch, selectedType, selectedYear, selectedAuthor, selectedVenue, sortBy]);

  function clearAll() {
    setSearch(""); setDebouncedSearch(""); setSelectedType(""); setSelectedYear("");
    setSelectedAuthor(""); setSelectedVenue("");
  }

  const selectClass = "px-3 py-2 border border-border rounded-lg text-sm bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div>
      {/* ── SEARCH + TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <label htmlFor="pub-search" className="sr-only">Search publications</label>
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="pub-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, author, venue, abstract..."
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className={selectClass} aria-label="Sort publications">
          <option value="year_desc">Year: Newest first</option>
          <option value="year_asc">Year: Oldest first</option>
          <option value="title_asc">Title: A → Z</option>
          <option value="title_desc">Title: Z → A</option>
        </select>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((p) => !p)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "bg-primary text-white border-primary" : "border-border text-navy-700 hover:bg-navy-50"}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-primary text-xs font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* View toggle */}
        <div className="flex border border-border rounded-xl overflow-hidden">
          <button onClick={() => setViewMode("list")} aria-label="List view"
            className={`px-3 py-2 ${viewMode === "list" ? "bg-primary text-white" : "text-navy-500 hover:bg-navy-50"}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button onClick={() => setViewMode("grid")} aria-label="Grid view"
            className={`px-3 py-2 ${viewMode === "grid" ? "bg-primary text-white" : "text-navy-500 hover:bg-navy-50"}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── EXPANDED FILTERS ── */}
      {showFilters && (
        <div className="bg-navy-50 border border-border rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">Publication Type
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className={`${selectClass} w-full`}>
              <option value="">All Types</option>
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            </label>
          </div>

          {/* Year */}
          <div>
            <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">Year
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className={`${selectClass} w-full`}>
              <option value="">All Years</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            </label>
          </div>

          {/* Author */}
          <div>
            <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">Author
            <select value={selectedAuthor} onChange={(e) => setSelectedAuthor(e.target.value)} className={`${selectClass} w-full`}>
              <option value="">All Authors</option>
              {allAuthors.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            </label>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">Venue / Journal
            <select value={selectedVenue} onChange={(e) => setSelectedVenue(e.target.value)} className={`${selectClass} w-full`}>
              <option value="">All Venues</option>
              {venues.map((v) => <option key={v} value={v} title={v}>{v.length > 35 ? v.slice(0, 35) + "…" : v}</option>)}
            </select>
            </label>
          </div>
        </div>
      )}

      {/* ── TYPE QUICK FILTERS (pill buttons) ── */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setSelectedType("")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${!selectedType ? "bg-primary text-white border-primary" : "border-border text-navy-600 hover:border-primary hover:text-primary"}`}
        >
          All ({publications.length})
        </button>
        {Object.entries(TYPE_LABELS).map(([val, label]) => {
          const count = publications.filter((p) => p.type === val).length;
          if (count === 0) return null;
          return (
            <button
              key={val}
              onClick={() => setSelectedType(selectedType === val ? "" : val)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedType === val ? "bg-primary text-white border-primary" : `${TYPE_COLORS[val]} hover:opacity-80`}`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* ── RESULTS SUMMARY ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-navy-500">
          Showing <strong className="text-navy-900">{filtered.length}</strong> of {publications.length} publications
        </p>
        {activeFilterCount > 0 && (
          <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear all filters
          </button>
        )}
      </div>

      {/* ── RESULTS ── */}
      {filtered.length > 0 ? (
        viewMode === "list" ? (
          <div className="space-y-4">
            {filtered.map((pub) => (
              <PublicationCard
                key={pub.id}
                id={pub.id}
                title={pub.title}
                authors={Array.isArray(pub.authors) ? (pub.authors as string[]) : []}
                venue={pub.venue}
                year={pub.year}
                type={pub.type}
                doi={pub.doi}
                url={pub.url}
                pdfUrl={pub.pdfUrl}
                coverImage={pub.coverImage}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((pub) => (
              <PublicationCard
                key={pub.id}
                id={pub.id}
                title={pub.title}
                authors={Array.isArray(pub.authors) ? (pub.authors as string[]) : []}
                venue={pub.venue}
                year={pub.year}
                type={pub.type}
                doi={pub.doi}
                url={pub.url}
                pdfUrl={pub.pdfUrl}
                coverImage={pub.coverImage}
              />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-16 bg-navy-50 rounded-2xl">
          <svg className="w-12 h-12 text-navy-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-navy-500 font-medium">No publications match your filters.</p>
          <button onClick={clearAll} className="mt-3 text-sm text-primary hover:underline">Clear all filters</button>
        </div>
      )}
    </div>
  );
}
