"use client";

import { useState, useEffect } from "react";
import BarChart from "@/components/ui/BarChart";

interface SecurityLog {
  id: string;
  event: string;
  username?: string | null;
  ipAddress?: string | null;
  details?: string | null;
  createdAt: string;
}

interface StatItem {
  event: string;
  _count: { id: number };
}

const EVENT_COLORS: Record<string, string> = {
  login_success: "bg-green-500",
  login_failed: "bg-red-500",
  locked: "bg-amber-500",
  logout: "bg-blue-500",
  mfa_enabled: "bg-purple-500",
  mfa_disabled: "bg-orange-500",
};

const EVENT_ICONS: Record<string, string> = {
  login_success: "✅",
  login_failed: "❌",
  locked: "🔒",
  logout: "🚪",
  mfa_enabled: "🛡️",
  mfa_disabled: "⚠️",
};

export default function SecurityPage() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/security-logs")
      .then(r => r.json())
      .then(d => { setLogs(d.logs ?? []); setStats(d.stats ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const chartData = stats.map(s => ({
    label: s.event.replace(/_/g, " "),
    value: s._count.id,
    color: EVENT_COLORS[s.event] ?? "bg-navy-400",
  }));

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Security Monitoring</h1>
        <p className="text-navy-500 mt-1">Login attempts, security events, and audit trail</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Stats chart */}
          {chartData.length > 0 && (
            <div className="bg-white border border-border rounded-xl p-6">
              <h2 className="text-base font-semibold text-navy-900 mb-4">Security Events Overview</h2>
              <BarChart data={chartData} height={160} />
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.slice(0, 4).map(s => (
              <div key={s.event} className="bg-white border border-border rounded-xl p-4 text-center">
                <p className="text-2xl mb-1" aria-hidden="true">{EVENT_ICONS[s.event] ?? "📊"}</p>
                <p className="text-2xl font-bold text-navy-900">{s._count.id}</p>
                <p className="text-xs text-navy-500 capitalize">{s.event.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>

          {/* Log table */}
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-navy-900">Recent Security Events</h2>
            </div>
            {logs.length === 0 ? (
              <p className="text-center text-navy-500 py-8">No security events recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-navy-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase">Event</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase">IP</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase">Details</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-navy-50/50">
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2">
                            <span aria-hidden="true">{EVENT_ICONS[log.event] ?? "📊"}</span>
                            <span className="capitalize text-navy-800">{log.event.replace(/_/g, " ")}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-navy-600">{log.username ?? "—"}</td>
                        <td className="px-4 py-3 text-navy-500 font-mono text-xs">{log.ipAddress ?? "—"}</td>
                        <td className="px-4 py-3 text-navy-500 text-xs">{log.details ?? "—"}</td>
                        <td className="px-4 py-3 text-navy-400 text-xs whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
