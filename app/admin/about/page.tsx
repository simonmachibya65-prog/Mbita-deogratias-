"use client";

import { useState, useEffect, FormEvent } from "react";
import Button from "@/components/ui/Button";

interface AboutSettings {
  fullName: string;
  title: string;
  department: string;
  institution: string;
  email: string;
  officeLocation: string;
  officeHours: string;
  bio: string;
  vision: string;
  mission: string;
  videoIntroUrl: string;
}

export const dynamic = "force-dynamic";

export default function AboutAdminPage() {
  const [form, setForm] = useState<AboutSettings>({
    fullName: "", title: "", department: "", institution: "",
    email: "", officeLocation: "", officeHours: "", bio: "",
    vision: "", mission: "", videoIntroUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/profile")
      .then(r => r.json())
      .then(data => {
        if (data) {
          setForm({
            fullName: data.fullName ?? "",
            title: data.title ?? "",
            department: data.department ?? "",
            institution: data.institution ?? "",
            email: data.email ?? "",
            officeLocation: data.officeLocation ?? "",
            officeHours: data.officeHours ?? "",
            bio: data.bio ?? "",
            vision: data.vision ?? "",
            mission: data.mission ?? "",
            videoIntroUrl: data.videoIntroUrl ?? "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // Fetch current profile to merge with changes
      const currentRes = await fetch("/api/admin/profile");
      const current = currentRes.ok ? await currentRes.json() : {};
      
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...current, ...form }),
      });
      if (res.ok) {
        showToast("success", "About page saved successfully!");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.error || "Failed to save changes.");
      }
    } catch {
      showToast("error", "An error occurred.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">About Page Management</h1>
        <p className="text-navy-500 mt-1">Edit the professor profile and about page content</p>
      </div>

      {toast && (
        <div role="alert" className={`mb-6 p-4 rounded-xl text-sm font-medium ${toast.type === "success" ? "bg-green-50 border border-green-300 text-green-800" : "bg-red-50 border border-red-300 text-red-700"}`}>
          {toast.message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-navy-900">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-navy-800 mb-1">Full Name</label>
              <input id="fullName" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} className={inputClass} placeholder="Prof. Jane Smith" />
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-navy-800 mb-1">Title</label>
              <input id="title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={inputClass} placeholder="Professor of Computer Science" />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-navy-800 mb-1">Department</label>
              <input id="department" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} className={inputClass} placeholder="Department of Computer Science" />
            </div>
            <div>
              <label htmlFor="institution" className="block text-sm font-medium text-navy-800 mb-1">Institution</label>
              <input id="institution" value={form.institution} onChange={e => setForm(p => ({ ...p, institution: e.target.value }))} className={inputClass} placeholder="University of Example" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy-800 mb-1">Email</label>
              <input id="email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inputClass} placeholder="professor@university.edu" />
            </div>
            <div>
              <label htmlFor="officeLocation" className="block text-sm font-medium text-navy-800 mb-1">Office Location</label>
              <input id="officeLocation" value={form.officeLocation} onChange={e => setForm(p => ({ ...p, officeLocation: e.target.value }))} className={inputClass} placeholder="Room 101, Science Building" />
            </div>
            <div>
              <label htmlFor="officeHours" className="block text-sm font-medium text-navy-800 mb-1">Office Hours</label>
              <input id="officeHours" value={form.officeHours} onChange={e => setForm(p => ({ ...p, officeHours: e.target.value }))} className={inputClass} placeholder="Mon/Wed 2-4pm" />
            </div>
            <div>
              <label htmlFor="videoIntroUrl" className="block text-sm font-medium text-navy-800 mb-1">Video Introduction URL</label>
              <input id="videoIntroUrl" type="url" value={form.videoIntroUrl} onChange={e => setForm(p => ({ ...p, videoIntroUrl: e.target.value }))} className={inputClass} placeholder="https://youtube.com/..." />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-navy-900">Biography & Vision</h2>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-navy-800 mb-1">Biography</label>
            <textarea id="bio" rows={6} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} className={inputClass} placeholder="Write a detailed biography..." />
          </div>
          <div>
            <label htmlFor="vision" className="block text-sm font-medium text-navy-800 mb-1">Vision Statement</label>
            <textarea id="vision" rows={3} value={form.vision} onChange={e => setForm(p => ({ ...p, vision: e.target.value }))} className={inputClass} placeholder="Research vision..." />
          </div>
          <div>
            <label htmlFor="mission" className="block text-sm font-medium text-navy-800 mb-1">Mission Statement</label>
            <textarea id="mission" rows={3} value={form.mission} onChange={e => setForm(p => ({ ...p, mission: e.target.value }))} className={inputClass} placeholder="Academic mission..." />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" isLoading={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
