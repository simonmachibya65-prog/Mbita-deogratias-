"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface StudentFormData {
  id?: string;
  name: string;
  degreeLevel: "PhD" | "Masters";
  researchTopic: string;
  status: "current" | "alumni";
  thesisTitle: string;
  graduationYear: number | null;
  currentPosition: string;
  profileUrl: string;
  published: boolean;
}

interface StudentFormProps {
  initialData?: Partial<StudentFormData>;
  onSubmit: (data: StudentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function StudentForm({ initialData, onSubmit, onCancel, isLoading }: StudentFormProps) {
  const [form, setForm] = useState<StudentFormData>({
    name: initialData?.name ?? "",
    degreeLevel: initialData?.degreeLevel ?? "PhD",
    researchTopic: initialData?.researchTopic ?? "",
    status: initialData?.status ?? "current",
    thesisTitle: initialData?.thesisTitle ?? "",
    graduationYear: initialData?.graduationYear ?? null,
    currentPosition: initialData?.currentPosition ?? "",
    profileUrl: initialData?.profileUrl ?? "",
    published: initialData?.published ?? true,
  });

  function update(field: keyof StudentFormData, value: string | boolean | number | null) {
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
        <label htmlFor="sf-name" className="block text-sm font-medium text-navy-800 mb-1">
          Name <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input id="sf-name" type="text" value={form.name} onChange={(e) => update("name", e.target.value)} aria-required="true" className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="sf-degreeLevel" className="block text-sm font-medium text-navy-800 mb-1">Degree Level</label>
          <select id="sf-degreeLevel" value={form.degreeLevel} onChange={(e) => update("degreeLevel", e.target.value as "PhD" | "Masters")} className={inputClass}>
            <option value="PhD">PhD</option>
            <option value="Masters">Masters</option>
          </select>
        </div>
        <div>
          <label htmlFor="sf-status" className="block text-sm font-medium text-navy-800 mb-1">Status</label>
          <select id="sf-status" value={form.status} onChange={(e) => update("status", e.target.value as "current" | "alumni")} className={inputClass}>
            <option value="current">Current</option>
            <option value="alumni">Alumni</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="sf-researchTopic" className="block text-sm font-medium text-navy-800 mb-1">
          Research Topic <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input id="sf-researchTopic" type="text" value={form.researchTopic} onChange={(e) => update("researchTopic", e.target.value)} aria-required="true" className={inputClass} />
      </div>

      <div>
        <label htmlFor="sf-thesisTitle" className="block text-sm font-medium text-navy-800 mb-1">Thesis Title</label>
        <input id="sf-thesisTitle" type="text" value={form.thesisTitle} onChange={(e) => update("thesisTitle", e.target.value)} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="sf-graduationYear" className="block text-sm font-medium text-navy-800 mb-1">Graduation Year</label>
          <input id="sf-graduationYear" type="number" min={1900} max={2100} value={form.graduationYear ?? ""} onChange={(e) => update("graduationYear", e.target.value ? parseInt(e.target.value) : null)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="sf-currentPosition" className="block text-sm font-medium text-navy-800 mb-1">Current Position</label>
          <input id="sf-currentPosition" type="text" value={form.currentPosition} onChange={(e) => update("currentPosition", e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="sf-profileUrl" className="block text-sm font-medium text-navy-800 mb-1">Profile URL</label>
        <input id="sf-profileUrl" type="url" value={form.profileUrl} onChange={(e) => update("profileUrl", e.target.value)} className={inputClass} />
      </div>

      <div className="flex items-center gap-2">
        <input id="sf-published" type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary" />
        <label htmlFor="sf-published" className="text-sm font-medium text-navy-800">Published (visible on public site)</label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData?.id ? "Update Student" : "Add Student"}
        </Button>
      </div>
    </form>
  );
}
