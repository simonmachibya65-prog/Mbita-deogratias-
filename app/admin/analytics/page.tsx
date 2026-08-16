"use client";

import { useEffect, useState } from "react";
import BarChart from "@/components/ui/BarChart";
import DonutChart from "@/components/ui/DonutChart";
import Link from "next/link";

interface AnalyticsData {
  counts: Record<string, number>;
  charts: {
    pubsByType: { label: string; value: number }[];
    studentsByDegree: { label: string; value: number }[];
  };
  activity: {
    recent: Array<{ id: string; action: string; section: string; itemTitle: string | null; performedAt: string; performedBy: string }>;
    last30Days: number;
    last7Days: number;
  };
  upcomingEvents: Array<{ id: string; name: string; date: string; location: string }>;
  recentMessages: Array<{ id: string; name: string; email: string; message: string; read: boolean; receivedAt: string }>;
}

const TYPE_COLORS: Record<string, string> = {
  journal: "#334e68",
  conference: "#1a56db",
  book: "#057a55",
  book_chapter: "#92400e",
  technical_report: "#9b1c1c",
  other: "#6b7280",
};

const DEGREE_COLORS: Record<string, string> = {
  PhD: "#334e68",
  Masters: "#1a56db",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }

  if (!data) return <div className="p-6 text-red-600">Failed to load analytics.</div>;

  const { counts, charts, activity, upcomingEvents, recentMessages } = data;

  const statCards = [
    { label: "Publications", value: counts.publications, icon: "📄", href: "/admin/publications", color: "bg-blue-50 border-blue-200" },
    { label: "Research Projects", value: counts.research, icon: "🔬", href: "/admin/research", color: "bg-purple-50 border-purple-200" },
    { label: "Courses", value: counts.courses, icon: "🎓", href: "/admin/teaching", color: "bg-green-50 border-green-200" },
    { label: "Students", value: counts.students, icon: "👩‍🎓", href: "/admin/students", color: "bg-amber-50 border-amber-200" },
    { label: "Blog Posts", value: counts.blog, icon: "✍️", href: "/admin/blog", color: "bg-rose-50 border-rose-200" },
    { label: "Events", value: counts.events, icon: "📅", href: "/admin/events", color: "bg-indigo-50 border-indigo-200" },
    { label: "Gallery Items", value: counts.gallery, icon: "🖼️", href: "/admin/gallery", color: "bg-teal-50 border-teal-200" },
    { label: "Collaborators", value: counts.collaborators, icon: "🤝", href: "/admin/collaborations", color: "bg-orange-50 border-orange-200" },
    { label: "Unread Messages", value: counts.unreadMessages, icon: "✉️", href: "/admin/messages", color: counts.unreadMessages > 0 ? "bg-red-50 border-red-300" : "bg-gray-50 border-gray-200" },
    { label: "Newsletter Subs", value: counts.newsletter, icon: "📧", href: "/admin/settings", color: "bg-cyan-50 border-cyan-200" },
    { label: "Pending Appts", value: counts.appointments, icon: "📆", href: "/admin/messages", color: counts.appointments > 0 ? "bg-yellow-50 border-yellow-300" : "bg-gray-50 border-gray-200" },
    { label: "Testimonials", value: counts.testimonials, icon: "💬", href: "/admin/testimonials", color: "bg-pink-50 border-pink-200" },
  ];

  const pubChartData = charts.pubsByType.map((p) => ({
    label: p.label,
    value: p.value,
    color: TYPE_COLORS[p.label] ? undefined : undefined,
  }));

  const pubDonutData = charts.pubsByType.map((p) => ({
    label: p.label,
    value: p.value,
    color: TYPE_COLORS[p.label] ?? "#6b7280",
  }));

  const degreeDonutData = charts.studentsByDegree.map((s) => ({
    label: s.label,
    value: s.value,
    color: DEGREE_COLORS[s.label] ?? "#6b7280",
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Analytics Dashboard</h1>
        <div className="flex gap-4 text-sm text-navy-500">
          <span className="bg-navy-50 px-3 py-1.5 rounded-lg">
            <strong className="text-navy-900">{activity.last7Days}</strong> actions this week
          </span>
          <span className="bg-navy-50 px-3 py-1.5 rounded-lg">
            <strong className="text-navy-900">{activity.last30Days}</strong> actions this month
          </span>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`flex flex-col items-center p-4 rounded-xl border hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${card.color}`}
          >
            <span className="text-2xl mb-1" aria-hidden="true">{card.icon}</span>
            <span className="text-2xl font-bold text-navy-900">{card.value}</span>
            <span className="text-xs text-navy-500 text-center mt-0.5">{card.label}</span>
          </Link>
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Publications by type bar chart */}
        <div className="md:col-span-2 bg-white border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-navy-900 mb-4">Publications by Type</h2>
          {pubChartData.length > 0 ? (
            <BarChart data={pubChartData} height={180} />
          ) : (
            <p className="text-navy-400 text-sm text-center py-8">No publications yet</p>
          )}
        </div>

        {/* Students by degree donut */}
        <div className="bg-white border border-border rounded-xl p-6 flex flex-col items-center justify-center">
          <h2 className="text-base font-semibold text-navy-900 mb-4">Students by Degree</h2>
          {degreeDonutData.length > 0 ? (
            <DonutChart data={degreeDonutData} size={150} />
          ) : (
            <p className="text-navy-400 text-sm text-center py-8">No students yet</p>
          )}
        </div>
      </div>

      {/* ── PUBLICATIONS DONUT + UPCOMING EVENTS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Publications donut */}
        <div className="bg-white border border-border rounded-xl p-6 flex flex-col items-center">
          <h2 className="text-base font-semibold text-navy-900 mb-4">Publication Types Distribution</h2>
          {pubDonutData.length > 0 ? (
            <DonutChart data={pubDonutData} size={160} />
          ) : (
            <p className="text-navy-400 text-sm text-center py-8">No publications yet</p>
          )}
        </div>

        {/* Upcoming events */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-navy-900 mb-4">Upcoming Events</h2>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 p-3 bg-navy-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg" aria-hidden="true">📅</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy-900 text-sm truncate">{ev.name}</p>
                    <p className="text-xs text-navy-500">
                      {new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <p className="text-xs text-navy-400 truncate">{ev.location}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-navy-400 text-sm text-center py-8">No upcoming events</p>
          )}
        </div>
      </div>

      {/* ── RECENT ACTIVITY + MESSAGES ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-navy-900 mb-4">Recent Activity</h2>
          {activity.recent.length > 0 ? (
            <div className="space-y-2">
              {activity.recent.map((log) => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                  <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    log.action === "CREATE" ? "bg-green-500" :
                    log.action === "DELETE" ? "bg-red-500" : "bg-blue-500"
                  }`} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-navy-700">
                      <span className="font-medium capitalize">{log.action.toLowerCase()}</span>
                      {" "}<span className="text-navy-500">{log.section}</span>
                      {log.itemTitle && <span className="text-navy-600"> · {log.itemTitle}</span>}
                    </p>
                    <p className="text-xs text-navy-400">
                      {new Date(log.performedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-navy-400 text-sm text-center py-8">No recent activity</p>
          )}
        </div>

        {/* Recent messages */}
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-navy-900">Recent Messages</h2>
            <Link href="/admin/messages" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          {recentMessages.length > 0 ? (
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div key={msg.id} className={`p-3 rounded-lg border ${msg.read ? "bg-white border-border" : "bg-blue-50 border-blue-200"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-navy-900 text-sm">{msg.name}</p>
                    {!msg.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" aria-label="Unread" />}
                  </div>
                  <p className="text-xs text-navy-500 mb-1">{msg.email}</p>
                  <p className="text-xs text-navy-600 line-clamp-2">{msg.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-navy-400 text-sm text-center py-8">No messages yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
