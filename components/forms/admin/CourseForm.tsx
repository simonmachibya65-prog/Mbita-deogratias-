"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface CourseFormData {
  id?: string;
  name: string;
  code: string;
  term: string;
  status: "active" | "archived";
  syllabusUrl: string;
  externalUrl: string;
  description: string;
  published: boolean;
}

interface CourseFormProps {
  initialData?: Partial<CourseFormData>;
  onSubmit: (data: CourseFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CourseForm({ initialData, onSubmit, onCancel, isLoading }: CourseFormProps) {
  const [form, setForm] = useState<CourseFormData>({
    name: initialData?.name ?? "",
    code: initialData?.code ?? "",
    term: initialData?.term ?? "",
    status: initialData?.status ?? "active",
    syllabusUrl: initialData?.syllabusUrl ?? "",
    externalUrl: initialData?.externalUrl ?? "",
    description: initialData?.description ?? "",
    published: initialData?.published ?? true,
  });

  function update(field: keyof CourseFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  const inputClass =
    "w-full px-3 py-2 border border-border rounded-md text-navy-900 bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cf-name" className="block text-sm font-medium text-navy-800 mb-1">
            Course Name <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input id="cf-name" type="text" value={form.name} onChange={(e) => update("name", e.target.value)} aria-required="true" className={inputClass} />
        </div>
        <div>
          <label htmlFor="cf-code" className="block text-sm font-medium text-navy-800 mb-1">
            Course Code <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input id="cf-code" type="text" value={form.code} onChange={(e) => update("code", e.target.value)} aria-required="true" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cf-term" className="block text-sm font-medium text-navy-800 mb-1">
            Term <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input id="cf-term" type="text" value={form.term} onChange={(e) => update("term", e.target.value)} aria-required="true" placeholder="Fall 2024" className={inputClass} />
        </div>
        <div>
          <label htmlFor="cf-status" className="block text-sm font-medium text-navy-800 mb-1">Status</label>
          <select id="cf-status" value={form.status} onChange={(e) => update("status", e.target.value as "active" | "archived")} className={inputClass}>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="cf-syllabusUrl" className="block text-sm font-medium text-navy-800 mb-1">Syllabus URL</label>
        <input id="cf-syllabusUrl" type="url" value={form.syllabusUrl} onChange={(e) => update("syllabusUrl", e.target.value)} className={inputClass} />
      </div>

      <div>
        <label htmlFor="cf-externalUrl" className="block text-sm font-medium text-navy-800 mb-1">External URL</label>
        <input id="cf-externalUrl" type="url" value={form.externalUrl} onChange={(e) => update("externalUrl", e.target.value)} className={inputClass} />
      </div>

      <div>
        <label htmlFor="cf-description" className="block text-sm font-medium text-navy-800 mb-1">Description</label>
        <textarea id="cf-description" rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} className={inputClass} />
      </div>

      <div className="flex items-center gap-2">
        <input id="cf-published" type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary" />
        <label htmlFor="cf-published" className="text-sm font-medium text-navy-800">Published (visible on public site)</label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData?.id ? "Update Course" : "Create Course"}
        </Button>
      </div>
    </form>
  );
}
