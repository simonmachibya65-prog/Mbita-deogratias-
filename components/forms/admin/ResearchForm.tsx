"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";

interface ResearchFormData {
  id?: string;
  slug: string;
  title: string;
  description: string;
  status: "active" | "completed";
  startYear: number;
  endYear: number | null;
  fundingSources: string;
  collaborators: string;
  externalUrl: string;
  published: boolean;
}

interface ResearchFormProps {
  initialData?: Partial<ResearchFormData>;
  onSubmit: (data: ResearchFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function ResearchForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: ResearchFormProps) {
  const currentYear = new Date().getFullYear();

  const [form, setForm] = useState<ResearchFormData>({
    slug: initialData?.slug ?? "",
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    status: initialData?.status ?? "active",
    startYear: initialData?.startYear ?? currentYear,
    endYear: initialData?.endYear ?? null,
    fundingSources: Array.isArray(initialData?.fundingSources)
      ? (initialData.fundingSources as unknown as string[]).join(", ")
      : (initialData?.fundingSources ?? ""),
    collaborators: Array.isArray(initialData?.collaborators)
      ? (initialData.collaborators as unknown as string[]).join(", ")
      : (initialData?.collaborators ?? ""),
    externalUrl: initialData?.externalUrl ?? "",
    published: initialData?.published ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialData?.slug);

  useEffect(() => {
    if (!slugManuallyEdited) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [form.title, slugManuallyEdited]);

  function update(field: keyof ResearchFormData, value: string | number | boolean | null) {
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
        <label htmlFor="rf-title" className="block text-sm font-medium text-navy-800 mb-1">
          Title <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="rf-title"
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          aria-required="true"
          aria-describedby={errors.title ? "rf-title-error" : undefined}
          className={inputClass}
        />
        {errors.title && <p id="rf-title-error" className="mt-1 text-xs text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="rf-slug" className="block text-sm font-medium text-navy-800 mb-1">
          Slug <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="rf-slug"
          type="text"
          value={form.slug}
          onChange={(e) => { setSlugManuallyEdited(true); update("slug", e.target.value); }}
          aria-required="true"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="rf-description" className="block text-sm font-medium text-navy-800 mb-1">
          Description (Markdown) <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <textarea
          id="rf-description"
          rows={5}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          aria-required="true"
          className={`${inputClass} font-mono`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="rf-status" className="block text-sm font-medium text-navy-800 mb-1">
            Status
          </label>
          <select
            id="rf-status"
            value={form.status}
            onChange={(e) => update("status", e.target.value as "active" | "completed")}
            className={inputClass}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label htmlFor="rf-startYear" className="block text-sm font-medium text-navy-800 mb-1">
            Start Year
          </label>
          <input
            id="rf-startYear"
            type="number"
            min={1900}
            max={2100}
            value={form.startYear}
            onChange={(e) => update("startYear", parseInt(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="rf-endYear" className="block text-sm font-medium text-navy-800 mb-1">
          End Year (leave blank if ongoing)
        </label>
        <input
          id="rf-endYear"
          type="number"
          min={1900}
          max={2100}
          value={form.endYear ?? ""}
          onChange={(e) => update("endYear", e.target.value ? parseInt(e.target.value) : null)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="rf-fundingSources" className="block text-sm font-medium text-navy-800 mb-1">
          Funding Sources (comma-separated)
        </label>
        <input
          id="rf-fundingSources"
          type="text"
          value={form.fundingSources}
          onChange={(e) => update("fundingSources", e.target.value)}
          placeholder="NSF, NIH, DARPA"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="rf-collaborators" className="block text-sm font-medium text-navy-800 mb-1">
          Collaborators (comma-separated)
        </label>
        <input
          id="rf-collaborators"
          type="text"
          value={form.collaborators}
          onChange={(e) => update("collaborators", e.target.value)}
          placeholder="Dr. Smith, Prof. Jones"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="rf-externalUrl" className="block text-sm font-medium text-navy-800 mb-1">
          External URL
        </label>
        <input
          id="rf-externalUrl"
          type="url"
          value={form.externalUrl}
          onChange={(e) => update("externalUrl", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="rf-published"
          type="checkbox"
          checked={form.published}
          onChange={(e) => update("published", e.target.checked)}
          className="w-4 h-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary"
        />
        <label htmlFor="rf-published" className="text-sm font-medium text-navy-800">
          Published (visible on public site)
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData?.id ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
