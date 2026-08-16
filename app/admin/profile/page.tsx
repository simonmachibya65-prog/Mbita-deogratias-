"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";

interface AcademicProfile { label: string; url: string; }

interface ProfileData {
  fullName: string;
  title: string;
  department: string;
  institution: string;
  email: string;
  officeLocation: string;
  officeHours: string;
  bio: string;
  photoUrl: string;
  navbarPhotoUrl: string;
  heroPhotoUrl: string;
  aboutPhotoUrl: string;
  contactPhotoUrl: string;
  footerPhotoUrl: string;
  adminPhotoUrl: string;
  cvUrl: string;
  academicProfiles: AcademicProfile[];
}

export const dynamic = "force-dynamic";

// ── PHOTO SLOT CONFIG ──────────────────────────────────────────────────────
const PHOTO_SLOTS = [
  {
    slot: "main",
    label: "Main / Default Photo",
    desc: "Fallback used wherever no specific photo is set",
    size: "Any size",
    icon: "🖼️",
    field: "photoUrl" as keyof ProfileData,
  },
  {
    slot: "navbar",
    label: "Navbar Photo",
    desc: "Shown in the top navigation bar on every page",
    size: "40×40px circle",
    icon: "🔝",
    field: "navbarPhotoUrl" as keyof ProfileData,
  },
  {
    slot: "hero",
    label: "Homepage Hero Photo",
    desc: "Large profile photo on the homepage banner",
    size: "220×220px circle",
    icon: "🏠",
    field: "heroPhotoUrl" as keyof ProfileData,
  },
  {
    slot: "about",
    label: "About Page Photo",
    desc: "Shown beside your biography on the About page",
    size: "200×200px circle",
    icon: "👤",
    field: "aboutPhotoUrl" as keyof ProfileData,
  },
  {
    slot: "contact",
    label: "Contact Page Photo",
    desc: "Shown beside contact information on the Contact page",
    size: "150×150px circle",
    icon: "✉️",
    field: "contactPhotoUrl" as keyof ProfileData,
  },
  {
    slot: "footer",
    label: "Footer Photo",
    desc: "Small photo shown in the footer on every page",
    size: "48×48px circle",
    icon: "⬇️",
    field: "footerPhotoUrl" as keyof ProfileData,
  },
  {
    slot: "admin",
    label: "Admin Panel Photo",
    desc: "Shown in the admin sidebar and profile dropdown",
    size: "40–52px circle",
    icon: "🔐",
    field: "adminPhotoUrl" as keyof ProfileData,
  },
];

