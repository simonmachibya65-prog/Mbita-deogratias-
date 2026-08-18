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
  { key: "home", label: "Home", icon: "🏠", category: "Core" },
  { key: "about", label: "About", icon: "👤", category: "Core" },
  { key: "research", label: "Research & Projects", icon: "🔬", category: "Academic" },
  { key: "teaching", label: "Teaching & Courses", icon: "📚", category: "Academic" },
  { key: "publications", label: "Publications", icon: "📄", category: "Academic" },
  { key: "students", label: "Students & Supervision", icon: "👩‍🎓", category: "Academic" },
  { key: "cv", label: "CV & Achievements", icon: "🏆", category: "Academic" },
  { key: "blog", label: "Blog / News & Events", icon: "✍️", category: "Content" },
  { key: "collaborations", label: "Collaborations & Resources", icon: "🤝", category: "Content" },
  { key: "gallery", label: "Gallery", icon: "🖼️", category: "Content" },
  { key: "contact", label: "Contact", icon: "✉️", category: "Core" },
  { key: "login", label: "Login / Admin Panel", icon: "🔐", category: "System" },
];

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<string>("general");

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
        showToast("success", "Settings updated successfully!");
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
    showToast("success", "New social link added - fill in the details");
  }

  function removeSocialLink(index: number) {
    const linkLabel = settings?.socialLinks[index]?.label || "this link";
    if (confirm(`Remove "${linkLabel}"?`)) {
      setSettings((prev) => {
        if (!prev) return prev;
        const updated = prev.socialLinks.filter((_, i) => i !== index);
        return { ...prev, socialLinks: updated };
      });
      showToast("success", "Link removed");
    }
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

  function showAllSections() {
    setSettings((prev) => prev ? { ...prev, hiddenSections: [] } : prev);
    showToast("success", "All sections enabled");
  }

  function hideAllSections() {
    if (confirm("Hide all navigation sections? You can re-enable them individually later.")) {
      setSettings((prev) => 
        prev ? { ...prev, hiddenSections: NAVIGATION_SECTIONS.map(s => s.key) } : prev
      );
      showToast("success", "All sections hidden");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 mx-auto text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-600 font-medium">Failed to load settings</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const categories = ["Core", "Academic", "Content", "System"];
  const visibleCount = NAVIGATION_SECTIONS.length - settings.hiddenSections.length;

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-navy-900">Site Settings</h2>
        <p className="text-navy-600 mt-2">Manage global site configuration and preferences</p>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          role="alert"
          className={[
            "mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3 shadow-lg animate-in slide-in-from-top",
            toast.type === "success"
              ? "bg-green-50 border border-green-300 text-green-800"
              : "bg-red-50 border border-red-300 text-red-700",
          ].join(" ")}
        >
          {toast.type === "success" ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: "general", label: "General", icon: "⚙️" },
          { id: "social", label: "Social Links", icon: "🔗" },
          { id: "navigation", label: "Navigation", icon: "🧭" },
          { id: "maintenance", label: "Maintenance", icon: "🔧" },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={[
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              activeSection === section.id
                ? "bg-primary text-white shadow-md"
                : "bg-white text-navy-700 border border-border hover:bg-navy-50",
            ].join(" ")}
          >
            <span>{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        {activeSection === "general" && (
          <div className="space-y-6">
            {/* Site Title and Tagline */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏷️</span>
                <h3 className="text-lg font-semibold text-navy-900">Site Title & Tagline</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="siteTitle" className="block text-sm font-semibold text-navy-800 mb-2">
                    Site Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="siteTitle"
                    type="text"
                    value={settings.siteTitle}
                    onChange={(e) => updateField("siteTitle", e.target.value)}
                    className={[
                      "w-full px-4 py-3 border rounded-lg text-navy-900 bg-white",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      errors.siteTitle ? "border-red-500" : "border-border",
                    ].join(" ")}
                    required
                  />
                  {errors.siteTitle && (
                    <p className="mt-2 text-sm text-red-600">{errors.siteTitle}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="tagline" className="block text-sm font-semibold text-navy-800 mb-2">
                    Tagline
                  </label>
                  <input
                    id="tagline"
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => updateField("tagline", e.target.value)}
                    placeholder="Optional subtitle or tagline"
                    className="w-full px-4 py-3 border border-border rounded-lg text-navy-900 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Footer Text */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⬇️</span>
                <h3 className="text-lg font-semibold text-navy-900">Footer & Copyright</h3>
              </div>
              
              <div>
                <label htmlFor="footerText" className="block text-sm font-semibold text-navy-800 mb-2">
                  Footer Text <span className="text-red-500">*</span>
                </label>
                <input
                  id="footerText"
                  type="text"
                  value={settings.footerText}
                  onChange={(e) => updateField("footerText", e.target.value)}
                  placeholder="e.g., © 2024 Dr. Jane Smith. All rights reserved."
                  className={[
                    "w-full px-4 py-3 border rounded-lg text-navy-900 bg-white",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    errors.footerText ? "border-red-500" : "border-border",
                  ].join(" ")}
                  required
                />
                {errors.footerText && (
                  <p className="mt-2 text-sm text-red-600">{errors.footerText}</p>
                )}
              </div>
            </div>

            {/* Contact Email */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📧</span>
                <h3 className="text-lg font-semibold text-navy-900">Contact Email</h3>
              </div>
              
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-semibold text-navy-800 mb-2">
                  Contact Form Delivery Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => updateField("contactEmail", e.target.value)}
                  className={[
                    "w-full px-4 py-3 border rounded-lg text-navy-900 bg-white",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    errors.contactEmail ? "border-red-500" : "border-border",
                  ].join(" ")}
                  required
                />
                {errors.contactEmail ? (
                  <p className="mt-2 text-sm text-red-600">{errors.contactEmail}</p>
                ) : (
                  <p className="mt-2 text-sm text-navy-500">
                    📮 Contact form submissions will be sent to this email address
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Social Links */}
        {activeSection === "social" && (
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔗</span>
                <div>
                  <h3 className="text-lg font-semibold text-navy-900">Social & Academic Profile Links</h3>
                  <p className="text-sm text-navy-500 mt-1">Add links to your social media and academic profiles</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-primary-light text-primary text-sm font-semibold rounded-full">
                {settings.socialLinks.length} {settings.socialLinks.length === 1 ? 'Link' : 'Links'}
              </span>
            </div>
            
            {settings.socialLinks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                <svg className="w-12 h-12 mx-auto text-navy-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <p className="text-sm text-navy-500 mb-4">No social links yet</p>
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Your First Link
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {settings.socialLinks.map((link, i) => (
                  <div key={i} className="flex gap-3 items-start p-4 bg-navy-50 border border-border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-navy-700 mb-1">Platform Name</label>
                        <input
                          type="text"
                          placeholder="e.g., LinkedIn, Twitter, GitHub"
                          value={link.label}
                          onChange={(e) => updateSocialLink(i, "label", e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-navy-700 mb-1">Profile URL</label>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={link.url}
                          onChange={(e) => updateSocialLink(i, "url", e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSocialLink(i)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Delete link"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg text-sm text-navy-600 hover:border-primary hover:text-primary hover:bg-primary-light/20 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Another Link
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation Visibility */}
        {activeSection === "navigation" && (
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧭</span>
                <div>
                  <h3 className="text-lg font-semibold text-navy-900">Navigation Section Visibility</h3>
                  <p className="text-sm text-navy-500 mt-1">Control which sections appear in the public navigation menu</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-navy-700">
                  {visibleCount}/{NAVIGATION_SECTIONS.length} visible
                </span>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={showAllSections}
                className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                ✓ Show All
              </button>
              <button
                type="button"
                onClick={hideAllSections}
                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                ✕ Hide All
              </button>
            </div>
            
            {categories.map((category) => {
              const categorySections = NAVIGATION_SECTIONS.filter(s => s.category === category);
              return (
                <div key={category} className="mb-6">
                  <h4 className="text-sm font-semibold text-navy-700 mb-3 uppercase tracking-wide">{category}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categorySections.map((section) => {
                      const isHidden = settings.hiddenSections.includes(section.key);
                      return (
                        <label
                          key={section.key}
                          className={[
                            "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all",
                            isHidden 
                              ? "border-red-200 bg-red-50/50 hover:bg-red-50" 
                              : "border-green-200 bg-green-50/50 hover:bg-green-50"
                          ].join(" ")}
                        >
                          <input
                            type="checkbox"
                            checked={!isHidden}
                            onChange={() => toggleSection(section.key)}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                          />
                          <span className="text-xl">{section.icon}</span>
                          <span className="text-sm font-medium text-navy-900 flex-1">{section.label}</span>
                          {isHidden && (
                            <span className="px-2 py-0.5 text-xs text-red-700 bg-red-100 rounded-full font-semibold">Hidden</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Maintenance Mode */}
        {activeSection === "maintenance" && (
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">🔧</span>
              <div>
                <h3 className="text-lg font-semibold text-navy-900">Maintenance Mode</h3>
                <p className="text-sm text-navy-500 mt-1">Temporarily disable public access for maintenance</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <label className={[
                "flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all",
                settings.maintenanceMode 
                  ? "border-orange-300 bg-orange-50" 
                  : "border-border bg-white hover:bg-navy-50"
              ].join(" ")}>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => updateField("maintenanceMode", e.target.checked)}
                  className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus-visible:ring-primary mt-0.5"
                />
                <div>
                  <span className="text-base font-semibold text-navy-900">Enable Maintenance Mode</span>
                  <p className="text-sm text-navy-600 mt-1">
                    ⚠️ When enabled, all public pages will display a maintenance message. The admin panel remains accessible.
                  </p>
                </div>
              </label>

              {settings.maintenanceMode && (
                <div className="pl-9">
                  <label htmlFor="maintenanceMsg" className="block text-sm font-semibold text-navy-800 mb-2">
                    Maintenance Message
                  </label>
                  <textarea
                    id="maintenanceMsg"
                    rows={4}
                    value={settings.maintenanceMsg}
                    onChange={(e) => updateField("maintenanceMsg", e.target.value)}
                    placeholder="e.g., We're currently performing scheduled maintenance to improve your experience. Please check back soon!"
                    className="w-full px-4 py-3 border border-border rounded-lg text-navy-900 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
                  />
                  <p className="mt-2 text-xs text-navy-500">
                    This message will be displayed to visitors during maintenance
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save Button - Always visible */}
        <div className="sticky bottom-4 flex justify-end gap-3 pt-4 bg-gradient-to-t from-white via-white to-transparent pb-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => window.location.reload()}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={saving}>
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

