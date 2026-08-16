"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  pinned: boolean;
  replies: unknown;
  createdAt: string;
}

export default function CourseForumPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", content: "", author: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/course-forums?courseId=${courseId}`)
      .then(r => r.json())
      .then(d => { setPosts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/admin/course-forums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, courseId }),
    });
    if (res.ok) {
      const newPost = await res.json();
      setPosts(p => [newPost, ...p]);
      setForm({ title: "", content: "", author: "" });
      setShowForm(false);
      setMessage("✅ Post submitted!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("❌ Failed to post. Please try again.");
    }
    setSubmitting(false);
  };

  const inputClass = "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href={`/teaching/${courseId}`} className="text-sm text-primary hover:underline mb-4 inline-block">← Back to Course</Link>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-navy-900">Discussion Forum</h1>
        <button onClick={() => setShowForm(p => !p)}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
          {showForm ? "Cancel" : "+ New Post"}
        </button>
      </div>

      {message && <p className="mb-4 text-sm">{message}</p>}

      {/* New post form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-border rounded-xl p-5 mb-6 space-y-3">
          <h2 className="font-semibold text-navy-900">Start a Discussion</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Your Name *
            <input required value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} className={inputClass} />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title *
            <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={inputClass} />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message *
            <textarea required rows={4} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className={`${inputClass} resize-none`} />
            </label>
          </div>
          <button type="submit" disabled={submitting}
            className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-60">
            {submitting ? "Posting..." : "Post"}
          </button>
        </form>
      )}

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-navy-50 rounded-2xl">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-navy-500">No discussions yet. Be the first to post!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className={`bg-white border rounded-xl p-5 ${post.pinned ? "border-primary bg-primary-light/20" : "border-border"}`}>
              {post.pinned && <span className="text-xs font-semibold text-primary mb-2 inline-block">📌 Pinned</span>}
              <h3 className="font-semibold text-navy-900 mb-1">{post.title}</h3>
              <p className="text-navy-600 text-sm mb-3 whitespace-pre-line">{post.content}</p>
              <div className="flex items-center gap-3 text-xs text-navy-400">
                <span>👤 {post.author}</span>
                <span>·</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
