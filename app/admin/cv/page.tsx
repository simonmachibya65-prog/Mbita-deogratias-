"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import AwardForm from "@/components/forms/admin/AwardForm";

interface Award {
  id: string;
  name: string;
  organization: string;
  year: number;
  category: string;
  amount: string | null;
  fundingPeriod: string | null;
  description: string | null;
  published: boolean;
}

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, string> = {
  award: "Award",
  grant: "Grant",
  fellowship: "Fellowship",
  honor: "Honor",
  distinction: "Distinction",
};

export default function AdminCVPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const cvInputRef = useRef<HTMLInputElement>(null);
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
    if (selected.size === filteredAwards.length) setSelected(new Set());
    else setSelected(new Set(filteredAwards.map(i => i.id)));
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} items?`)) return;
    const count = selected.size;
    for (const id of Array.from(selected)) {
      await fetch(`/api/admin/cv?id=${id}`, { method: "DELETE" });
    }
    setSelected(new Set());
    showToast("success", `${count} items deleted.`);
    loadAwards();
  };

  const handleBulkStatus = async (published: boolean) => {
    const count = selected.size;
    for (const id of Array.from(selected)) {
      await fetch("/api/admin/cv", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, published }),
      });
    }
    setSelected(new Set());
    showToast("success", `${count} items updated.`);
    loadAwards();
  };

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  const loadAwards = useCallback(async function () {
    try {
      const res = await fetch("/api/admin/cv");
      const data = await res.json();
      setAwards(data);
    } catch {
      showToast("error", "Failed to load awards.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAwards(); }, [loadAwards]);

  // Clear selection when filter changes
  useEffect(() => { setSelected(new Set()); }, [categoryFilter]);

  async function handleSubmit(formData: {
    name: string; organization: string; year: number; category: string;
    amount: string; fundingPeriod: string; description: string; published: boolean;
  }) {
    setSaving(true);
    const payload = {
      ...formData,
      id: editingAward?.id,
      amount: formData.amount || undefined,
      fundingPeriod: formData.fundingPeriod || undefined,
      description: formData.description || undefined,
    };

    try {
      const res = await fetch("/api/admin/cv", {
        method: editingAward ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        showToast("success", editingAward ? "Award updated." : "Award added.");
        setModalOpen(false);
        loadAwards();
      } else {
        showToast("error", data.error ?? "Failed to save award.");
      }
    } catch {
      showToast("error", "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(award: Award) {
    if (!window.confirm(`Delete "${award.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/cv?id=${award.id}`, { method: "DELETE" });
      if (res.ok) { showToast("success", "Award deleted."); loadAwards(); }
      else showToast("error", "Failed to delete award.");
    } catch { showToast("error", "An unexpected error occurred."); }
  }

  async function handleTogglePublish(award: Award) {
    if (award.published && !window.confirm(`Unpublish "${award.name}"? It will be hidden from the public site.`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/cv", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: award.id, published: !award.published }),
      });
      if (res.ok) { showToast("success", award.published ? "Award unpublished." : "Award published."); loadAwards(); }
      else showToast("error", "Failed to update publish status.");
    } catch { showToast("error", "An unexpected error occurred."); }
  }

  async function handleCVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCV(true);
    const formData = new FormData();
    formData.append("cv", file);

    try {
      const res = await fetch("/api/admin/cv", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) showToast("success", "CV uploaded successfully.");
      else showToast("error", data.error ?? "Failed to upload CV.");
    } catch {
      showToast("error", "An unexpected error occurred.");
    } finally {
      setUploadingCV(false);
    }
  }

  const filteredAwards = awards.filter((award) => {
    if (categoryFilter !== "all" && award.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">CV & Awards</h2>
          <p className="text-gray-600 mt-1">Manage awards, grants, and your CV file</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            <option value="award">Award</option>
            <option value="grant">Grant</option>
            <option value="fellowship">Fellowship</option>
            <option value="honor">Honor</option>
            <option value="distinction">Distinction</option>
          </select>
          <Button variant="primary" onClick={() => { setEditingAward(null); setModalOpen(true); }}>+ Add Award</Button>
        </div>
      </div>

      {toast && (
        <div role="alert" className={["mb-4 p-3 rounded-md text-sm font-medium", toast.type === "success" ? "bg-green-50 border border-green-300 text-green-800" : "bg-red-50 border border-red-300 text-red-700"].join(" ")}>
          {toast.message}
        </div>
      )}

      {/* CV Upload */}
      <div className="bg-white border border-border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-navy-800 mb-3">CV File</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              Current CV: <a href="/cv.pdf" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary-hover">cv.pdf</a>
            </p>
            <p className="text-xs text-gray-400 mt-1">Upload a PDF to replace the current CV file.</p>
          </div>
          <input
            ref={cvInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleCVUpload}
            className="sr-only"
            id="cv-upload"
            aria-label="Upload CV PDF"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={uploadingCV}
            onClick={() => cvInputRef.current?.click()}
          >
            {uploadingCV ? "Uploading…" : "Upload CV (PDF)"}
          </Button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 p-3 bg-primary-light border border-primary/20 rounded-xl flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-navy-900">{selected.size} selected</span>
          <button onClick={() => handleBulkStatus(true)} className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700">Set Published</button>
          <button onClick={() => handleBulkStatus(false)} className="px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700">Set Hidden</button>
          <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700">Delete Selected</button>
          <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 text-navy-600 text-xs font-medium hover:underline">Clear</button>
        </div>
      )}

      {/* Awards list */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading…</div>
      ) : filteredAwards.length === 0 ? (
        <div className="text-center py-12 bg-white border border-border rounded-lg text-gray-500">No awards yet.</div>
      ) : (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy-50 border-b border-border">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={selected.size === filteredAwards.length && filteredAwards.length > 0} onChange={toggleAll} className="w-4 h-4 rounded border-border" />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800 hidden sm:table-cell">Organization</th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800 hidden md:table-cell">Year</th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800 hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800">Published</th>
                <th className="text-right px-4 py-3 font-semibold text-navy-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAwards.map((award) => (
                <tr key={award.id} className="hover:bg-navy-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(award.id)} onChange={() => toggleSelect(award.id)} className="w-4 h-4 rounded border-border" />
                  </td>
                  <td className="px-4 py-3 font-medium text-navy-900">{award.name}</td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{award.organization}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{award.year}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-navy-100 text-navy-700">
                      {categoryLabels[award.category] ?? award.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleTogglePublish(award)} className={["px-2 py-0.5 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", award.published ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"].join(" ")}>
                      {award.published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingAward(award); setModalOpen(true); }}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(award)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingAward ? "Edit Award" : "Add Award"} size="lg">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <AwardForm initialData={(editingAward ?? undefined) as any} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} isLoading={saving} />
      </Modal>
    </div>
  );
}
