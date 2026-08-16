"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import BlogPostForm from "@/components/forms/admin/BlogPostForm";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
  excerpt: string;
  content: string;
  tags: string[];
  draft: boolean;
}

export const dynamic = "force-dynamic";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [draftFilter, setDraftFilter] = useState<"all" | "published" | "draft">("all");
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
    if (selected.size === filteredPosts.length) setSelected(new Set());
    else setSelected(new Set(filteredPosts.map(i => i.id)));
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} items?`)) return;
    const count = selected.size;
    for (const id of Array.from(selected)) {
      await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
    }
    setSelected(new Set());
    showToast("success", `${count} items deleted.`);
    loadPosts();
  };

  const handleBulkDraft = async (draft: boolean) => {
    const count = selected.size;
    for (const id of Array.from(selected)) {
      await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, draft }),
      });
    }
    setSelected(new Set());
    showToast("success", `${count} items updated.`);
    loadPosts();
  };

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  const loadPosts = useCallback(async function () {
    try {
      const res = await fetch("/api/admin/blog");
      const data = await res.json();
      setPosts(data);
    } catch {
      showToast("error", "Failed to load blog posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // Clear selection when filter changes
  useEffect(() => { setSelected(new Set()); }, [draftFilter]);

  async function handleSubmit(formData: {
    title: string; slug: string; publishedAt: string; excerpt: string;
    content: string; tags: string; draft: boolean;
  }) {
    setSaving(true);
    const payload = {
      ...formData,
      id: editingPost?.id,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    try {
      const res = await fetch("/api/admin/blog", {
        method: editingPost ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        showToast("success", editingPost ? "Post updated." : "Post created.");
        setModalOpen(false);
        loadPosts();
      } else {
        showToast("error", data.error ?? "Failed to save post.");
      }
    } catch {
      showToast("error", "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(post: BlogPost) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/blog?id=${post.id}`, { method: "DELETE" });
      if (res.ok) { showToast("success", "Post deleted."); loadPosts(); }
      else showToast("error", "Failed to delete post.");
    } catch { showToast("error", "An unexpected error occurred."); }
  }

  async function handleToggleDraft(post: BlogPost) {
    try {
      const res = await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, draft: !post.draft }),
      });
      if (res.ok) { showToast("success", post.draft ? "Post published." : "Post moved to draft."); loadPosts(); }
      else showToast("error", "Failed to update post status.");
    } catch { showToast("error", "An unexpected error occurred."); }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  const filteredPosts = posts.filter((post) => {
    if (draftFilter === "published") return !post.draft;
    if (draftFilter === "draft") return post.draft;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Blog Posts</h2>
          <p className="text-gray-600 mt-1">Manage your blog posts and news</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={draftFilter}
            onChange={(e) => setDraftFilter(e.target.value as "all" | "published" | "draft")}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <Button variant="primary" onClick={() => { setEditingPost(null); setModalOpen(true); }}>+ New Post</Button>
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
          <button onClick={() => handleBulkDraft(false)} className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700">Set Published</button>
          <button onClick={() => handleBulkDraft(true)} className="px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700">Set Draft</button>
          <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700">Delete Selected</button>
          <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 text-navy-600 text-xs font-medium hover:underline">Clear</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading…</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white border border-border rounded-lg text-gray-500">No blog posts yet.</div>
      ) : (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy-50 border-b border-border">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={selected.size === filteredPosts.length && filteredPosts.length > 0} onChange={toggleAll} className="w-4 h-4 rounded border-border" />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800 hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-navy-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-navy-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(post.id)} onChange={() => toggleSelect(post.id)} className="w-4 h-4 rounded border-border" />
                  </td>
                  <td className="px-4 py-3 font-medium text-navy-900 max-w-xs truncate">{post.title}</td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{formatDate(post.publishedAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleDraft(post)}
                      className={["px-2 py-0.5 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", !post.draft ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"].join(" ")}
                    >
                      {post.draft ? "Draft" : "Published"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingPost(post); setModalOpen(true); }}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(post)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingPost ? "Edit Blog Post" : "New Blog Post"} size="xl">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <BlogPostForm initialData={(editingPost ?? undefined) as any} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} isLoading={saving} />
      </Modal>
    </div>
  );
}
