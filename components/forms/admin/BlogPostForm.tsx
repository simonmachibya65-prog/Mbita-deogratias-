"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";

interface BlogPostFormData {
  id?: string;
  title: string;
  slug: string;
  publishedAt: string;
  excerpt: string;
  content: string;
  tags: string;
  featuredImage: string;
  draft: boolean;
}

interface BlogPostFormProps {
  initialData?: Partial<BlogPostFormData & { tags: string[] | string; publishedAt: string | Date }>;
  onSubmit: (data: BlogPostFormData) => Promise<void>;
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

function toDatetimeLocal(date: string | Date | undefined): string {
  if (!date) return new Date().toISOString().slice(0, 16);
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 16);
}

export default function BlogPostForm({ initialData, onSubmit, onCancel, isLoading }: BlogPostFormProps) {
  const [form, setForm] = useState<BlogPostFormData>({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    publishedAt: toDatetimeLocal(initialData?.publishedAt),
    excerpt: initialData?.excerpt ?? "",
    content: initialData?.content ?? "",
    tags: Array.isArray(initialData?.tags)
      ? (initialData.tags as string[]).join(", ")
      : (initialData?.tags as string ?? ""),
    featuredImage: initialData?.featuredImage ?? "",
    draft: initialData?.draft ?? false,
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialData?.slug);
  const excerptLength = form.excerpt.length;

  useEffect(() => {
    if (!slugManuallyEdited) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [form.title, slugManuallyEdited]);

  function update(field: keyof BlogPostFormData, value: string | boolean) {
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
        <label htmlFor="bpf-title" className="block text-sm font-medium text-navy-800 mb-1">
          Title <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input id="bpf-title" type="text" value={form.title} onChange={(e) => update("title", e.target.value)} aria-required="true" className={inputClass} />
      </div>

      <div>
        <label htmlFor="bpf-slug" className="block text-sm font-medium text-navy-800 mb-1">
          Slug <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="bpf-slug"
          type="text"
          value={form.slug}
          onChange={(e) => { setSlugManuallyEdited(true); update("slug", e.target.value); }}
          aria-required="true"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="bpf-publishedAt" className="block text-sm font-medium text-navy-800 mb-1">
          Published Date <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input id="bpf-publishedAt" type="datetime-local" value={form.publishedAt} onChange={(e) => update("publishedAt", e.target.value)} aria-required="true" className={inputClass} />
      </div>

      <div>
        <label htmlFor="bpf-excerpt" className="block text-sm font-medium text-navy-800 mb-1">
          Excerpt <span aria-hidden="true" className="text-red-500">*</span>
          <span className={["ml-2 text-xs", excerptLength > 200 ? "text-red-600" : "text-gray-400"].join(" ")}>
            {excerptLength}/200
          </span>
        </label>
        <textarea
          id="bpf-excerpt"
          rows={3}
          maxLength={200}
          value={form.excerpt}
          onChange={(e) => update("excerpt", e.target.value)}
          aria-required="true"
          aria-describedby="bpf-excerpt-hint"
          className={[inputClass, excerptLength > 200 ? "border-red-500" : ""].join(" ")}
        />
        <p id="bpf-excerpt-hint" className="mt-1 text-xs text-gray-400">Maximum 200 characters.</p>
      </div>

      <div>
        <label htmlFor="bpf-content" className="block text-sm font-medium text-navy-800 mb-1">
          Content (Markdown) <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <textarea
          id="bpf-content"
          rows={12}
          value={form.content}
          onChange={(e) => update("content", e.target.value)}
          aria-required="true"
          className={`${inputClass} font-mono`}
        />
      </div>

      <div>
        <label htmlFor="bpf-tags" className="block text-sm font-medium text-navy-800 mb-1">
          Tags (comma-separated)
        </label>
        <input id="bpf-tags" type="text" value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="machine learning, AI, research" className={inputClass} />
      </div>

      <div>
        <label htmlFor="bpf-featuredImage" className="block text-sm font-medium text-navy-800 mb-1">
          Featured Image URL
        </label>
        <input id="bpf-featuredImage" type="url" value={form.featuredImage} onChange={(e) => update("featuredImage", e.target.value)} placeholder="https://..." className={inputClass} />
      </div>

      <div className="flex items-center gap-2">
        <input id="bpf-draft" type="checkbox" checked={form.draft} onChange={(e) => update("draft", e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary" />
        <label htmlFor="bpf-draft" className="text-sm font-medium text-navy-800">Save as draft (not visible on public site)</label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData?.id ? "Update Post" : "Create Post"}
        </Button>
      </div>
    </form>
  );
}
