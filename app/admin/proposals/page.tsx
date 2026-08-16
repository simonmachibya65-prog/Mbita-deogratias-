"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

interface Proposal {
  id: string; title: string; description: string; status: string;
  fundingBody?: string | null; amount?: string | null; deadline?: string | null;
  submittedAt?: string | null; notes?: string | null; published: boolean;
}

const STATUS_OPTIONS = ["draft", "submitted", "approved", "rejected"];
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600", submitted: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700",
};

const empty = { title: "", description: "", status: "draft", fundingBody: "", amount: "", deadline: "", submittedAt: "", notes: "", published: false };

export default function ProposalsPage() {
  const [items, setItems] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Proposal | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
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
    if (selected.size === filteredItems.length) setSelected(new Set());
    else setSelected(new Set(filteredItems.map(i => i.id)));
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} items?`)) return;
    const count = selected.size;
    for (const id of Array.from(selected)) {
      await fetch(`/api/admin/proposals?id=${id}`, { method: "DELETE" });
    }
    setSelected(new Set());
    showToast("success", `${count} items deleted.`);
    fetchItems();
  };

  const handleBulkStatusChange = async (status: string) => {
    const count = selected.size;
    for (const id of Array.from(selected)) {
      const item = items.find(i => i.id === id);
      if (item) {
        await fetch("/api/admin/proposals", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, title: item.title, description: item.description, status, fundingBody: item.fundingBody ?? "", amount: item.amount ?? "", deadline: item.deadline ? item.deadline.split("T")[0] : "", submittedAt: item.submittedAt ? item.submittedAt.split("T")[0] : "", notes: item.notes ?? "", published: item.published }),
        });
      }
    }
    setSelected(new Set());
    showToast("success", `${count} items updated to "${status}".`);
    fetchItems();
  };

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/proposals");
    if (res.ok) setItems(await res.json());
    else showToast("error", "Failed to load proposals.");
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Clear selection when filter changes
  useEffect(() => { setSelected(new Set()); }, [statusFilter]);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (item: Proposal) => {
    setEditing(item);
    setForm({ title: item.title, description: item.description, status: item.status, fundingBody: item.fundingBody ?? "", amount: item.amount ?? "", deadline: item.deadline ? item.deadline.split("T")[0] : "", submittedAt: item.submittedAt ? item.submittedAt.split("T")[0] : "", notes: item.notes ?? "", published: item.published });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const method = editing ? "PUT" : "POST";
    const body = editing ? { id: editing.id, ...form } : form;
    const res = await fetch("/api/admin/proposals", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) {
      showToast("success", editing ? "Proposal updated." : "Proposal added.");
      setModalOpen(false);
      fetchItems();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast("error", data.error ?? "Failed to save proposal.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/proposals?id=${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    if (res.ok) {
      showToast("success", "Proposal deleted.");
      fetchItems();
    } else {
      showToast("error", "Failed to delete proposal.");
    }
  };

  const inputClass = "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  const filteredItems = items.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Research Proposals</h1>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button variant="primary" onClick={openCreate}>+ Add Proposal</Button>
        </div>
      </div>

      {toast && (
        <div role="alert" className={`mb-4 p-3 rounded-lg text-sm font-medium ${toast.type === "success" ? "bg-green-50 border border-green-300 text-green-800" : "bg-red-50 border border-red-300 text-red-700"}`}>
          {toast.message}
        </div>
      )}

      {selected.size > 0 && (
        <div className="mb-4 p-3 bg-primary-light border border-primary/20 rounded-xl flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-navy-900">{selected.size} selected</span>
          <button onClick={() => handleBulkStatusChange("draft")} className="px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700">Set Draft</button>
          <button onClick={() => handleBulkStatusChange("submitted")} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">Set Submitted</button>
          <button onClick={() => handleBulkStatusChange("approved")} className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700">Set Approved</button>
          <button onClick={() => handleBulkStatusChange("rejected")} className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700">Set Rejected</button>
          <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-800 text-white text-xs font-medium rounded-lg hover:bg-red-900">Delete Selected</button>
          <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 text-navy-600 text-xs font-medium hover:underline">Clear</button>
        </div>
      )}

      {loading ? <p className="text-navy-500">Loading...</p> : filteredItems.length === 0 ? (
        <p className="text-center text-navy-500 py-12">No proposals yet.</p>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-2">
            <input type="checkbox" checked={selected.size === filteredItems.length && filteredItems.length > 0} onChange={toggleAll} className="w-4 h-4 rounded border-border" />
            <span className="text-xs text-navy-600">Select All</span>
          </div>
          <div className="space-y-3">
            {filteredItems.map(item => (
              <div key={item.id} className={["bg-white border rounded-xl p-5", selected.has(item.id) ? "border-primary ring-2 ring-primary/20" : "border-border"].join(" ")}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 flex-1">
                    <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} className="w-4 h-4 rounded border-border mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-navy-900">{item.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[item.status]}`}>{item.status}</span>
                        {item.published && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Public</span>}
                      </div>
                      <p className="text-navy-600 text-sm line-clamp-2">{item.description}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-navy-500">
                        {item.fundingBody && <span>🏛️ {item.fundingBody}</span>}
                        {item.amount && <span>💰 {item.amount}</span>}
                        {item.deadline && <span>📅 {new Date(item.deadline).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => openEdit(item)}>Edit</Button>
                    <Button variant="danger" onClick={() => setDeleteId(item.id)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Proposal" : "Add Proposal"} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *
            <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={inputClass} />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *
            <textarea required rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={`${inputClass} resize-none`} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className={inputClass}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Funding Body
              <input value={form.fundingBody} onChange={e => setForm(p => ({ ...p, fundingBody: e.target.value }))} className={inputClass} />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount
              <input value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="$50,000" className={inputClass} />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Deadline
              <input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} className={inputClass} />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes
            <textarea rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className={`${inputClass} resize-none`} />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="prop-pub" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} className="w-4 h-4" />
            <label htmlFor="prop-pub" className="text-sm">Show on public site</label>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={saving}>Save</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete">
        <p className="text-navy-700 mb-6">Delete this proposal?</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