// ── SINGLE PHOTO UPLOAD CARD ───────────────────────────────────────────────
function PhotoUploadCard({
  slot,
  label,
  desc,
  size,
  icon,
  currentUrl,
  fallbackUrl,
  onUploaded,
  onCleared,
}: {
  slot: string;
  label: string;
  desc: string;
  size: string;
  icon: string;
  currentUrl: string;
  fallbackUrl: string;
  onUploaded: (url: string) => void;
  onCleared: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = preview ?? currentUrl ?? fallbackUrl ?? "";

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("slot", slot);
      const res = await fetch("/api/admin/profile", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        onUploaded(data.photoUrl);
        showToast("success", "Photo uploaded successfully!");
      } else {
        showToast("error", data.error ?? "Upload failed");
        setPreview(null);
      }
    } catch {
      showToast("error", "Upload failed. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleClear() {
    if (!confirm(`Clear the ${label}? It will fall back to the main photo.`)) return;
    setClearing(true);
    try {
      const res = await fetch(`/api/admin/profile?slot=${slot}`, { method: "DELETE" });
      if (res.ok) {
        setPreview(null);
        onCleared();
        showToast("success", "Photo cleared.");
      } else {
        showToast("error", "Failed to clear photo.");
      }
    } catch {
      showToast("error", "Failed to clear photo.");
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-navy-50 flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">{icon}</span>
        <div>
          <p className="font-semibold text-navy-900 text-sm">{label}</p>
          <p className="text-xs text-navy-500">{size}</p>
        </div>
        {currentUrl && (
          <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
            Custom
          </span>
        )}
        {!currentUrl && (
          <span className="ml-auto px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">
            Using default
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start gap-5">
          {/* Preview */}
          <div className="flex-shrink-0">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-navy-50">
              {displayUrl ? (
                <Image
                  src={displayUrl}
                  alt={label}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            {displayUrl && (
              <p className="text-xs text-center text-navy-400 mt-1">
                {preview ? "New" : currentUrl ? "Custom" : "Default"}
              </p>
            )}
          </div>

          {/* Info + actions */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-navy-600 mb-4">{desc}</p>

            {/* Toast */}
            {toast && (
              <div className={`mb-3 px-3 py-2 rounded-lg text-xs font-medium ${toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {toast.message}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {/* Upload button */}
              <label
                htmlFor={`photo-upload-${slot}`}
                className={[
                  "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors",
                  "bg-primary text-white hover:bg-primary-hover focus-within:ring-2 focus-within:ring-primary",
                  uploading ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {uploading ? "Uploading…" : currentUrl ? "Replace" : "Upload"}
                <input
                  id={`photo-upload-${slot}`}
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="sr-only"
                  aria-label={`Upload ${label}`}
                />
              </label>

              {/* Clear button — only show if slot has a custom photo */}
              {currentUrl && (
                <button
                  onClick={handleClear}
                  disabled={clearing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-border text-navy-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {clearing ? "Clearing…" : "Clear"}
                </button>
              )}
            </div>

            <p className="text-xs text-navy-400 mt-2">JPEG, PNG or WebP · Max 5MB</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function AdminProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"photos" | "info" | "academic">("photos");

  useEffect(() => {
    fetch("/api/admin/profile")
      .then((r) => r.json())
      .then((data) => { setProfile(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  function updatePhotoSlot(field: keyof ProfileData, url: string) {
    setProfile((p) => p ? { ...p, [field]: url } : p);
  }

  function clearPhotoSlot(field: keyof ProfileData) {
    setProfile((p) => p ? { ...p, [field]: "" } : p);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setErrors({});
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("success", "Profile updated successfully.");
        setProfile(data);
      } else {
        if (data.fields) setErrors(data.fields);
        showToast("error", data.error ?? "Failed to update profile.");
      }
    } catch {
      showToast("error", "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const inputClass = (hasError: boolean) => [
    "w-full px-3 py-2 border rounded-lg text-navy-900 bg-white text-sm",
    "focus:outline-none focus:ring-2 focus:ring-primary",
    hasError ? "border-red-500" : "border-border",
  ].join(" ");

  const tabs = [
    { id: "photos", label: "📸 Photos", desc: "Upload photos for each location" },
    { id: "info", label: "👤 Profile Info", desc: "Name, bio, contact details" },
    { id: "academic", label: "🔗 Academic Links", desc: "Google Scholar, ORCID, etc." },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Profile Management</h1>
        <p className="text-navy-500 mt-1">Manage your profile information and photos for each section of the website</p>
      </div>

      {/* Toast */}
      {toast && (
        <div role="alert" className={`mb-6 p-4 rounded-xl text-sm font-medium ${toast.type === "success" ? "bg-green-50 border border-green-300 text-green-800" : "bg-red-50 border border-red-300 text-red-700"}`}>
          {toast.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-navy-50 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-white text-navy-900 shadow-sm"
                : "text-navy-500 hover:text-navy-700",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── PHOTOS TAB ── */}
      {activeTab === "photos" && profile && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <strong>How it works:</strong> Each section of the website can have its own photo. If a section photo is not set, it automatically uses the <strong>Main / Default Photo</strong>.
          </div>

          {PHOTO_SLOTS.map((slot) => (
            <PhotoUploadCard
              key={slot.slot}
              slot={slot.slot}
              label={slot.label}
              desc={slot.desc}
              size={slot.size}
              icon={slot.icon}
              currentUrl={profile[slot.field] as string ?? ""}
              fallbackUrl={slot.slot !== "main" ? profile.photoUrl : ""}
              onUploaded={(url) => updatePhotoSlot(slot.field, url)}
              onCleared={() => clearPhotoSlot(slot.field)}
            />
          ))}
        </div>
      )}

      {/* ── PROFILE INFO TAB ── */}
      {activeTab === "info" && profile && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-navy-900 text-base mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-navy-800 mb-1">Full Name *</label>
                <input id="fullName" type="text" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} className={inputClass(!!errors.fullName)} />
                {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
              </div>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-navy-800 mb-1">Academic Title *</label>
                <input id="title" type="text" value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} className={inputClass(!!errors.title)} />
                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-navy-800 mb-1">Department *</label>
                <input id="department" type="text" value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} className={inputClass(!!errors.department)} />
              </div>
              <div>
                <label htmlFor="institution" className="block text-sm font-medium text-navy-800 mb-1">Institution *</label>
                <input id="institution" type="text" value={profile.institution} onChange={(e) => setProfile({ ...profile, institution: e.target.value })} className={inputClass(!!errors.institution)} />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-navy-800 mb-1">Email *</label>
                <input id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className={inputClass(!!errors.email)} />
              </div>
              <div>
                <label htmlFor="officeLocation" className="block text-sm font-medium text-navy-800 mb-1">Office Location *</label>
                <input id="officeLocation" type="text" value={profile.officeLocation} onChange={(e) => setProfile({ ...profile, officeLocation: e.target.value })} className={inputClass(!!errors.officeLocation)} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="officeHours" className="block text-sm font-medium text-navy-800 mb-1">Office Hours *</label>
                <input id="officeHours" type="text" value={profile.officeHours} onChange={(e) => setProfile({ ...profile, officeHours: e.target.value })} className={inputClass(!!errors.officeHours)} />
              </div>
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-navy-800 mb-1">WhatsApp Number</label>
                <input id="whatsapp" type="text" value={(profile as unknown as Record<string, unknown>).whatsapp as string ?? ""} onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value } as typeof profile)} placeholder="+1234567890" className={inputClass(false)} />
              </div>
              <div>
                <label htmlFor="emergencyContact" className="block text-sm font-medium text-navy-800 mb-1">Emergency Contact</label>
                <input id="emergencyContact" type="text" value={(profile as unknown as Record<string, unknown>).emergencyContact as string ?? ""} onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value } as typeof profile)} placeholder="Name: ... Phone: ..." className={inputClass(false)} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="mapEmbedUrl" className="block text-sm font-medium text-navy-800 mb-1">
                  Google Maps Embed URL
                  <span className="ml-2 text-xs text-navy-400 font-normal">
                    (Get from Google Maps → Share → Embed a map → copy src URL)
                  </span>
                </label>
                <input id="mapEmbedUrl" type="url" value={(profile as unknown as Record<string, unknown>).mapEmbedUrl as string ?? ""} onChange={(e) => setProfile({ ...profile, mapEmbedUrl: e.target.value } as typeof profile)} placeholder="https://www.google.com/maps/embed?pb=..." className={inputClass(false)} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="buildingImageUrl" className="block text-sm font-medium text-navy-800 mb-1">Office/Building Image URL</label>
                <input id="buildingImageUrl" type="url" value={(profile as unknown as Record<string, unknown>).buildingImageUrl as string ?? ""} onChange={(e) => setProfile({ ...profile, buildingImageUrl: e.target.value } as typeof profile)} placeholder="https://..." className={inputClass(false)} />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-navy-800 mb-1">Biography *</label>
              <textarea id="bio" rows={8} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className={`${inputClass(!!errors.bio)} resize-none`} />
              {errors.bio && <p className="mt-1 text-xs text-red-600">{errors.bio}</p>}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" isLoading={saving}>
              {saving ? "Saving…" : "Save Profile"}
            </Button>
          </div>
        </form>
      )}

      {/* ── ACADEMIC LINKS TAB ── */}
      {activeTab === "academic" && profile && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white border border-border rounded-xl p-6">
            <h2 className="font-semibold text-navy-900 text-base mb-4">Academic Profile Links</h2>
            <p className="text-sm text-navy-500 mb-4">These links appear on the homepage and contact page.</p>

            <div className="space-y-3">
              {(profile.academicProfiles ?? []).map((ap, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Label (e.g. Google Scholar)"
                    value={ap.label}
                    onChange={(e) => {
                      const updated = [...profile.academicProfiles];
                      updated[i] = { ...updated[i], label: e.target.value };
                      setProfile({ ...profile, academicProfiles: updated });
                    }}
                    className={`${inputClass(false)} flex-1`}
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={ap.url}
                    onChange={(e) => {
                      const updated = [...profile.academicProfiles];
                      updated[i] = { ...updated[i], url: e.target.value };
                      setProfile({ ...profile, academicProfiles: updated });
                    }}
                    className={`${inputClass(false)} flex-2`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = profile.academicProfiles.filter((_, idx) => idx !== i);
                      setProfile({ ...profile, academicProfiles: updated });
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Remove link"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setProfile({ ...profile, academicProfiles: [...(profile.academicProfiles ?? []), { label: "", url: "" }] })}
                className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg text-sm text-navy-500 hover:border-primary hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Profile Link
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" isLoading={saving}>
              {saving ? "Saving…" : "Save Links"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
