"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

type PublicationType = "journal" | "conference" | "book" | "book_chapter" | "technical_report" | "other";

interface PublicationFormData {
  id?: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  type: PublicationType;
  doi: string;
  url: string;
  abstract: string;
  published: boolean;
}

interface PublicationFormProps {
  initialData?: Partial<PublicationFormData & { authors: string[] | string }>;
  onSubmit: (data: PublicationFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const typeOptions: { value: PublicationType; label: string }[] = [
  { value: "journal", label: "Journal Article" },
  { value: "conference", label: "Conference Paper" },
  { value: "book", label: "Book" },
  { value: "book_chapter", label: "Book Chapter" },
  { value: "technical_report", label: "Technical Report" },
  { value: "other", label: "Other" },
];

export default function PublicationForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: PublicationFormProps) {
  const [form, setForm] = useState<PublicationFormData>({
    title: initialData?.title ?? "",
    authors: Array.isArray(initialData?.authors)
      ? (initialData.authors as string[]).join(", ")
      : (initialData?.authors as string ?? ""),
    venue: initialData?.venue ?? "",
    year: initialData?.year ?? new Date().getFullYear(),
    type: initialData?.type ?? "journal",
    doi: initialData?.doi ?? "",
    url: initialData?.url ?? "",
    abstract: initialData?.abstract ?? "",
    published: initialData?.published ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function update(field: keyof PublicationFormData, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    await onSubmit(form);
  }

  const inputClass =
    "w-full px-3 py-2 border border-border rounded-md text-navy-900 bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="pf-title" className="block text-sm font-medium text-navy-800 mb-1">
          Title <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="pf-title"
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          aria-required="true"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="pf-authors" className="block text-sm font-medium text-navy-800 mb-1">
          Authors (comma-separated) <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="pf-authors"
          type="text"
          value={form.authors}
          onChange={(e) => update("authors", e.target.value)}
          aria-required="true"
          placeholder="Smith J., Jones A., Brown K."
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-venue" className="block text-sm font-medium text-navy-800 mb-1">
            Venue <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="pf-venue"
            type="text"
            value={form.venue}
            onChange={(e) => update("venue", e.target.value)}
            aria-required="true"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="pf-year" className="block text-sm font-medium text-navy-800 mb-1">
            Year <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="pf-year"
            type="number"
            min={1900}
            max={2100}
            value={form.year}
            onChange={(e) => update("year", parseInt(e.target.value))}
            aria-required="true"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="pf-type" className="block text-sm font-medium text-navy-800 mb-1">
          Type <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <select
          id="pf-type"
          value={form.type}
          onChange={(e) => update("type", e.target.value as PublicationType)}
          className={inputClass}
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-doi" className="block text-sm font-medium text-navy-800 mb-1">
            DOI
          </label>
          <input
            id="pf-doi"
            type="text"
            value={form.doi}
            onChange={(e) => update("doi", e.target.value)}
            placeholder="10.1234/example"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="pf-url" className="block text-sm font-medium text-navy-800 mb-1">
            URL
          </label>
          <input
            id="pf-url"
            type="url"
            value={form.url}
            onChange={(e) => update("url", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="pf-abstract" className="block text-sm font-medium text-navy-800 mb-1">
          Abstract
        </label>
        <textarea
          id="pf-abstract"
          rows={4}
          value={form.abstract}
          onChange={(e) => update("abstract", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="pf-published"
          type="checkbox"
          checked={form.published}
          onChange={(e) => update("published", e.target.checked)}
          className="w-4 h-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary"
        />
        <label htmlFor="pf-published" className="text-sm font-medium text-navy-800">
          Published (visible on public site)
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData?.id ? "Update Publication" : "Create Publication"}
        </Button>
      </div>
    </form>
  );
}
