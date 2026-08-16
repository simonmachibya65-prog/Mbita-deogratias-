"use client";

import { useState, useMemo } from "react";
import ResearchCard from "@/components/sections/ResearchCard";
import type { ResearchProject } from "@prisma/client";

interface ResearchClientProps {
  projects: ResearchProject[];
  profileBio?: string;
}

export default function ResearchClient({ projects, profileBio }: ResearchClientProps) {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"" | "active" | "completed">("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title_asc" | "title_desc">("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Derive unique tags and years
  const allTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (Array.isArray(p.tags)) (p.tags as string[]).forEach((t) => set.add(t));
    });
    return [...set].sort();
  }, [projects]);

  const allYears = useMemo(() =>
    Array.from(new Set(projects.map((p) => p.startYear))).sort((a, b) => b - a),
    [projects]
  );

  const activeFilterCount = [selectedStatus, selectedTag, selectedYear, search].filter(Boolean).length;

  const filtered = useMemo(() => {
    let result = projects;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (Array.isArray(p.tags) && (p.tags as string[]).some((t) => t.toLowerCase().includes(q))) ||
        (Array.isArray(p.collaborators) && (p.collaborators as string[]).some((c) => c.toLowerCase().includes(q)))
      );
    }
    if (selectedStatus) result = result.filter((p) => p.status === selectedStatus);
    if (selectedTag) result = result.filter((p) =>
      Array.isArray(p.tags) && (p.tags as string[]).includes(selectedTag)
    );
    if (selectedYear) result = result.filter((p) => p.startYear === parseInt(selectedYear));

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "newest": return b.startYear - a.startYear;
        case "oldest": return a.startYear - b.startYear;
        case "title_asc": return a.title.localeCompare(b.title);
        case "title_desc": return b.title.localeCompare(a.title);
        default: return b.startYear - a.startYear;
      }
    });
  }, [projects, search, selectedStatus, selectedTag, selectedYear, sortBy]);

  const activeCount = projects.filter((p) => p.status === "active").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;

  function clearAll() {
    setSearch(""); setSelectedStatus(""); setSelectedTag(""); setSelectedYear("");
  }

  const selectClass = "px-3 py-2 border border-border rounded-lg text-sm bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-primary w-full";

  return (
    <div>
      {/* Research interests */}
      {profileBio && (
        <section className="mb-10 p-6 bg-gradient-to-br from-navy-50 to-primary-light rounded-2xl border border-navy-100">
          <h2 className="text-xl font-bold text-navy-900 mb-3 flex items-center gap-2">
            <span aria-hidden="true">🔬</span> Research Interests
          </h2>
          <p className="text-navy-700 leading-relaxed">
            {profileBio.substring(0, 400)}{profileBio.length > 400 && "..."}
          </p>
        </section>
      )}

      {/* ── STATS ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Projects", value: projects.length, color: "bg-navy-50 text-navy-900" },
          { label: "Active", value: activeCount, color: "bg-green-50 text-green-800" },
          { label: "Completed", value: completedCount, color: "bg-gray-50 text-gray-700" },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 text-center border border-border`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── SEARCH + TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <label htmlFor="research-search" className="sr-only">Search research projects</label>
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="research-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, tags, collaborators..."
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 border border-border rounded-xl text-sm bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Sort projects">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title_asc">Title: A → Z</option>
          <option value="title_desc">Title: Z → A</option>
        </select>

        <button
          onClick={() => setShowFilters((p) => !p)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "bg-primary text-white border-primary" : "border-border text-navy-700 hover:bg-navy-50"}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-primary text-xs font-bold flex items-center justify-center">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* ── EXPANDED FILTERS ── */}
      {showFilters && (
        <div className="bg-navy-50 border border-border rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">Status
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as typeof selectedStatus)} className={selectClass}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            </label>
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">Tag / Topic
            <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className={selectClass}>
              <option value="">All Tags</option>
              {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            </label>
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">Start Year
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className={selectClass}>
              <option value="">All Years</option>
              {allYears.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            </label>
          </div>
        </div>
      )}

      {/* ── STATUS QUICK FILTERS ── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { val: "", label: `All (${projects.length})` },
          { val: "active", label: `🟢 Active (${activeCount})` },
          { val: "completed", label: `✅ Completed (${completedCount})` },
        ].map((opt) => (
          <button key={opt.val}
            onClick={() => setSelectedStatus(opt.val as typeof selectedStatus)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedStatus === opt.val ? "bg-primary text-white border-primary" : "border-border text-navy-600 hover:border-primary hover:text-primary"}`}>
            {opt.label}
          </button>
        ))}
        {allTags.slice(0, 6).map((tag) => (
          <button key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedTag === tag ? "bg-primary text-white border-primary" : "bg-primary-light text-primary border-primary/20 hover:border-primary"}`}>
            {tag}
          </button>
        ))}
      </div>

      {/* ── RESULTS SUMMARY ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-navy-500">
          Showing <strong className="text-navy-900">{filtered.length}</strong> of {projects.length} projects
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <ResearchCard
              key={project.id}
              id={project.id}
              slug={project.slug}
              title={project.title}
              description={project.description}
              status={project.status}
              externalUrl={project.externalUrl}
              imageUrl={project.imageUrl}
              githubUrl={project.githubUrl}
              teamMembers={project.teamMembers}
              tags={project.tags}
              startYear={project.startYear}
              endYear={project.endYear}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-navy-50 rounded-2xl">
          <svg className="w-12 h-12 text-navy-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-navy-500 font-medium">No projects match your filters.</p>
          <button onClick={clearAll} className="mt-3 text-sm text-primary hover:underline">Clear all filters</button>
        </div>
      )}
    </div>
  );
}
