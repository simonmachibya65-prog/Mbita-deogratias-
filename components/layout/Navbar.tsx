"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfessorAvatar from "@/components/ui/ProfessorAvatar";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface NavbarProfile {
  fullName: string;
  title: string;
  photoUrl?: string | null;
}

interface NavbarProps {
  profile?: NavbarProfile | null;
  hiddenSections?: string[];
}

// Search component
function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <div className="relative">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg text-navy-600 dark:text-gray-300 hover:bg-navy-50 dark:hover:bg-navy-800 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Open search"
          title="Search"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      ) : (
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-48 px-3 py-1.5 text-sm border border-border dark:border-navy-700 rounded-lg bg-white dark:bg-navy-800 text-navy-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            onBlur={() => {
              setTimeout(() => setIsOpen(false), 200);
            }}
          />
        </form>
      )}
    </div>
  );
}

// ── NAV STRUCTURE ──────────────────────────────────────────────────────────
const standaloneLinks = [
  { href: "/", label: "Home", key: "home" },
  { href: "/about", label: "About", key: "about" },
];

const dropdownGroups = [
  {
    label: "Academic",
    key: "academic",
    icon: "🎓",
    items: [
      { href: "/research", label: "Research & Projects", key: "research", icon: "🔬", desc: "Current and past research" },
      { href: "/research/repository", label: "Research Repository", key: "research-repository", icon: "📚", desc: "Browse research archive" },
      { href: "/research/proposals", label: "Research Proposals", key: "research-proposals", icon: "📝", desc: "Funding proposals" },
      { href: "/research/datasets", label: "Datasets", key: "datasets", icon: "💾", desc: "Open research data" },
      { href: "/research/presentations", label: "Presentations", key: "presentations", icon: "🎤", desc: "Conference talks & slides" },
      { href: "/publications", label: "Publications", key: "publications", icon: "📄", desc: "Papers, books & articles" },
      { href: "/cv", label: "CV & Achievements", key: "cv", icon: "🏆", desc: "Awards, grants & honours" },
      { href: "/collaborations", label: "Collaborations", key: "collaborations", icon: "🤝", desc: "Partners & resources" },
      { href: "/research-network", label: "Research Network", key: "research-network", icon: "🌐", desc: "Academic connections" },
      { href: "/peer-review", label: "Peer Review", key: "peer-review", icon: "👁️", desc: "Review activities" },
    ],
  },
  {
    label: "Teaching",
    key: "teaching-group",
    icon: "📚",
    items: [
      { href: "/teaching", label: "Teaching & Courses", key: "teaching", icon: "🎓", desc: "Active & archived courses" },
      { href: "/students", label: "Students & Supervision", key: "students", icon: "👩‍🎓", desc: "Current students & alumni" },
      { href: "/student-portal", label: "Student Portal", key: "student-portal", icon: "🎒", desc: "Login & registration" },
      { href: "/certificates", label: "Certificates", key: "certificates", icon: "🏅", desc: "Digital certificates" },
      { href: "/gamification", label: "Achievements & Badges", key: "gamification", icon: "🎮", desc: "Student achievements" },
      { href: "/scheduling", label: "Office Hours", key: "scheduling", icon: "📅", desc: "Book appointments" },
    ],
  },
  {
    label: "Resources",
    key: "resources",
    icon: "🛠️",
    items: [
      { href: "/video-library", label: "Video Library", key: "video-library", icon: "🎥", desc: "Educational videos" },
      { href: "/virtual-lab", label: "Virtual Lab", key: "virtual-lab", icon: "🧪", desc: "Online experiments" },
      { href: "/ai-assistant", label: "AI Assistant", key: "ai-assistant", icon: "🤖", desc: "Get instant help" },
      { href: "/marketplace", label: "Marketplace", key: "marketplace", icon: "🛒", desc: "Learning materials" },
      { href: "/integrations", label: "Integrations", key: "integrations", icon: "🔗", desc: "Connected tools" },
      { href: "/features", label: "Platform Features", key: "features", icon: "⚡", desc: "All capabilities" },
    ],
  },
  {
    label: "Community",
    key: "community",
    icon: "👥",
    items: [
      { href: "/alumni", label: "Alumni Network", key: "alumni", icon: "🎓", desc: "Connect with alumni" },
      { href: "/collaborations/team", label: "Team Collaboration", key: "team-collaboration", icon: "👨‍💼", desc: "Work together" },
      { href: "/live-polling", label: "Live Polls", key: "live-polling", icon: "📊", desc: "Interactive voting" },
      { href: "/newsletter", label: "Newsletter", key: "newsletter", icon: "📧", desc: "Subscribe to updates" },
    ],
  },
  {
    label: "Media",
    key: "media",
    icon: "📸",
    items: [
      { href: "/blog", label: "Blog / News & Events", key: "blog", icon: "✍️", desc: "Latest posts & news" },
      { href: "/events", label: "Events", key: "events", icon: "📅", desc: "Upcoming & past events" },
      { href: "/gallery", label: "Gallery", key: "gallery", icon: "🖼️", desc: "Photos & media" },
    ],
  },
  {
    label: "Analytics",
    key: "analytics-group",
    icon: "📊",
    items: [
      { href: "/impact-dashboard", label: "Impact Dashboard", key: "impact-dashboard", icon: "📈", desc: "Research impact metrics" },
      { href: "/analytics", label: "Analytics", key: "analytics", icon: "📉", desc: "Detailed statistics" },
      { href: "/funding-tracker", label: "Funding Tracker", key: "funding-tracker", icon: "💰", desc: "Grant management" },
    ],
  },
  {
    label: "More",
    key: "more",
    icon: "⚙️",
    items: [
      { href: "/accessibility", label: "Accessibility", key: "accessibility", icon: "♿", desc: "Accessibility tools" },
      { href: "/mobile-app", label: "Mobile App", key: "mobile-app", icon: "📱", desc: "Download our app" },
    ],
  },
];

