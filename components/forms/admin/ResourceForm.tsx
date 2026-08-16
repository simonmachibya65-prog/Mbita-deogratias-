"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface ResourceFormData {
  id?: string;
  title: string;
  description: string;
  url: string;
  category: string;
  published: boolean;
}

interface ResourceFormProps {
  initialData?: Partial<ResourceFormData>;
  onSubmit: (data: ResourceFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ResourceForm({ initialData, onSubmit, onCancel, isLoading }: ResourceFormProps) {
  const [form, setForm] = useState<ResourceFormData>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    url: initialData?.url ?? "",
    category: initialData?.category ?? "",
    published: initialData?.published ?? true,
  });

  const descLength = form.description.length;

  function update(field: keyof ResourceFormData, value: string | boolean) {
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
      <div>
        <label htmlFor="rrf-title" className="block text-sm font-medium text-navy-800 mb-1">
          Title <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input id="rrf-title" type="text" value={form.title} onChange={(e) => update("title", e.target.value)} aria-required="true" className={inputClass} />
      </div>

      <div>
        <label htmlFor="rrf-description" className="block text-sm font-medium text-navy-800 mb-1">
          Description <span aria-hidden="true" className="text-red-500">*</span>
          <span className={["ml-2 text-xs", descLength > 150 ? "text-red-600" : "text-gray-400"].join(" ")}>
            {descLength}/150
          </span>
        </label>
        <textarea
          id="rrf-description"
          rows={3}
          maxLength={150}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          aria-required="true"
          aria-describedby="rrf-desc-hint"
          className={[inputClass, descLength > 150 ? "border-red-500" : ""].join(" ")}
        />
        <p id="rrf-desc-hint" className="mt-1 text-xs text-gray-400">Maximum 150 characters.</p>
      </div>

      <div>
        <label htmlFor="rrf-url" className="block text-sm font-medium text-navy-800 mb-1">
          URL <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input id="rrf-url" type="url" value={form.url} onChange={(e) => update("url", e.target.value)} aria-required="true" className={inputClass} />
      </div>

      <div>
        <label htmlFor="rrf-category" className="block text-sm font-medium text-navy-800 mb-1">Category</label>
        <input id="rrf-category" type="text" value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="e.g. Dataset, Tool, Software" className={inputClass} />
      </div>

      <div className="flex items-center gap-2">
        <input id="rrf-published" type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary" />
        <label htmlFor="rrf-published" className="text-sm font-medium text-navy-800">Published (visible on public site)</label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData?.id ? "Update Resource" : "Add Resource"}
        </Button>
      </div>
    </form>
  );
}
