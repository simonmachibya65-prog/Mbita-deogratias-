"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import CollaboratorForm from "@/components/forms/admin/CollaboratorForm";
import ResourceForm from "@/components/forms/admin/ResourceForm";

interface Collaborator {
  id: string;
  name: string;
  institution: string;
  area: string;
  profileUrl: string | null;
  type: "individual" | "institution";
  published: boolean;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string | null;
  published: boolean;
}

export const dynamic = "force-dynamic";

type ActiveTab = "collaborators" | "resources";

export default function AdminCollaborationsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("collaborators");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "individual" | "institution">("all");
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
    const currentItems = activeTab === "collaborators" ? collaborators.filter((c) => typeFilter === "all" || c.type === typeFilter) : resources;
    if (selected.size === currentItems.length) setSelected(new Set());
    else setSelected(new Set(currentItems.map(i => i.id)));
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} items?`)) return;
    const count = selected.size;
    if (activeTab === "collaborators") {
      for (const id of Array.from(selected)) {
        await fetch(`/api/admin/collaborations?id=${id}`, { method: "DELETE" });
      }
    } else {
      for (const id of Array.from(selected)) {
        await fetch(`/api/admin/collaborations?id=${id}&type=resource`, { method: "DELETE" });
      }
    }
    setSelected(new Set());
    showToast("success", `${count} items deleted.`);
    loadData();
  };

  const handleBulkStatus = async (published: boolean) => {
    const count = selected.size;
    if (activeTab === "collaborators") {
      for (const id of Array.from(selected)) {
        await fetch("/api/admin/collaborations", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, published }),
        });
      }
    } else {
      for (const id of Array.from(selected)) {
        await fetch("/api/admin/collaborations?type=resource", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, published }),
        });
      }
    }
    setSelected(new Set());
    showToast("success", `${count} items updated.`);
    loadData();
  };

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  const loadData = useCallback(async function () {
    setLoading(true);
    try {
      const [collabRes, resourceRes] = await Promise.all([
        fetch("/api/admin/collaborations"),
        fetch("/api/admin/collaborations?type=resources"),
      ]);
      setCollaborators(await collabRes.json());
      setResources(await resourceRes.json());
    } catch {
      showToast("error", "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Clear selection when tab or filter changes
  useEffect(() => { setSelected(new Set()); }, [activeTab, typeFilter]);

  // Collaborator handlers
  async function handleCollaboratorSubmit(formData: {
    name: string; institution: string; area: string; profileUrl: string; type: "individual" | "institution"; published: boolean;
  }) {
    setSaving(true);
    const payload = { ...formData, id: editingCollaborator?.id, profileUrl: formData.profileUrl || undefined };
    try {
      const res = await fetch("/api/admin/collaborations", {
        method: editingCollaborator ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) { showToast("success", editingCollaborator ? "Collaborator updated." : "Collaborator added."); setModalOpen(false); loadData(); }
      else showToast("error", data.error ?? "Failed to save collaborator.");
    } catch { showToast("error", "An unexpected error occurred."); }
    finally { setSaving(false); }
  }

  async function handleCollaboratorDelete(c: Collaborator) {
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/collaborations?id=${c.id}`, { method: "DELETE" });
      if (res.ok) { showToast("success", "Collaborator deleted."); loadData(); }
      else showToast("error", "Failed to delete collaborator.");
    } catch { showToast("error", "An unexpected error occurred."); }
  }

  async function handleCollaboratorToggle(c: Collaborator) {
    if (c.published && !window.confirm(`Unpublish "${c.name}"? They will be hidden from the public site.`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/collaborations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, published: !c.published }),
      });
      if (res.ok) { showToast("success", c.published ? "Unpublished." : "Published."); loadData(); }
      else showToast("error", "Failed to update.");
    } catch { showToast("error", "An unexpected error occurred."); }
  }

  // Resource handlers
  async function handleResourceSubmit(formData: {
    title: string; description: string; url: string; category: string; published: boolean;
  }) {
    setSaving(true);
    const payload = { ...formData, id: editingResource?.id, category: formData.category || undefined };
    try {
      const res = await fetch(`/api/admin/collaborations?type=resource`, {
        method: editingResource ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) { showToast("success", editingResource ? "Resource updated." : "Resource added."); setModalOpen(false); loadData(); }
      else showToast("error", data.error ?? "Failed to save resource.");
    } catch { showToast("error", "An unexpected error occurred."); }
    finally { setSaving(false); }
  }

  async function handleResourceDelete(r: Resource) {
    if (!window.confirm(`Delete "${r.title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/collaborations?id=${r.id}&type=resource`, { method: "DELETE" });
      if (res.ok) { showToast("success", "Resource deleted."); loadData(); }
      else showToast("error", "Failed to delete resource.");
    } catch { showToast("error", "An unexpected error occurred."); }
  }

  async function handleResourceToggle(r: Resource) {
    if (r.published && !window.confirm(`Unpublish "${r.title}"? It will be hidden from the public site.`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/collaborations?type=resource", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id, published: !r.published }),
      });
      if (res.ok) { showToast("success", r.published ? "Unpublished." : "Published."); loadData(); }
      else showToast("error", "Failed to update.");
    } catch { showToast("error", "An unexpected error occurred."); }
  }

  const publishBtnClass = (published: boolean) =>
    ["px-2 py-0.5 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      published ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"].join(" ");

  const filteredCollaborators = collaborators.filter((c) => {
    if (typeFilter !== "all" && c.type !== typeFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Collaborations & Resources</h2>
          <p className="text-gray-600 mt-1">Manage collaborators and shared resources</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "collaborators" && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "all" | "individual" | "institution")}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Types</option>
              <option value="individual">Individual</option>
              <option value="institution">Institution</option>
            </select>
          )}
          <Button variant="primary" onClick={() => {
            if (activeTab === "collaborators") { setEditingCollaborator(null); }
            else { setEditingResource(null); }
            setModalOpen(true);
          }}>
            + {activeTab === "collaborators" ? "Add Collaborator" : "Add Resource"}
          </Button>
        </div>
      </div>

      {toast && (
        <div role="alert" className={["mb-4 p-3 rounded-md text-sm font-medium", toast.type === "success" ? "bg-green-50 border border-green-300 text-green-800" : "bg-red-50 border border-red-300 text-red-700"].join(" ")}>
          {toast.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        {(["collaborators", "resources"] as ActiveTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={["px-4 py-2 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              activeTab === tab ? "border-primary text-primary" : "border-transparent text-gray-600 hover:text-navy-900"].join(" ")}
          >
            {tab === "collaborators" ? `Collaborators (${collaborators.length})` : `Resources (${resources.length})`}
          </button>
        ))}
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

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading…</div>
      ) : activeTab === "collaborators" ? (
        filteredCollaborators.length === 0 ? (
          <div className="text-center py-12 bg-white border border-border rounded-lg text-gray-500">No collaborators yet.</div>
        ) : (
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-navy-50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selected.size === filteredCollaborators.length && filteredCollaborators.length > 0} onChange={toggleAll} className="w-4 h-4 rounded border-border" />
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-800">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-800 hidden sm:table-cell">Institution</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-800 hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-800">Published</th>
                  <th className="text-right px-4 py-3 font-semibold text-navy-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCollaborators.map((c) => (
                  <tr key={c.id} className="hover:bg-navy-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="w-4 h-4 rounded border-border" />
                    </td>
                    <td className="px-4 py-3 font-medium text-navy-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{c.institution}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-navy-100 text-navy-700">{c.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleCollaboratorToggle(c)} className={publishBtnClass(c.published)}>
                        {c.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingCollaborator(c); setModalOpen(true); }}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleCollaboratorDelete(c)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        resources.length === 0 ? (
          <div className="text-center py-12 bg-white border border-border rounded-lg text-gray-500">No resources yet.</div>
        ) : (
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-navy-50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selected.size === resources.length && resources.length > 0} onChange={toggleAll} className="w-4 h-4 rounded border-border" />
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-800">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-800 hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-800">Published</th>
                  <th className="text-right px-4 py-3 font-semibold text-navy-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {resources.map((r) => (
                  <tr key={r.id} className="hover:bg-navy-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} className="w-4 h-4 rounded border-border" />
                    </td>
                    <td className="px-4 py-3 font-medium text-navy-900">{r.title}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{r.category ?? "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleResourceToggle(r)} className={publishBtnClass(r.published)}>
                        {r.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingResource(r); setModalOpen(true); }}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleResourceDelete(r)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Collaborator modal */}
      {activeTab === "collaborators" && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCollaborator ? "Edit Collaborator" : "Add Collaborator"} size="lg">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <CollaboratorForm initialData={(editingCollaborator ?? undefined) as any} onSubmit={handleCollaboratorSubmit} onCancel={() => setModalOpen(false)} isLoading={saving} />
        </Modal>
      )}

      {/* Resource modal */}
      {activeTab === "resources" && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingResource ? "Edit Resource" : "Add Resource"} size="lg">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <ResourceForm initialData={(editingResource ?? undefined) as any} onSubmit={handleResourceSubmit} onCancel={() => setModalOpen(false)} isLoading={saving} />
        </Modal>
      )}
    </div>
  );
}
