"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import CourseForm from "@/components/forms/admin/CourseForm";

interface Course {
  id: string;
  name: string;
  code: string;
  term: string;
  status: "active" | "archived";
  syllabusUrl: string | null;
  externalUrl: string | null;
  description: string | null;
  published: boolean;
}

export const dynamic = "force-dynamic";

export default function AdminTeachingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all");
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
    if (selected.size === filteredCourses.length) setSelected(new Set());
    else setSelected(new Set(filteredCourses.map(i => i.id)));
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} items?`)) return;
    const count = selected.size;
    for (const id of Array.from(selected)) {
      await fetch(`/api/admin/teaching?id=${id}`, { method: "DELETE" });
    }
    setSelected(new Set());
    showToast("success", `${count} items deleted.`);
    loadCourses();
  };

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  const loadCourses = useCallback(async function () {
    try {
      const res = await fetch("/api/admin/teaching");
      const data = await res.json();
      setCourses(data);
    } catch {
      showToast("error", "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  // Clear selection when filter changes
  useEffect(() => { setSelected(new Set()); }, [statusFilter]);

  async function handleSubmit(formData: {
    name: string; code: string; term: string; status: "active" | "archived";
    syllabusUrl: string; externalUrl: string; description: string; published: boolean;
  }) {
    setSaving(true);
    const payload = {
      ...formData,
      id: editingCourse?.id,
      syllabusUrl: formData.syllabusUrl || undefined,
      externalUrl: formData.externalUrl || undefined,
    };

    try {
      const res = await fetch("/api/admin/teaching", {
        method: editingCourse ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        showToast("success", editingCourse ? "Course updated." : "Course created.");
        setModalOpen(false);
        loadCourses();
      } else {
        showToast("error", data.error ?? "Failed to save course.");
      }
    } catch {
      showToast("error", "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(course: Course) {
    if (!window.confirm(`Delete "${course.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/teaching?id=${course.id}`, { method: "DELETE" });
      if (res.ok) { showToast("success", "Course deleted."); loadCourses(); }
      else showToast("error", "Failed to delete course.");
    } catch { showToast("error", "An unexpected error occurred."); }
  }

  async function handleTogglePublish(course: Course) {
    if (course.published && !window.confirm(`Unpublish "${course.name}"? It will be hidden from the public site.`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/teaching", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: course.id, published: !course.published }),
      });
      if (res.ok) { showToast("success", course.published ? "Course unpublished." : "Course published."); loadCourses(); }
      else showToast("error", "Failed to update publish status.");
    } catch { showToast("error", "An unexpected error occurred."); }
  }

  const filteredCourses = courses.filter((course) => {
    if (statusFilter !== "all" && course.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Teaching & Courses</h2>
          <p className="text-gray-600 mt-1">Manage your courses</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "archived")}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <Button variant="primary" onClick={() => { setEditingCourse(null); setModalOpen(true); }}>+ New Course</Button>
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
          <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700">Delete Selected</button>
          <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 text-navy-600 text-xs font-medium hover:underline">Clear</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading…</div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-white border border-border rounded-lg text-gray-500">No courses yet.</div>
      ) : (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy-50 border-b border-border">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={selected.size === filteredCourses.length && filteredCourses.length > 0} onChange={toggleAll} className="w-4 h-4 rounded border-border" />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800 hidden sm:table-cell">Code</th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800 hidden md:table-cell">Term</th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800 hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-navy-800">Published</th>
                <th className="text-right px-4 py-3 font-semibold text-navy-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-navy-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(course.id)} onChange={() => toggleSelect(course.id)} className="w-4 h-4 rounded border-border" />
                  </td>
                  <td className="px-4 py-3 font-medium text-navy-900">{course.name}</td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{course.code}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{course.term}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={["px-2 py-0.5 rounded-full text-xs font-medium", course.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"].join(" ")}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleTogglePublish(course)} className={["px-2 py-0.5 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", course.published ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"].join(" ")}>
                      {course.published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingCourse(course); setModalOpen(true); }}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(course)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCourse ? "Edit Course" : "New Course"} size="lg">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <CourseForm initialData={(editingCourse ?? undefined) as any} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} isLoading={saving} />
      </Modal>
    </div>
  );
}
