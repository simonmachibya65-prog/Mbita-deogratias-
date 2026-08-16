"use client";

import { useState, useMemo } from "react";
import CourseCard from "@/components/sections/CourseCard";
import AcademicCalendar from "@/components/sections/AcademicCalendar";
import type { Course } from "@prisma/client";

interface TeachingClientProps {
  courses: Course[];
}

export default function TeachingClient({ courses }: TeachingClientProps) {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"" | "active" | "archived">("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name_asc" | "name_desc" | "code_asc">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCalendar, setShowCalendar] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Derive unique terms
  const allTerms = useMemo(() =>
    Array.from(new Set(courses.map((c) => c.term).filter(Boolean))).sort().reverse(),
    [courses]
  );

  const activeFilterCount = [selectedStatus, selectedTerm, search].filter(Boolean).length;

  const filtered = useMemo(() => {
    let result = courses;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q) ||
        c.term.toLowerCase().includes(q)
      );
    }
    if (selectedStatus) result = result.filter((c) => c.status === selectedStatus);
    if (selectedTerm) result = result.filter((c) => c.term === selectedTerm);

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name_asc": return a.name.localeCompare(b.name);
        case "name_desc": return b.name.localeCompare(a.name);
        case "code_asc": return a.code.localeCompare(b.code);
        default: return 0;
      }
    });
  }, [courses, search, selectedStatus, selectedTerm, sortBy]);

  const activeCount = courses.filter((c) => c.status === "active").length;
  const archivedCount = courses.filter((c) => c.status === "archived").length;

  // Calendar events from active courses
  const calendarEvents = useMemo(() =>
    courses
      .filter((c) => c.status === "active")
      .flatMap((course) => {
        const schedule = Array.isArray(course.schedule)
          ? (course.schedule as Array<{ day: string; time: string; room?: string }>)
          : [];
        return schedule.map((s) => ({
          title: `${course.code}: ${course.name}`,
          day: s.day,
          time: s.time,
          room: s.room,
          color: "bg-primary-light text-primary",
        }));
      }),
    [courses]
  );

  function clearAll() {
    setSearch(""); setSelectedStatus(""); setSelectedTerm("");
  }

  const selectClass = "px-3 py-2 border border-border rounded-lg text-sm bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-primary w-full";

  return (
    <div>
      {/* ── STATS ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Courses", value: courses.length, color: "bg-navy-50 text-navy-900" },
          { label: "Active", value: activeCount, color: "bg-green-50 text-green-800" },
          { label: "Archived", value: archivedCount, color: "bg-gray-50 text-gray-700" },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 text-center border border-border`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── CALENDAR TOGGLE ── */}
      {calendarEvents.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowCalendar((p) => !p)}
            className="flex items-center gap-2 text-sm font-medium text-navy-700 hover:text-primary transition-colors mb-3"
          >
            <svg className={`w-4 h-4 transition-transform ${showCalendar ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {showCalendar ? "Hide" : "Show"} Weekly Schedule
          </button>
          {showCalendar && <AcademicCalendar events={calendarEvents} />}
        </div>
      )}

      {/* ── SEARCH + TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <label htmlFor="course-search" className="sr-only">Search courses</label>
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="course-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, term, description..."
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 border border-border rounded-xl text-sm bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Sort courses">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name_asc">Name: A → Z</option>
          <option value="name_desc">Name: Z → A</option>
          <option value="code_asc">Code: A → Z</option>
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

        {/* View toggle */}
        <div className="flex border border-border rounded-xl overflow-hidden">
          <button onClick={() => setViewMode("grid")} aria-label="Grid view"
            className={`px-3 py-2 ${viewMode === "grid" ? "bg-primary text-white" : "text-navy-500 hover:bg-navy-50"}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button onClick={() => setViewMode("list")} aria-label="List view"
            className={`px-3 py-2 ${viewMode === "list" ? "bg-primary text-white" : "text-navy-500 hover:bg-navy-50"}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── EXPANDED FILTERS ── */}
      {showFilters && (
        <div className="bg-navy-50 border border-border rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">Status
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as typeof selectedStatus)} className={selectClass}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            </label>
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy-600 uppercase tracking-wide mb-1">Academic Term
            <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className={selectClass}>
              <option value="">All Terms</option>
              {allTerms.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            </label>
          </div>
        </div>
      )}

      {/* ── STATUS QUICK FILTERS ── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { val: "", label: `All (${courses.length})` },
          { val: "active", label: `🟢 Active (${activeCount})` },
          { val: "archived", label: `📦 Archived (${archivedCount})` },
        ].map((opt) => (
          <button key={opt.val}
            onClick={() => setSelectedStatus(opt.val as typeof selectedStatus)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedStatus === opt.val ? "bg-primary text-white border-primary" : "border-border text-navy-600 hover:border-primary hover:text-primary"}`}>
            {opt.label}
          </button>
        ))}
        {allTerms.slice(0, 5).map((term) => (
          <button key={term}
            onClick={() => setSelectedTerm(selectedTerm === term ? "" : term)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedTerm === term ? "bg-primary text-white border-primary" : "bg-navy-50 text-navy-600 border-border hover:border-primary hover:text-primary"}`}>
            {term}
          </button>
        ))}
      </div>

      {/* ── RESULTS SUMMARY ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-navy-500">
          Showing <strong className="text-navy-900">{filtered.length}</strong> of {courses.length} courses
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
        <div className={viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              name={course.name}
              code={course.code}
              term={course.term}
              status={course.status}
              syllabusUrl={course.syllabusUrl}
              externalUrl={course.externalUrl}
              description={course.description}
              bannerImage={course.bannerImage}
              zoomUrl={course.zoomUrl}
              classroomUrl={course.classroomUrl}
              schedule={course.schedule}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-navy-50 rounded-2xl">
          <svg className="w-12 h-12 text-navy-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-navy-500 font-medium">No courses match your filters.</p>
          <button onClick={clearAll} className="mt-3 text-sm text-primary hover:underline">Clear all filters</button>
        </div>
      )}
    </div>
  );
}
