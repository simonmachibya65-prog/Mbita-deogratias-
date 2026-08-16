"use client";

import { ChangeEvent } from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterLabel?: string;
  className?: string;
}

export default function SearchFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  searchLabel = "Search",
  filterValue,
  onFilterChange,
  filterOptions,
  filterLabel = "Filter by type",
  className = "",
}: SearchFilterProps) {
  return (
    <div
      className={["flex flex-col sm:flex-row gap-3", className].join(" ")}
      role="search"
    >
      {/* Search input */}
      <div className="flex-1">
        <label htmlFor="search-input" className="sr-only">
          {searchLabel}
        </label>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            id="search-input"
            type="search"
            value={searchValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onSearchChange(e.target.value)
            }
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-navy-900 placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Filter select */}
      {filterOptions && onFilterChange && (
        <div>
          <label htmlFor="filter-select" className="sr-only">
            {filterLabel}
          </label>
          <select
            id="filter-select"
            value={filterValue}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onFilterChange(e.target.value)
            }
            className="w-full sm:w-auto px-4 py-2 border border-border rounded-md text-navy-900 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="">All types</option>
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
