"use client";

import { useState, useEffect, FormEvent } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface HomeSettings {
  // Hero
  siteTitle: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroVideoUrl: string;
  heroImageUrl: string;
  heroCTAText: string;
  heroCTALink: string;
  // Section visibility
  showAnnouncements: boolean;
  showStats: boolean;
  showNewsSlider: boolean;
  showUpcomingEvents: boolean;
  showPublications: boolean;
  showTestimonials: boolean;
  showResearchHighlights: boolean;
  showAchievements: boolean;
  showQuickLinks: boolean;
}

export const dynamic = "force-dynamic";

const SECTION_TOGGLES = [
  { key: "showAnnouncements", label: "Services We Offer", icon: "🛠️", desc: "Show services section" },
  { key: "showStats", label: "Statistics Counters", icon: "📊", desc: "Animated publication/research counts" },
  { key: "showNewsSlider", label: "News Slider", icon: "📰", desc: "Latest blog posts slider" },
  { key: "showUpcomingEvents", label: "Upcoming Events", icon: "📅", desc: "Next events preview" },
  { key: "showPublications", label: "Latest Publications", icon: "📄", desc: "Recent publications grid" },
  { key: "showResearchHighlights", label: "Research Highlights", icon: "🔬", desc: "Active research projects" },
  { key: "showAchievements", label: "Academic Achievements", icon: "🏆", desc: "Awards and honors gallery" },
  { key: "showTestimonials", label: "Student Testimonials", icon: "💬", desc: "What students say section" },
  { key: "showQuickLinks", label: "Quick Links Grid", icon: "🔗", desc: "Explore sections grid" },
] as const;

