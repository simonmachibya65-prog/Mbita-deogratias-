"use client";

import { useState, useEffect } from "react";
import BarChart from "@/components/ui/BarChart";
import DonutChart from "@/components/ui/DonutChart";

interface AnalyticsData {
  counts: Record<string, number>;
  charts: {
    pubsByType: { label: string; value: number }[];
    studentsByDegree: { label: string; value: number }[];
  };
  activity: { last30Days: number; last7Days: number };
}

export default function AIAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [resourceData, setResourceData] = useState<{ totalViews: number; totalDownloads: number; analytics: Array<{ resource?: { title: string }; views: number; downloads: number }> } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/analytics").then(r => r.json()),
      fetch("/api/admin/resource-analytics").then(r => r.json()),
    ]).then(([analytics, resources]) => {
      setData(analytics);
      setResourceData(resources);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) return <div className="p-6 text-red-600">Failed to load analytics.</div>;

  const { counts, charts, activity } = data;

  // AI-generated insights
  const insights = [];
  if (counts.unreadMessages > 0) insights.push({ type: "warning", text: `You have ${counts.unreadMessages} unread message${counts.unreadMessages > 1 ? "s" : ""} waiting for your response.` });
  if (counts.publications > 0) insights.push({ type: "info", text: `Your ${counts.publications} publications span multiple types. Journal articles are most impactful for academic ranking.` });
  if (counts.students > 0) insights.push({ type: "success", text: `You are supervising ${counts.students} students. Regular milestone tracking improves completion rates.` });
  if (activity.last7Days > 10) insights.push({ type: "success", text: `High activity this week (${activity.last7Days} actions). Your content is being actively managed.` });
  if (activity.last7Days === 0) insights.push({ type: "warning", text: "No admin activity this week. Consider updating your content to keep the site fresh." });
  if (counts.blog < 3) insights.push({ type: "info", text: "Publishing more blog posts increases visitor engagement and SEO ranking." });
  if (resourceData && resourceData.totalViews > 0) insights.push({ type: "success", text: `Your resources have been viewed ${resourceData.totalViews} times and downloaded ${resourceData.totalDownloads} times.` });

  const INSIGHT_STYLES: Record<string, string> = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    success: "bg-green-50 border-green-200 text-green-800",
  };
  const INSIGHT_ICONS: Record<string, string> = { info: "💡", warning: "⚠️", success: "✅" };

  const pubChartData = charts.pubsByType.map(p => ({ label: p.label, value: p.value }));
  const degreeDonutData = charts.studentsByDegree.map((s, i) => ({
    label: s.label, value: s.value,
    color: i === 0 ? "#334e68" : "#1a56db",
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">AI Analytics</h1>
        <p className="text-navy-500 mt-1">Intelligent insights and data analysis for your website</p>
      </div>

      {/* AI Insights */}
      <section>
        <h2 className="text-lg font-semibold text-navy-900 mb-4">🤖 AI-Generated Insights</h2>
        <div className="space-y-3">
          {insights.length === 0 ? (
            <p className="text-navy-500 text-sm">No insights available yet. Add more content to get personalized recommendations.</p>
          ) : insights.map((insight, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${INSIGHT_STYLES[insight.type]}`}>
              <span className="text-lg flex-shrink-0" aria-hidden="true">{INSIGHT_ICONS[insight.type]}</span>
              <p className="text-sm">{insight.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Content overview */}
      <section>
        <h2 className="text-lg font-semibold text-navy-900 mb-4">📊 Content Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Publications", value: counts.publications, icon: "📄" },
            { label: "Research Projects", value: counts.research, icon: "🔬" },
            { label: "Students", value: counts.students, icon: "👩‍🎓" },
            { label: "Blog Posts", value: counts.blog, icon: "✍️" },
            { label: "Events", value: counts.events, icon: "📅" },
            { label: "Gallery Items", value: counts.gallery, icon: "🖼️" },
            { label: "Collaborators", value: counts.collaborators, icon: "🤝" },
            { label: "Unread Messages", value: counts.unreadMessages, icon: "✉️" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-border rounded-xl p-4 text-center">
              <p className="text-xl mb-1" aria-hidden="true">{s.icon}</p>
              <p className="text-2xl font-bold text-navy-900">{s.value}</p>
              <p className="text-xs text-navy-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-navy-900 mb-4">Publications by Type</h2>
          {pubChartData.length > 0 ? <BarChart data={pubChartData} height={160} /> : <p className="text-navy-400 text-sm text-center py-8">No data</p>}
        </div>
        <div className="bg-white border border-border rounded-xl p-6 flex flex-col items-center">
          <h2 className="text-base font-semibold text-navy-900 mb-4">Students by Degree</h2>
          {degreeDonutData.length > 0 ? <DonutChart data={degreeDonutData} size={150} /> : <p className="text-navy-400 text-sm text-center py-8">No data</p>}
        </div>
      </div>

      {/* Resource analytics */}
      {resourceData && resourceData.analytics.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-navy-900 mb-4">📚 Resource Analytics</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-navy-900">{resourceData.totalViews}</p>
              <p className="text-xs text-navy-500">Total Views</p>
            </div>
            <div className="bg-white border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-navy-900">{resourceData.totalDownloads}</p>
              <p className="text-xs text-navy-500">Total Downloads</p>
            </div>
          </div>
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-navy-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase">Resource</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase">Views</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase">Downloads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {resourceData.analytics.slice(0, 10).map((a, i) => (
                  <tr key={i} className="hover:bg-navy-50/50">
                    <td className="px-4 py-3 text-navy-800">{a.resource?.title ?? "Unknown"}</td>
                    <td className="px-4 py-3 text-navy-600">{a.views}</td>
                    <td className="px-4 py-3 text-navy-600">{a.downloads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Activity summary */}
      <section>
        <h2 className="text-lg font-semibold text-navy-900 mb-4">📈 Activity Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="text-3xl font-bold text-navy-900">{activity.last7Days}</p>
            <p className="text-navy-500 text-sm mt-1">Admin actions this week</p>
          </div>
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="text-3xl font-bold text-navy-900">{activity.last30Days}</p>
            <p className="text-navy-500 text-sm mt-1">Admin actions this month</p>
          </div>
        </div>
      </section>
    </div>
  );
}
