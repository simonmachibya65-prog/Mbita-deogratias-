"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface EventFormData {
  id?: string;
  name: string;
  date: string;
  location: string;
  description: string;
  externalUrl: string;
  posterImage: string;
  registrationUrl: string;
  streamUrl: string;
  published: boolean;
}

interface EventFormProps {
  initialData?: Partial<EventFormData & { date: string | Date }>;
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

function toDatetimeLocal(date: string | Date | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 16);
}

export default function EventForm({ initialData, onSubmit, onCancel, isLoading }: EventFormProps) {
  const [form, setForm] = useState<EventFormData>({
    name: initialData?.name ?? "",
    date: toDatetimeLocal(initialData?.date),
    location: initialData?.location ?? "",
    description: initialData?.description ?? "",
    externalUrl: initialData?.externalUrl ?? "",
    posterImage: initialData?.posterImage ?? "",
    registrationUrl: initialData?.registrationUrl ?? "",
    streamUrl: initialData?.streamUrl ?? "",
    published: initialData?.published ?? true,
  });

  function update(field: keyof EventFormData, value: string | boolean) {
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
        <label htmlFor="ef-name" className="block text-sm font-medium text-navy-800 mb-1">
          Event Name <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input id="ef-name" type="text" value={form.name} onChange={(e) => update("name", e.target.value)} aria-required="true" className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="ef-date" className="block text-sm font-medium text-navy-800 mb-1">
            Date & Time <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input id="ef-date" type="datetime-local" value={form.date} onChange={(e) => update("date", e.target.value)} aria-required="true" className={inputClass} />
        </div>
        <div>
          <label htmlFor="ef-location" className="block text-sm font-medium text-navy-800 mb-1">
            Location <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input id="ef-location" type="text" value={form.location} onChange={(e) => update("location", e.target.value)} aria-required="true" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="ef-description" className="block text-sm font-medium text-navy-800 mb-1">
          Description <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <textarea id="ef-description" rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} aria-required="true" className={inputClass} />
      </div>

      <div>
        <label htmlFor="ef-externalUrl" className="block text-sm font-medium text-navy-800 mb-1">External URL</label>
        <input id="ef-externalUrl" type="url" value={form.externalUrl} onChange={(e) => update("externalUrl", e.target.value)} className={inputClass} />
      </div>

      <div>
        <label htmlFor="ef-posterImage" className="block text-sm font-medium text-navy-800 mb-1">Poster Image URL</label>
        <input id="ef-posterImage" type="url" value={form.posterImage} onChange={(e) => update("posterImage", e.target.value)} placeholder="https://..." className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="ef-registrationUrl" className="block text-sm font-medium text-navy-800 mb-1">Registration URL</label>
          <input id="ef-registrationUrl" type="url" value={form.registrationUrl} onChange={(e) => update("registrationUrl", e.target.value)} placeholder="https://..." className={inputClass} />
        </div>
        <div>
          <label htmlFor="ef-streamUrl" className="block text-sm font-medium text-navy-800 mb-1">Live Stream URL</label>
          <input id="ef-streamUrl" type="url" value={form.streamUrl} onChange={(e) => update("streamUrl", e.target.value)} placeholder="https://..." className={inputClass} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input id="ef-published" type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary" />
        <label htmlFor="ef-published" className="text-sm font-medium text-navy-800">Published (visible on public site)</label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData?.id ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