const contactLink = { href: "/contact", label: "Contact", key: "contact" };

// ── ENHANCED DROPDOWN COMPONENT ────────────────────────────────────────────
interface DropdownProps {
  label: string;
  icon: string;
  items: { href: string; label: string; key: string; icon: string; desc: string }[];
  isGroupActive: boolean;
  hiddenSections: string[];
  onClose: () => void;
}

function DropdownMenu({ label, icon, items, isGroupActive, hiddenSections, onClose }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const visibleItems = items.filter((item) => !hiddenSections.includes(item.key));
  if (visibleItems.length === 0) return null;

  return (
    <div ref={ref} className="relative group">
      <button
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        aria-haspopup="true"
        className={[
          "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "hover:scale-[1.02] active:scale-[0.98]",
          isGroupActive
            ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary dark:text-navy-100 font-semibold shadow-sm"
            : "text-navy-700 dark:text-gray-200 hover:bg-navy-50 dark:hover:bg-navy-800 hover:text-navy-900 dark:hover:text-white",
        ].join(" ")}
      >
        <span aria-hidden="true" className="text-base">{icon}</span>
        <span className="tracking-wide">{label}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Enhanced Dropdown Panel */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-navy-800 border border-navy-100 dark:border-navy-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-2">
            {visibleItems.map((item, idx) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => { setOpen(false); onClose(); }}
                  className={[
                    "flex items-start gap-3 px-4 py-3 transition-all duration-150",
                    "hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                    "border-l-3 hover:border-l-primary",
                    active ? "bg-primary/5 dark:bg-navy-700/50 border-l-primary" : "border-l-transparent",
                    idx !== 0 ? "border-t border-navy-50 dark:border-navy-700/50" : "",
                  ].join(" ")}
                >
                  <span className="text-xl mt-0.5 flex-shrink-0 transition-transform group-hover:scale-110" aria-hidden="true">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold mb-0.5 ${active ? "text-primary dark:text-primary-light" : "text-navy-900 dark:text-gray-100"}`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-navy-500 dark:text-navy-400 leading-snug">{item.desc}</p>
                  </div>
                  {active && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0 animate-pulse" aria-hidden="true" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ENHANCED MAIN NAVBAR ───────────────────────────────────────────────────
export default function Navbar({ profile, hiddenSections = [] }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isGroupActive = (items: { href: string; key: string }[]) =>
    items.some((item) => isActive(item.href));

  const visibleStandalone = standaloneLinks.filter((l) => !hiddenSections.includes(l.key));

  return (
    <nav aria-label="Main navigation" className="bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border-b border-navy-100 dark:border-navy-800 shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* ── ENHANCED BRAND SECTION ── */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Profile Photo with Glow Effect */}
            <div className="relative group">
              <button
                onClick={() => window.location.href = '/login'}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full relative"
                aria-label="Admin access"
                title="Admin Panel"
              >
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <ProfessorAvatar
                  photoUrl={profile?.photoUrl}
                  alt={profile?.fullName ?? "Professor"}
                  width={48}
                  height={48}
                  className="relative flex-shrink-0 cursor-pointer hover:scale-105 transition-transform duration-300 ring-2 ring-navy-100 dark:ring-navy-700 hover:ring-primary/50"
                />
              </button>
            </div>

            {/* Name & Title with Enhanced Typography */}
            <Link
              href="/"
              className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1 -ml-2"
            >
              <span className="block text-lg font-bold text-navy-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-primary-light transition-colors duration-200 tracking-tight">
                {profile?.fullName ?? "Professor"}
              </span>
              {profile?.title && (
                <span className="block text-xs font-medium text-navy-500 dark:text-navy-400 group-hover:text-navy-600 dark:group-hover:text-navy-300 transition-colors duration-200 max-w-[220px] truncate">
                  {profile.title}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger */}
            <div className="lg:hidden ml-auto">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((p) => !p)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                className="p-2.5 rounded-lg text-navy-700 dark:text-gray-200 hover:bg-navy-100 dark:hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* ── ENHANCED DESKTOP NAVIGATION ── */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Standalone links */}
            {visibleStandalone.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={[
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  isActive(link.href)
                    ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary dark:text-navy-100 font-semibold shadow-sm"
                    : "text-navy-700 dark:text-gray-200 hover:bg-navy-50 dark:hover:bg-navy-800 hover:text-navy-900 dark:hover:text-white",
                ].join(" ")}
              >
                {link.label}
              </Link>
            ))}

            {/* Dropdown groups */}
            {dropdownGroups.map((group) => (
              <DropdownMenu
                key={group.key}
                label={group.label}
                icon={group.icon}
                items={group.items}
                isGroupActive={isGroupActive(group.items)}
                hiddenSections={hiddenSections}
                onClose={() => setMobileMenuOpen(false)}
              />
            ))}

            {/* Contact */}
            {!hiddenSections.includes(contactLink.key) && (
              <Link
                href={contactLink.href}
                aria-current={isActive(contactLink.href) ? "page" : undefined}
                className={[
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  isActive(contactLink.href)
                    ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary dark:text-navy-100 font-semibold shadow-sm"
                    : "text-navy-700 dark:text-gray-200 hover:bg-navy-50 dark:hover:bg-navy-800 hover:text-navy-900 dark:hover:text-white",
                ].join(" ")}
              >
                {contactLink.label}
              </Link>
            )}

            {/* Divider */}
            <div className="w-px h-6 bg-navy-200 dark:bg-navy-700 mx-2" aria-hidden="true" />

            {/* Search */}
            <SearchBar />

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* ── MOBILE EXTRAS ── */}
          <div className="lg:hidden flex items-center gap-2">
            <SearchBar />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="lg:hidden border-t border-border dark:border-navy-800 bg-white dark:bg-navy-900">
          <div className="px-4 py-3 space-y-1">

            {/* Standalone links */}
            {visibleStandalone.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={[
                  "block px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-primary-light dark:bg-navy-800 text-primary dark:text-navy-100 font-semibold"
                    : "text-navy-700 dark:text-gray-200 hover:bg-navy-50 dark:hover:bg-navy-800",
                ].join(" ")}
              >
                {link.label}
              </Link>
            ))}

            {/* Dropdown groups as accordions */}
            {dropdownGroups.map((group) => {
              const visibleItems = group.items.filter((i) => !hiddenSections.includes(i.key));
              if (visibleItems.length === 0) return null;
              const groupActive = isGroupActive(group.items);
              const isOpen = openMobileGroup === group.key;

              return (
                <div key={group.key}>
                  <button
                    onClick={() => setOpenMobileGroup(isOpen ? null : group.key)}
                    aria-expanded={isOpen}
                    className={[
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      groupActive ? "text-primary dark:text-navy-200" : "text-navy-700 dark:text-gray-200 hover:bg-navy-50 dark:hover:bg-navy-800",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true">{group.icon}</span>
                      {group.label}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-primary-light dark:border-navy-700 pl-3">
                      {visibleItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => { setMobileMenuOpen(false); setOpenMobileGroup(null); }}
                          className={[
                            "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                            isActive(item.href)
                              ? "bg-primary-light dark:bg-navy-800 text-primary dark:text-navy-100 font-semibold"
                              : "text-navy-600 dark:text-gray-300 hover:bg-navy-50 dark:hover:bg-navy-800 hover:text-navy-900 dark:hover:text-white",
                          ].join(" ")}
                        >
                          <span aria-hidden="true">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Contact */}
            {!hiddenSections.includes(contactLink.key) && (
              <Link
                href={contactLink.href}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive(contactLink.href) ? "page" : undefined}
                className={[
                  "block px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive(contactLink.href)
                    ? "bg-primary-light dark:bg-navy-800 text-primary dark:text-navy-100 font-semibold"
                    : "text-navy-700 dark:text-gray-200 hover:bg-navy-50 dark:hover:bg-navy-800",
                ].join(" ")}
              >
                {contactLink.label}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
