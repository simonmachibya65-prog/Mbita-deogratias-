"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import PublicationForm from "@/components/forms/admin/PublicationForm";

interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  type: string;
  doi: string | null;
  url: string | null;
  abstract: string | null;
  published: boolean;
}

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  journal: "Journal",
  conference: "Conference",
  book: "Book",
  book_chapter: "Book Chapter",
  technical_report: "Tech Report",
  other: "Other",
};

export default function AdminPublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPub, setEditingPub] = useState<Publication | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
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
    if (selected.size === filteredPublications.length) setSelected(new Set());
    else setSelected(new Set(filteredPublications.map(i => i.id)));
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} items?`)) return;
    const count = selected.size;
    for (const id of Array.from(selected)) {
      await fetch(`/api/admin/publications?id=${id}`, { method: "DELETE" });
    }
    setSelected(new Set());
    showToast("success", `${count} items deleted.`);
    loadPublications();
  };

  const handleBulkStatus = async (published: boolean) => {
    const count = selected.size;
    for (const id of Array.from(selected)) {
      await fetch("/api/admin/publications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, published }),
      });
    }
    setSelected(new Set());
    showToast("success", `${count} items updated.`);
    loadPublications();
  };

  async function handleORCIDSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/sync-publications", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showToast("success", data.message ?? "Sync complete");
        loadPublications();
      } else {
        showToast("error", data.error ?? "Sync failed");
      }
    } catch {
      showToast("error", "Sync failed. Please try again.");
    } finally {
      setSyncing(false);
    }
  }

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  const loadPublications = useCallback(async function () {
    try {
      const res = await fetch("/api/admin/publications");
      const data = await res.json();
      setPublications(data);
    } catch {
      showToast("error", "Failed to load publications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPublications(); }, [loadPublications]);

  // Clear selection when filter changes
  useEffect(() => { setSelected(new Set()); }, [publishedFilter]);

  async function handleSubmit(formData: {
    title: string; authors: string; venue: string; year: number; type: string;
    doi: string; url: string; abstract: string; published: boolean;
  }) {
    setSaving(true);
    const payload = {
      ...formData,
      id: editingPub?.id,
      authors: formData.authors.split(",").map((a) => a.trim()).filter(Boolean),
      doi: formData.doi || undefined,
      url: formData.url || undefined,
    };

    try {
      const res = await fetch("/api/admin/publications", {
        method: editingPub ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        showToast("success", editingPub ? "Publication updated." : "Publication created.");
        setModalOpen(false);
        loadPublications();
      } else {
        showToast("error", data.error ?? "Failed to save publication.");
      }
    } catch {
      showToast("error", "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(pub: Publication) {
    if (!window.confirm(`Delete "${pub.title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/publications?id=${pub.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("success", "Publication deleted.");
        loadPublications();
      } else {
        showToast("error", "Failed to delete publication.");
      }
    } catch {
      showToast("error", "An unexpected error occurred.");
    }
  }

  async function handleTogglePublish(pub: Publication) {
    if (pub.published && !window.confirm(`Unpublish "${pub.title}"? It will be hidden from the public site.`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/publications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pub.id, published: !pub.published }),
      });
      if (res.ok) {
        showToast("success", pub.published ? "Publication unpublished." : "Publication published.");
        loadPublications();
      } else {
        showToast("error", "Failed to update publish status.");
      }
    } catch {
      showToast("error", "An unexpected error occurred.");
    }
  }

  const filteredPublications = publications.filter((pub) => {
    if (publishedFilter === "published") return pub.published;
    if (publishedFilter === "hidden") return !pub.published;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Publications</h2>
          <p className="text-gray-600 mt-1">Manage your publications</p>
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
          <Button
            variant="ghost"
            onClick={handleORCIDSync}
            isLoading={syncing}
            title="Sync publications from ORCID (requires ORCID_ID in .env)"
          >
            {syncing ? "Syncing..." : "🔄 ORCID Sync"}
          </Button>
          <Button variant="primary" onClick={() => { setEditingPub(null); setModalOpen(true); }}>
            + New Publication
          </Button>
        </div>
      </div>

      {toast && (
        <div role="alert" className={[
          "mb-4 p-3 rounded-md text-sm font-medium",
          toast.type === "success" ? "bg-green-50 border border-green-300 text-green-800" : "bg-red-50 border border-red-300 text-red-700",
        ].join(" ")}>
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
      ) : filteredPublications.length === 0 ? (
        <div className="text-center py-12 bg-white border border-border rounded-lg text-gray-500">
          No publications yet.
        </div>
      ) : (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy-50 border-b border-border">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={selected.size === filteredPublications.length && filteredPublications.length > 0} onChange={toggleAll} className="w-4 h-4 rounded border-border" />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800 hidden sm:table-cell">Year</th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800 hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800">Published</th>
                <th className="text-right px-4 py-3 font-semibold text-navy-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPublications.map((pub) => (
                <tr key={pub.id} className="hover:bg-navy-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(pub.id)} onChange={() => toggleSelect(pub.id)} className="w-4 h-4 rounded border-border" />
                  </td>
                  <td className="px-4 py-3 font-medium text-navy-900 max-w-xs truncate">{pub.title}</td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{pub.year}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-navy-100 text-navy-700">
                      {typeLabels[pub.type] ?? pub.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePublish(pub)}
                      className={[
                        "px-2 py-0.5 rounded-full text-xs font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        pub.published ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                      ].join(" ")}
                    >
                      {pub.published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingPub(pub); setModalOpen(true); }}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(pub)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPub ? "Edit Publication" : "New Publication"}
        size="lg"
      >
        <PublicationForm
          initialData={editingPub ? {
            id: editingPub.id,
            title: editingPub.title,
            authors: editingPub.authors.join(", "),
            venue: editingPub.venue,
            year: editingPub.year,
            type: editingPub.type as import("@prisma/client").PublicationType,
            doi: editingPub.doi ?? undefined,
            url: editingPub.url ?? undefined,
            abstract: editingPub.abstract ?? undefined,
            published: editingPub.published,
          } : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          isLoading={saving}
        />
      </Modal>
    </div>
  );
}
