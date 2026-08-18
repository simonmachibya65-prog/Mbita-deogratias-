"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const settingsTabs = [
  { href: "/admin/settings", label: "General", icon: "⚙️", exact: true },
  { href: "/admin/settings/backup", label: "Backup & Export", icon: "💾" },
  { href: "/admin/settings/security", label: "Security", icon: "🛡️" },
  { href: "/admin/settings/account", label: "Account", icon: "🔑" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy-900">Settings</h1>
        <p className="text-navy-600 mt-2">Manage your site configuration and preferences</p>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="mb-8 border-b border-border overflow-x-auto">
        <nav className="flex gap-1 min-w-max" aria-label="Settings sections">
          {settingsTabs.map((tab) => {
            const active = isActive(tab.href, tab.exact);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={[
                  "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
                  "hover:text-primary hover:bg-primary/5",
                  active
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-navy-600",
                ].join(" ")}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Page Content */}
      <div>{children}</div>
    </div>
  );
}
