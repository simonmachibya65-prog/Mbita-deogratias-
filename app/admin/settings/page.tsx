"use client";

import { useState, useEffect, FormEvent } from "react";
import Button from "@/components/ui/Button";

interface SocialLink {
  label: string;
  url: string;
}

interface SettingsData {
  siteTitle: string;
  tagline: string;
  footerText: string;
  contactEmail: string;
  maintenanceMode: boolean;
  maintenanceMsg: string;
  socialLinks: SocialLink[];
  hiddenSections: string[];
}

const NAVIGATION_SECTIONS = [
  { key: "home", label: "Home" },
  { key: "about", label: "About" },
  { key: "research", label: "Research & Projects" },
  { key: "teaching", label: "Teaching & Courses" },
  { key: "publications", label: "Publications" },
  { key: "students", label: "Students & Supervision" },
  { key: "cv", label: "CV & Achievements" },
  { key: "blog", label: "Blog / News & Events" },
  { key: "collaborations", label: "Collaborations & Resources" },
  { key: "gallery", label: "Gallery" },
  { key: "contact", label: "Contact" },
  { key: "login", label: "Login / Admin Panel" },
];

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings({
          ...data,
          tagline: data.tagline ?? "",
          maintenanceMsg: data.maintenanceMsg ?? "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setErrors({});

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();

      if (res.ok) {
        setSettings({
          ...data,
          tagline: data.tagline ?? "",
          maintenanceMsg: data.maintenanceMsg ?? "",
        });
        showToast("success", "Settings updated successfully.");
      } else {
        if (data.fields) setErrors(data.fields);
        showToast("error", data.error ?? "Failed to update settings.");
      }
    } catch {
      showToast("error", "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof SettingsData>(field: K, value: SettingsData[K]) {
    setSettings((prev) => prev ? { ...prev, [field]: value } : prev);
  }

  function updateSocialLink(index: number, key: "label" | "url", value: string) {
    setSettings((prev) => {
      if (!prev) return prev;
      const updated = [...prev.socialLinks];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, socialLinks: updated };
    });
  }

  function addSocialLink() {
    setSettings((prev) =>
      prev ? { ...prev, socialLinks: [...prev.socialLinks, { label: "", url: "" }] } : prev
    );
  }

  function removeSocialLink(index: number) {
    setSettings((prev) => {
      if (!prev) return prev;
      const updated = prev.socialLinks.filter((_, i) => i !== index);
      return { ...prev, socialLinks: updated };
    });
  }

  function toggleSection(sectionKey: string) {
    setSettings((prev) => {
      if (!prev) return prev;
      const isHidden = prev.hiddenSections.includes(sectionKey);
      const updated = isHidden
        ? prev.hiddenSections.filter((k) => k !== sectionKey)
        : [...prev.hiddenSections, sectionKey];
      return { ...prev, hiddenSections: updated };
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading settings…</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12 text-red-600">
        Failed to load settings. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy-900">Site Settings</h2>
        <p className="text-gray-600 mt-1">Manage global site configuration</p>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          role="alert"
          className={[
            "mb-6 p-4 rounded-md text-sm font-medium",
            toast.type === "success"
              ? "bg-green-50 border border-green-300 text-green-800"
              : "bg-red-50 border border-red-300 text-red-700",
          ].join(" ")}
        >
          {toast.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Site Title and Tagline */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-navy-800 mb-4">Site Title & Tagline</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="siteTitle" className="block text-sm font-medium text-navy-800 mb-1">
                Site Title <span className="text-red-500">*</span>
              </label>
              <input
                id="siteTitle"
                type="text"
                value={settings.siteTitle}
                onChange={(e) => updateField("siteTitle", e.target.value)}
                aria-required="true"
                aria-describedby={errors.siteTitle ? "siteTitle-error" : undefined}
                aria-invalid={!!errors.siteTitle}
                className={[
                  "w-full px-3 py-2 border rounded-md text-navy-900 bg-white text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  errors.siteTitle ? "border-red-500" : "border-border",
                ].join(" ")}
              />
              {errors.siteTitle && (
                <p id="siteTitle-error" className="mt-1 text-xs text-red-600">{errors.siteTitle}</p>
              )}
            </div>

            <div>
              <label htmlFor="tagline" className="block text-sm font-medium text-navy-800 mb-1">
                Tagline
              </label>
              <input
                id="tagline"
                type="text"
                value={settings.tagline}
                onChange={(e) => updateField("tagline", e.target.value)}
                placeholder="Optional subtitle or tagline"
                className="w-full px-3 py-2 border border-border rounded-md text-navy-900 bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-navy-800 mb-4">Footer & Copyright</h3>
          
          <div>
            <label htmlFor="footerText" className="block text-sm font-medium text-navy-800 mb-1">
              Footer Text <span className="text-red-500">*</span>
            </label>
            <input
              id="footerText"
              type="text"
              value={settings.footerText}
              onChange={(e) => updateField("footerText", e.target.value)}
              aria-required="true"
              aria-describedby={errors.footerText ? "footerText-error" : undefined}
              aria-invalid={!!errors.footerText}
              placeholder="e.g., © 2024 Dr. Jane Smith"
              className={[
                "w-full px-3 py-2 border rounded-md text-navy-900 bg-white text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                errors.footerText ? "border-red-500" : "border-border",
              ].join(" ")}
            />
            {errors.footerText && (
              <p id="footerText-error" className="mt-1 text-xs text-red-600">{errors.footerText}</p>
            )}
          </div>
        </div>

        {/* Contact Email */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-navy-800 mb-4">Contact Email</h3>
          
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-navy-800 mb-1">
              Contact Form Delivery Email <span className="text-red-500">*</span>
            </label>
            <input
              id="contactEmail"
              type="email"
              value={settings.contactEmail}
              onChange={(e) => updateField("contactEmail", e.target.value)}
              aria-required="true"
              aria-describedby={errors.contactEmail ? "contactEmail-error" : "contactEmail-help"}
              aria-invalid={!!errors.contactEmail}
              className={[
                "w-full px-3 py-2 border rounded-md text-navy-900 bg-white text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                errors.contactEmail ? "border-red-500" : "border-border",
              ].join(" ")}
            />
            {errors.contactEmail ? (
              <p id="contactEmail-error" className="mt-1 text-xs text-red-600">{errors.contactEmail}</p>
            ) : (
              <p id="contactEmail-help" className="mt-1 text-xs text-gray-500">
                Contact form submissions will be sent to this email address
              </p>
            )}
          </div>
        </div>

        {/* Social/Academic Profile Links */}
        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-navy-800">Social & Academic Profile Links</h3>
            <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
              + Add Link
            </Button>
          </div>
          
          {settings.socialLinks.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No social links added yet.</p>
          ) : (
            <div className="space-y-2">
              {settings.socialLinks.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Label (e.g., Google Scholar)"
                    value={link.label}
                    onChange={(e) => updateSocialLink(i, "label", e.target.value)}
                    aria-label={`Social link ${i + 1} label`}
                    className="flex-1 px-3 py-2 border border-border rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) => updateSocialLink(i, "url", e.target.value)}
                    aria-label={`Social link ${i + 1} URL`}
                    className="flex-1 px-3 py-2 border border-border rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeSocialLink(i)}
                    aria-label={`Remove social link ${i + 1}`}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Section Visibility */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-navy-800 mb-4">Navigation Section Visibility</h3>
          <p className="text-sm text-gray-600 mb-4">
            Toggle sections on or off to control what appears in the public navigation menu.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {NAVIGATION_SECTIONS.map((section) => {
              const isHidden = settings.hiddenSections.includes(section.key);
              return (
                <label
                  key={section.key}
                  className="flex items-center gap-3 p-3 border border-border rounded-md hover:bg-navy-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={!isHidden}
                    onChange={() => toggleSection(section.key)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                    aria-label={`Toggle ${section.label} section visibility`}
                  />
                  <span className="text-sm font-medium text-navy-800">{section.label}</span>
                  {isHidden && (
                    <span className="ml-auto text-xs text-red-600 font-medium">Hidden</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-navy-800 mb-4">Maintenance Mode</h3>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-3 border border-border rounded-md hover:bg-navy-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => updateField("maintenanceMode", e.target.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                aria-label="Enable maintenance mode"
              />
              <div>
                <span className="text-sm font-medium text-navy-800">Enable Maintenance Mode</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  When enabled, all public pages will show a maintenance message (admin panel remains accessible)
                </p>
              </div>
            </label>

            {settings.maintenanceMode && (
              <div>
                <label htmlFor="maintenanceMsg" className="block text-sm font-medium text-navy-800 mb-1">
                  Maintenance Message
                </label>
                <textarea
                  id="maintenanceMsg"
                  rows={3}
                  value={settings.maintenanceMsg}
                  onChange={(e) => updateField("maintenanceMsg", e.target.value)}
                  placeholder="e.g., We're currently performing scheduled maintenance. Please check back soon."
                  className="w-full px-3 py-2 border border-border rounded-md text-navy-900 bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" isLoading={saving}>
            {saving ? "Saving…" : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
