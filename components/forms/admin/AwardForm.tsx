"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

type AwardCategory = "award" | "grant" | "fellowship" | "honor" | "distinction";

interface AwardFormData {
  id?: string;
  name: string;
  organization: string;
  year: number;
  category: AwardCategory;
  amount: string;
  fundingPeriod: string;
  description: string;
  published: boolean;
}

interface AwardFormProps {
  initialData?: Partial<AwardFormData>;
  onSubmit: (data: AwardFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const categoryOptions: { value: AwardCategory; label: string }[] = [
  { value: "award", label: "Award" },
  { value: "grant", label: "Grant" },
  { value: "fellowship", label: "Fellowship" },
  { value: "honor", label: "Honor" },
  { value: "distinction", label: "Distinction" },
];

export default function AwardForm({ initialData, onSubmit, onCancel, isLoading }: AwardFormProps) {
  const [form, setForm] = useState<AwardFormData>({
    name: initialData?.name ?? "",
    organization: initialData?.organization ?? "",
    year: initialData?.year ?? new Date().getFullYear(),
    category: initialData?.category ?? "award",
    amount: initialData?.amount ?? "",
    fundingPeriod: initialData?.fundingPeriod ?? "",
    description: initialData?.description ?? "",
    published: initialData?.published ?? true,
  });

  function update(field: keyof AwardFormData, value: string | number | boolean) {
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
        <label htmlFor="af-name" className="block text-sm font-medium text-navy-800 mb-1">
          Award Name <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input id="af-name" type="text" value={form.name} onChange={(e) => update("name", e.target.value)} aria-required="true" className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="af-organization" className="block text-sm font-medium text-navy-800 mb-1">
            Organization <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input id="af-organization" type="text" value={form.organization} onChange={(e) => update("organization", e.target.value)} aria-required="true" className={inputClass} />
        </div>
        <div>
          <label htmlFor="af-year" className="block text-sm font-medium text-navy-800 mb-1">
            Year <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input id="af-year" type="number" min={1900} max={2100} value={form.year} onChange={(e) => update("year", parseInt(e.target.value))} aria-required="true" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="af-category" className="block text-sm font-medium text-navy-800 mb-1">Category</label>
        <select id="af-category" value={form.category} onChange={(e) => update("category", e.target.value as AwardCategory)} className={inputClass}>
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="af-amount" className="block text-sm font-medium text-navy-800 mb-1">Amount</label>
          <input id="af-amount" type="text" value={form.amount} onChange={(e) => update("amount", e.target.value)} placeholder="$50,000" className={inputClass} />
        </div>
        <div>
          <label htmlFor="af-fundingPeriod" className="block text-sm font-medium text-navy-800 mb-1">Funding Period</label>
          <input id="af-fundingPeriod" type="text" value={form.fundingPeriod} onChange={(e) => update("fundingPeriod", e.target.value)} placeholder="2022–2025" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="af-description" className="block text-sm font-medium text-navy-800 mb-1">Description</label>
        <textarea id="af-description" rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} className={inputClass} />
      </div>

      <div className="flex items-center gap-2">
        <input id="af-published" type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary" />
        <label htmlFor="af-published" className="text-sm font-medium text-navy-800">Published (visible on public site)</label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData?.id ? "Update Award" : "Add Award"}
        </Button>
      </div>
    </form>
  );
}
