"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";

interface GalleryItemFormData {
  id?: string;
  imageUrl: string;
  alt: string;
  caption: string;
  category: string;
  published: boolean;
}

interface GalleryItemFormProps {
  initialData?: Partial<GalleryItemFormData>;
  onSubmit: (data: GalleryItemFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function GalleryItemForm({ initialData, onSubmit, onCancel, isLoading }: GalleryItemFormProps) {
  const [form, setForm] = useState<GalleryItemFormData>({
    imageUrl: initialData?.imageUrl ?? "",
    alt: initialData?.alt ?? "",
    caption: initialData?.caption ?? "",
    category: initialData?.category ?? "",
    published: initialData?.published ?? true,
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update(field: keyof GalleryItemFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/admin/gallery", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        update("imageUrl", data.imageUrl);
      } else {
        setUploadError(data.error ?? "Failed to upload image.");
      }
    } catch {
      setUploadError("An unexpected error occurred.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  const inputClass =
    "w-full px-3 py-2 border border-border rounded-md text-navy-900 bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image upload / URL */}
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-navy-800 mb-2">Image</label>
        {form.imageUrl && (
          <div className="mb-3 relative w-full h-40 rounded-md overflow-hidden bg-navy-100">
            <Image src={form.imageUrl} alt={form.alt || "Gallery preview"} fill className="object-cover" />
          </div>
        )}
        <div className="flex gap-2">
          <input
            id="imageUrl"
            type="text"
            value={form.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
            placeholder="Image URL or upload below"
            aria-label="Image URL"
            className={`${inputClass} flex-1`}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageUpload}
            className="sr-only"
            id="gif-upload"
            aria-label="Upload gallery image"
          />
          <Button type="button" variant="outline" size="sm" isLoading={uploading} onClick={() => fileInputRef.current?.click()}>
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
        {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
      </div>

      <div>
        <label htmlFor="gif-alt" className="block text-sm font-medium text-navy-800 mb-1">
          Alt Text <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input id="gif-alt" type="text" value={form.alt} onChange={(e) => update("alt", e.target.value)} aria-required="true" className={inputClass} />
      </div>

      <div>
        <label htmlFor="gif-caption" className="block text-sm font-medium text-navy-800 mb-1">
          Caption <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input id="gif-caption" type="text" value={form.caption} onChange={(e) => update("caption", e.target.value)} aria-required="true" className={inputClass} />
      </div>

      <div>
        <label htmlFor="gif-category" className="block text-sm font-medium text-navy-800 mb-1">
          Category <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input id="gif-category" type="text" value={form.category} onChange={(e) => update("category", e.target.value)} aria-required="true" placeholder="e.g. Lab, Conference, Teaching" className={inputClass} />
      </div>

      <div className="flex items-center gap-2">
        <input id="gif-published" type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary" />
        <label htmlFor="gif-published" className="text-sm font-medium text-navy-800">Published (visible on public site)</label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData?.id ? "Update Item" : "Add Item"}
        </Button>
      </div>
    </form>
  );
}
