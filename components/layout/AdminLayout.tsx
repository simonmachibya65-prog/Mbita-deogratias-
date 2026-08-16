"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
  professorName?: string;
  professorTitle?: string;
  professorPhoto?: string;
  professorEmail?: string;
}

// ── SIDEBAR LINK GROUPS ────────────────────────────────────────────────────
const sidebarGroups = [
  {
    label: "Overview",
    links: [
      { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
      { href: "/admin/analytics", label: "Analytics", icon: "📈" },
      { href: "/admin/ai-analytics", label: "AI Analytics", icon: "🤖" },
      { href: "/admin/notifications", label: "Notifications", icon: "🔔" },
    ],
  },
  {
    label: "Content",
    links: [
      { href: "/admin/home", label: "Home Page", icon: "🏠" },
      { href: "/admin/about", label: "About Page", icon: "ℹ️" },
      { href: "/admin/profile", label: "Profile", icon: "👤" },
      { href: "/admin/research", label: "Research", icon: "🔬" },
      { href: "/admin/datasets", label: "Datasets", icon: "📊" },
      { href: "/admin/presentations", label: "Presentations", icon: "🎤" },
      { href: "/admin/proposals", label: "Proposals", icon: "📋" },
      { href: "/admin/repository", label: "Repository", icon: "💻" },
      { href: "/admin/publications", label: "Publications", icon: "📄" },
      { href: "/admin/teaching", label: "Teaching", icon: "🎓" },
      { href: "/admin/grades", label: "Grades", icon: "📝" },
      { href: "/admin/attendance", label: "Attendance", icon: "✅" },
      { href: "/admin/plagiarism", label: "Plagiarism Check", icon: "🔍" },
      { href: "/admin/students", label: "Students", icon: "👩‍🎓" },
      { href: "/admin/cv", label: "CV & Awards", icon: "🏆" },
    ],
  },
  {
    label: "Media & Engagement",
    links: [
      { href: "/admin/blog", label: "Blog", icon: "✍️" },
      { href: "/admin/events", label: "Events", icon: "📅" },
      { href: "/admin/gallery", label: "Gallery", icon: "🖼️" },
      { href: "/admin/testimonials", label: "Testimonials", icon: "💬" },
      { href: "/admin/announcements", label: "Services", icon: "🛠️" },
    ],
  },
  {
    label: "Network",
    links: [
      { href: "/admin/collaborations", label: "Collaborations", icon: "🤝" },
      { href: "/admin/collaboration-requests", label: "Collab Requests", icon: "📬" },
      { href: "/admin/team", label: "Research Team", icon: "👥" },
    ],
  },
  {
    label: "Admin",
    links: [
      { href: "/admin/messages", label: "Messages", icon: "✉️" },
      { href: "/admin/settings", label: "Settings", icon: "⚙️" },
      { href: "/admin/backup", label: "Backup", icon: "💾" },
      { href: "/admin/security", label: "Security", icon: "🛡️" },
      { href: "/admin/account", label: "Account", icon: "🔑" },
    ],
  },
];

// ── PROFILE DROPDOWN ───────────────────────────────────────────────────────
function ProfileDropdown({
  name,
  title,
  photo,
  email,
  onLogout,
  loggingOut,
}: {
  name: string;
  title: string;
  photo: string;
  email: string;
  onLogout: () => void;
  loggingOut: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Professor profile menu"
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-navy-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {/* Avatar */}
        {photo ? (
          <Image
            src={photo}
            alt={name}
            width={36}
            height={36}
            className="rounded-full object-cover border-2 border-primary/20 flex-shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
            <span className="text-white font-bold text-sm">{name.charAt(0)}</span>
          </div>
        )}
        {/* Name */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-navy-900 leading-tight truncate max-w-[120px]">{name}</p>
          <p className="text-xs text-navy-400 leading-tight truncate max-w-[120px]">Admin</p>
        </div>
        <svg
          className={`w-3.5 h-3.5 text-navy-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Profile card */}
          <div className="p-4 bg-gradient-to-br from-navy-900 to-navy-700 text-white">
            <div className="flex items-center gap-3">
              {photo ? (
                <Image
                  src={photo}
                  alt={name}
                  width={52}
                  height={52}
                  className="rounded-full object-cover border-2 border-white/30 flex-shrink-0"
                />
              ) : (
                <div className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 border-2 border-white/30">
                  <span className="text-white font-bold text-xl">{name.charAt(0)}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{name}</p>
                <p className="text-xs text-navy-200 truncate">{title}</p>
                <p className="text-xs text-navy-300 truncate mt-0.5">{email}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-2">
            <Link
              href="/admin/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-navy-50 transition-colors text-sm text-navy-700 font-medium"
            >
              <span aria-hidden="true">👤</span> Edit Profile
            </Link>
            <Link
              href="/admin/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-navy-50 transition-colors text-sm text-navy-700 font-medium"
            >
              <span aria-hidden="true">🔑</span> Account Settings
            </Link>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-navy-50 transition-colors text-sm text-navy-700 font-medium"
              target="_blank"
            >
              <span aria-hidden="true">🌐</span> View Public Site
            </Link>
            <div className="border-t border-border my-1" />
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-sm text-red-600 font-medium disabled:opacity-50"
            >
              <span aria-hidden="true">🚪</span>
              {loggingOut ? "Logging out…" : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN ADMIN LAYOUT ──────────────────────────────────────────────────────
export default function AdminLayout({
  children,
  professorName = "Professor",
  professorTitle = "",
  professorPhoto = "",
  professorEmail = "",
}: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 w-64 bg-navy-900 flex flex-col transition-transform duration-300",
          "lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-label="Admin navigation"
      >
        {/* Sidebar brand */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy-700">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Admin Panel</p>
              <p className="text-navy-400 text-xs leading-tight">Content Manager</p>
            </div>
          </Link>
          <button
            className="lg:hidden text-navy-400 hover:text-white p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Professor mini-card in sidebar */}
        <div className="px-4 py-3 border-b border-navy-700">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-navy-800">
            {professorPhoto ? (
              <Image
                src={professorPhoto}
                alt={professorName}
                width={40}
                height={40}
                className="rounded-full object-cover border-2 border-navy-600 flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 border-2 border-navy-600">
                <span className="text-white font-bold">{professorName.charAt(0)}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{professorName}</p>
              <p className="text-navy-400 text-xs truncate">{professorTitle || "Professor"}</p>
            </div>
          </div>
        </div>

        {/* Navigation groups */}
        <nav className="flex-1 overflow-y-auto py-3 px-3" aria-label="Admin sections">
          {sidebarGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-3 mb-1 text-xs font-semibold text-navy-500 uppercase tracking-wider">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.links.map((link) => {
                  const active = isActive(link.href, link.exact);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setSidebarOpen(false)}
                        className={[
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                          active
                            ? "bg-primary text-white shadow-sm"
                            : "text-navy-300 hover:bg-navy-800 hover:text-white",
                        ].join(" ")}
                      >
                        <span aria-hidden="true" className="text-base w-5 text-center">{link.icon}</span>
                        <span className="truncate">{link.label}</span>
                        {active && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" aria-hidden="true" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="px-3 py-3 border-t border-navy-700">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-navy-300 hover:bg-navy-800 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white mb-1"
          >
            <span aria-hidden="true">🌐</span>
            <span>View Public Site</span>
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50"
          >
            <span aria-hidden="true">🚪</span>
            {loggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="bg-white dark:bg-navy-900 border-b border-border dark:border-navy-800 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg text-navy-600 hover:bg-navy-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb-style title */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-navy-400">Admin</span>
              <svg className="w-3.5 h-3.5 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-semibold text-navy-900 dark:text-gray-100 capitalize">
                {pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard"}
              </span>
            </div>
          </div>

          {/* Right side: quick actions + profile */}
          <div className="flex items-center gap-2">
            {/* Quick link to public site */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-navy-600 border border-border rounded-lg hover:bg-navy-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Site
            </Link>

            {/* Professor profile dropdown */}
            <ProfileDropdown
              name={professorName}
              title={professorTitle}
              photo={professorPhoto}
              email={professorEmail}
              onLogout={handleLogout}
              loggingOut={loggingOut}
            />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
