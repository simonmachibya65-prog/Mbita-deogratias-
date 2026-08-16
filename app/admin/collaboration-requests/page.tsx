"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

interface CollabRequest {
  id: string;
  name: string;
  email: string;
  institution: string;
  area: string;
  message: string;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function CollabRequestsPage() {
  const [items, setItems] = useState<CollabRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CollabRequest | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/collaboration-requests");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/admin/collaboration-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchItems();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/admin/collaboration-requests?id=${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchItems();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-navy-900 mb-6">Collaboration Requests</h1>

      {loading ? (
        <p className="text-navy-500">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-navy-500 text-center py-12">No collaboration requests yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-navy-900">{item.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[item.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-navy-500">{item.email} · {item.institution}</p>
                  <p className="text-sm text-navy-600 mt-1"><span className="font-medium">Area:</span> {item.area}</p>
                  <p className="text-sm text-navy-600 mt-1 line-clamp-2">{item.message}</p>
                  <p className="text-xs text-navy-400 mt-2">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button variant="ghost" onClick={() => setSelected(item)}>View</Button>
                  {item.status === "pending" && (
                    <>
                      <Button variant="primary" onClick={() => updateStatus(item.id, "approved")}>Approve</Button>
                      <Button variant="danger" onClick={() => updateStatus(item.id, "rejected")}>Reject</Button>
                    </>
                  )}
                  <Button variant="danger" onClick={() => setDeleteId(item.id)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Collaboration Request">
        {selected && (
          <div className="space-y-3">
            <div><p className="text-xs text-navy-500 uppercase tracking-wide">Name</p><p className="font-medium">{selected.name}</p></div>
            <div><p className="text-xs text-navy-500 uppercase tracking-wide">Email</p><p>{selected.email}</p></div>
            <div><p className="text-xs text-navy-500 uppercase tracking-wide">Institution</p><p>{selected.institution}</p></div>
            <div><p className="text-xs text-navy-500 uppercase tracking-wide">Area</p><p>{selected.area}</p></div>
            <div><p className="text-xs text-navy-500 uppercase tracking-wide">Message</p><p className="text-navy-700 leading-relaxed">{selected.message}</p></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
              <a href={`mailto:${selected.email}`} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
                Reply by Email
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete">
        <p className="text-navy-700 mb-6">Delete this collaboration request?</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
