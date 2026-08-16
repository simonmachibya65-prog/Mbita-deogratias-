"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import EventForm from "@/components/forms/admin/EventForm";

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  externalUrl: string | null;
  published: boolean;
}

export const dynamic = "force-dynamic";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [publishedFilter, setPublishedFilter] = useState<"all" | "published" | "hidden">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filteredEvents.length) setSelected(new Set());
    else setSelected(new Set(filteredEvents.map(i => i.id)));
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} items?`)) return;
    const count = selected.size;
    for (const id of Array.from(selected)) {
      await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
    }
    setSelected(new Set());
    showToast("success", `${count} items deleted.`);
    loadEvents();
  };

  const handleBulkStatus = async (published: boolean) => {
    const count = selected.size;
    for (const id of Array.from(selected)) {
      await fetch("/api/admin/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, published }),
      });
    }
    setSelected(new Set());
    showToast("success", `${count} items updated.`);
    loadEvents();
  };

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  const loadEvents = useCallback(async function () {
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      setEvents(data);
    } catch {
      showToast("error", "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  // Clear selection when filter changes
  useEffect(() => { setSelected(new Set()); }, [publishedFilter]);

  async function handleSubmit(formData: {
    name: string; date: string; location: string; description: string; externalUrl: string; published: boolean;
  }) {
    setSaving(true);
    const payload = {
      ...formData,
      id: editingEvent?.id,
      externalUrl: formData.externalUrl || undefined,
    };

    try {
      const res = await fetch("/api/admin/events", {
        method: editingEvent ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        showToast("success", editingEvent ? "Event updated." : "Event created.");
        setModalOpen(false);
        loadEvents();
      } else {
        showToast("error", data.error ?? "Failed to save event.");
      }
    } catch {
      showToast("error", "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(event: Event) {
    if (!window.confirm(`Delete "${event.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/events?id=${event.id}`, { method: "DELETE" });
      if (res.ok) { showToast("success", "Event deleted."); loadEvents(); }
      else showToast("error", "Failed to delete event.");
    } catch { showToast("error", "An unexpected error occurred."); }
  }

  async function handleTogglePublish(event: Event) {
    if (event.published && !window.confirm(`Unpublish "${event.name}"? It will be hidden from the public site.`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: event.id, published: !event.published }),
      });
      if (res.ok) { showToast("success", event.published ? "Event unpublished." : "Event published."); loadEvents(); }
      else showToast("error", "Failed to update publish status.");
    } catch { showToast("error", "An unexpected error occurred."); }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  const filteredEvents = events.filter((event) => {
    if (publishedFilter === "published") return event.published;
    if (publishedFilter === "hidden") return !event.published;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Events</h2>
          <p className="text-gray-600 mt-1">Manage upcoming and past events</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={publishedFilter}
            onChange={(e) => setPublishedFilter(e.target.value as "all" | "published" | "hidden")}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="hidden">Hidden</option>
          </select>
          <Button variant="primary" onClick={() => { setEditingEvent(null); setModalOpen(true); }}>+ New Event</Button>
        </div>
      </div>

      {toast && (
        <div role="alert" className={["mb-4 p-3 rounded-md text-sm font-medium", toast.type === "success" ? "bg-green-50 border border-green-300 text-green-800" : "bg-red-50 border border-red-300 text-red-700"].join(" ")}>
          {toast.message}
        </div>
      )}

      {selected.size > 0 && (
        <div className="mb-4 p-3 bg-primary-light border border-primary/20 rounded-xl flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-navy-900">{selected.size} selected</span>
          <button onClick={() => handleBulkStatus(true)} className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700">Set Published</button>
          <button onClick={() => handleBulkStatus(false)} className="px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700">Set Hidden</button>
          <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700">Delete Selected</button>
          <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 text-navy-600 text-xs font-medium hover:underline">Clear</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading…</div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white border border-border rounded-lg text-gray-500">No events yet.</div>
      ) : (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy-50 border-b border-border">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={selected.size === filteredEvents.length && filteredEvents.length > 0} onChange={toggleAll} className="w-4 h-4 rounded border-border" />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800 hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800 hidden md:table-cell">Location</th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800">Published</th>
                <th className="text-right px-4 py-3 font-semibold text-navy-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-navy-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(event.id)} onChange={() => toggleSelect(event.id)} className="w-4 h-4 rounded border-border" />
                  </td>
                  <td className="px-4 py-3 font-medium text-navy-900">{event.name}</td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{formatDate(event.date)}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{event.location}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleTogglePublish(event)} className={["px-2 py-0.5 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", event.published ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"].join(" ")}>
                      {event.published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingEvent(event); setModalOpen(true); }}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(event)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingEvent ? "Edit Event" : "New Event"} size="lg">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <EventForm initialData={(editingEvent ?? undefined) as any} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} isLoading={saving} />
      </Modal>
    </div>
  );
}
