"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface CollaboratorFormData {
  id?: string;
  name: string;
  institution: string;
  area: string;
  profileUrl: string;
  type: "individual" | "institution";
  published: boolean;
}

interface CollaboratorFormProps {
  initialData?: Partial<CollaboratorFormData>;
  onSubmit: (data: CollaboratorFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CollaboratorForm({ initialData, onSubmit, onCancel, isLoading }: CollaboratorFormProps) {
  const [form, setForm] = useState<CollaboratorFormData>({
    name: initialData?.name ?? "",
    institution: initialData?.institution ?? "",
    area: initialData?.area ?? "",
    profileUrl: initialData?.profileUrl ?? "",
    type: initialData?.type ?? "individual",
    published: initialData?.published ?? true,
  });

  function update(field: keyof CollaboratorFormData, value: string | boolean) {
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
        <label htmlFor="clf-name" className="block text-sm font-medium text-navy-800 mb-1">
          Name <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input id="clf-name" type="text" value={form.name} onChange={(e) => update("name", e.target.value)} aria-required="true" className={inputClass} />
      </div>

      <div>
        <label htmlFor="clf-institution" className="block text-sm font-medium text-navy-800 mb-1">
          Institution <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input id="clf-institution" type="text" value={form.institution} onChange={(e) => update("institution", e.target.value)} aria-required="true" className={inputClass} />
      </div>

      <div>
        <label htmlFor="clf-area" className="block text-sm font-medium text-navy-800 mb-1">
          Area of Collaboration <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input id="clf-area" type="text" value={form.area} onChange={(e) => update("area", e.target.value)} aria-required="true" className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="clf-type" className="block text-sm font-medium text-navy-800 mb-1">Type</label>
          <select id="clf-type" value={form.type} onChange={(e) => update("type", e.target.value as "individual" | "institution")} className={inputClass}>
            <option value="individual">Individual</option>
            <option value="institution">Institution</option>
          </select>
        </div>
        <div>
          <label htmlFor="clf-profileUrl" className="block text-sm font-medium text-navy-800 mb-1">Profile URL</label>
          <input id="clf-profileUrl" type="url" value={form.profileUrl} onChange={(e) => update("profileUrl", e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input id="clf-published" type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary" />
        <label htmlFor="clf-published" className="text-sm font-medium text-navy-800">Published (visible on public site)</label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData?.id ? "Update Collaborator" : "Add Collaborator"}
        </Button>
      </div>
    </form>
  );
}