export default function HomeAdminPage() {
  const [settings, setSettings] = useState<HomeSettings>({
    siteTitle: "", tagline: "", heroTitle: "", heroSubtitle: "",
    heroVideoUrl: "", heroImageUrl: "", heroCTAText: "", heroCTALink: "",
    showAnnouncements: true, showStats: true, showNewsSlider: true,
    showUpcomingEvents: true, showPublications: true, showTestimonials: true,
    showResearchHighlights: true, showAchievements: true, showQuickLinks: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"hero" | "sections" | "content">("hero");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(data => {
        if (data) {
          setSettings({
            siteTitle: data.siteTitle ?? "",
            tagline: data.tagline ?? "",
            heroTitle: data.heroTitle ?? "",
            heroSubtitle: data.heroSubtitle ?? "",
            heroVideoUrl: data.heroVideoUrl ?? "",
            heroImageUrl: data.heroImageUrl ?? "",
            heroCTAText: data.heroCTAText ?? "",
            heroCTALink: data.heroCTALink ?? "",
            showAnnouncements: data.showAnnouncements ?? true,
            showStats: data.showStats ?? true,
            showNewsSlider: data.showNewsSlider ?? true,
            showUpcomingEvents: data.showUpcomingEvents ?? true,
            showPublications: data.showPublications ?? true,
            showTestimonials: data.showTestimonials ?? true,
            showResearchHighlights: data.showResearchHighlights ?? true,
            showAchievements: data.showAchievements ?? true,
            showQuickLinks: data.showQuickLinks ?? true,
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
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showToast("success", "Home settings saved successfully!");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.error || "Failed to save settings.");
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

  const tabs = [
    { id: "hero" as const, label: "🏠 Hero Section", desc: "Title, subtitle, background" },
    { id: "sections" as const, label: "👁️ Section Visibility", desc: "Show/hide homepage sections" },
    { id: "content" as const, label: "📋 Content Links", desc: "Manage content shown on home" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Home Page Management</h1>
        <p className="text-navy-500 mt-1">Control every section of the homepage</p>
      </div>

      {toast && (
        <div role="alert" className={`mb-6 p-4 rounded-xl text-sm font-medium ${toast.type === "success" ? "bg-green-50 border border-green-300 text-green-800" : "bg-red-50 border border-red-300 text-red-700"}`}>
          {toast.message}
        </div>
      )}

      {/* Preview link */}
      <div className="mb-6 flex items-center gap-3 p-4 bg-navy-50 rounded-xl border border-border">
        <span className="text-2xl" aria-hidden="true">🌐</span>
        <div className="flex-1">
          <p className="font-medium text-navy-900 text-sm">Preview Homepage</p>
          <p className="text-navy-500 text-xs">See how your changes look on the public site</p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
          Open Preview →
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-navy-50 p-1 rounded-xl">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-white text-navy-900 shadow-sm" : "text-navy-500 hover:text-navy-700"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave}>
        {/* ── HERO TAB ── */}
        {activeTab === "hero" && (
          <div className="space-y-5">
            <div className="bg-white border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-navy-900">Site Identity</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1">Site Title
                  <input value={settings.siteTitle} onChange={e => setSettings(p => ({ ...p, siteTitle: e.target.value }))} placeholder="Prof. Jane Smith" className={inputClass} />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1">Tagline
                  <input value={settings.tagline} onChange={e => setSettings(p => ({ ...p, tagline: e.target.value }))} placeholder="Professor of Computer Science" className={inputClass} />
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-navy-900">Hero Banner Text</h2>
              <p className="text-sm text-navy-500">Override the default name/title display with custom text</p>
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1">Hero Title Override
                <input value={settings.heroTitle} onChange={e => setSettings(p => ({ ...p, heroTitle: e.target.value }))} placeholder="Leave empty to use professor's name" className={inputClass} />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1">Hero Subtitle Override
                <input value={settings.heroSubtitle} onChange={e => setSettings(p => ({ ...p, heroSubtitle: e.target.value }))} placeholder="Leave empty to use professor's title" className={inputClass} />
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1">CTA Button Text
                  <input value={settings.heroCTAText} onChange={e => setSettings(p => ({ ...p, heroCTAText: e.target.value }))} placeholder="Get in Touch" className={inputClass} />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1">CTA Button Link
                  <input value={settings.heroCTALink} onChange={e => setSettings(p => ({ ...p, heroCTALink: e.target.value }))} placeholder="/contact" className={inputClass} />
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-navy-900">Hero Background</h2>
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1">
                  Background Video URL
                  <span className="ml-2 text-xs text-navy-400 font-normal">(MP4 URL — plays silently behind hero)</span>
                <input type="url" value={settings.heroVideoUrl} onChange={e => setSettings(p => ({ ...p, heroVideoUrl: e.target.value }))} placeholder="https://example.com/video.mp4" className={inputClass} />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1">
                  Background Image URL
                  <span className="ml-2 text-xs text-navy-400 font-normal">(Used if no video is set)</span>
                <input type="url" value={settings.heroImageUrl} onChange={e => setSettings(p => ({ ...p, heroImageUrl: e.target.value }))} placeholder="https://example.com/hero-bg.jpg" className={inputClass} />
                </label>
              </div>
              <div className="p-3 bg-navy-50 rounded-lg text-xs text-navy-500">
                💡 <strong>Tip:</strong> Upload your hero photo in <Link href="/admin/profile" className="text-primary hover:underline">Profile → Photos → Homepage Hero Photo</Link>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTIONS TAB ── */}
        {activeTab === "sections" && (
          <div className="bg-white border border-border rounded-xl p-6">
            <h2 className="font-semibold text-navy-900 mb-2">Homepage Section Visibility</h2>
            <p className="text-sm text-navy-500 mb-6">Toggle which sections appear on the homepage. Changes take effect immediately after saving.</p>

            <div className="space-y-3">
              {SECTION_TOGGLES.map(section => (
                <div key={section.key} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${settings[section.key] ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden="true">{section.icon}</span>
                    <div>
                      <p className="font-medium text-navy-900 text-sm">{section.label}</p>
                      <p className="text-navy-500 text-xs">{section.desc}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings(p => ({ ...p, [section.key]: !p[section.key as keyof HomeSettings] }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${settings[section.key] ? "bg-primary" : "bg-gray-300"}`}
                    role="switch"
                    aria-checked={settings[section.key] as boolean}
                    aria-label={`Toggle ${section.label}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${settings[section.key] ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              <strong>Note:</strong> Sections with no data will not show even if toggled on. Add content first (services, testimonials, etc.) for sections to appear.
            </div>
          </div>
        )}

        {/* ── CONTENT TAB ── */}
        {activeTab === "content" && (
          <div className="space-y-4">
            <div className="bg-white border border-border rounded-xl p-6">
              <h2 className="font-semibold text-navy-900 mb-4">Manage Homepage Content</h2>
              <p className="text-sm text-navy-500 mb-6">The homepage pulls content from these sections. Click to manage each one.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { href: "/admin/announcements", label: "Services", icon: "🛠️", desc: "Add/edit services we offer" },
                  { href: "/admin/testimonials", label: "Testimonials", icon: "💬", desc: "Student testimonials" },
                  { href: "/admin/research", label: "Research Projects", icon: "🔬", desc: "Research highlights" },
                  { href: "/admin/publications", label: "Publications", icon: "📄", desc: "Featured publications" },
                  { href: "/admin/events", label: "Events", icon: "📅", desc: "Upcoming events" },
                  { href: "/admin/blog", label: "Blog Posts", icon: "✍️", desc: "News slider posts" },
                  { href: "/admin/cv", label: "Awards & Achievements", icon: "🏆", desc: "Achievement gallery" },
                  { href: "/admin/profile", label: "Profile & Photos", icon: "👤", desc: "Hero photo and bio" },
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    className="flex items-start gap-3 p-4 bg-navy-50 border border-border rounded-xl hover:bg-primary-light hover:border-primary/30 transition-all group">
                    <span className="text-xl flex-shrink-0" aria-hidden="true">{item.icon}</span>
                    <div>
                      <p className="font-medium text-navy-900 text-sm group-hover:text-primary transition-colors">{item.label}</p>
                      <p className="text-navy-500 text-xs">{item.desc}</p>
                    </div>
                    <svg className="w-4 h-4 text-navy-400 ml-auto flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        {activeTab !== "content" && (
          <div className="flex justify-end mt-6">
            <Button type="submit" variant="primary" isLoading={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
