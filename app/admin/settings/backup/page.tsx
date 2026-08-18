"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";

interface BackupLog {
  id: string;
  filename: string;
  size?: string | null;
  status: string;
  createdAt: string;
}

export default function BackupPage() {
  const [logs, setLogs] = useState<BackupLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [backing, setBacking] = useState(false);
  const [message, setMessage] = useState("");

  const fetchLogs = async () => {
    const res = await fetch("/api/admin/backup");
    if (res.ok) setLogs(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleBackup = async () => {
    setBacking(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/backup", { method: "POST" });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setMessage("✅ Backup downloaded successfully!");
        fetchLogs();
      } else {
        setMessage("❌ Backup failed. Please try again.");
      }
    } catch {
      setMessage("❌ Backup failed. Please try again.");
    } finally {
      setBacking(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Backup action */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">💾</span>
          <h2 className="text-lg font-semibold text-navy-900">Create Backup</h2>
        </div>
        <p className="text-sm text-navy-600 mb-4">
          Downloads a complete JSON export of all your content: profile, publications, research, courses, students, awards, blog posts, events, collaborators, resources, gallery, testimonials, and site settings.
        </p>
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message}
          </div>
        )}
        <Button variant="primary" onClick={handleBackup} isLoading={backing}>
          {backing ? "Creating backup..." : "⬇️ Download Backup"}
        </Button>
      </div>

      {/* Restore info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h2 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
          <span aria-hidden="true">⚠️</span> Restore
        </h2>
        <p className="text-sm text-amber-800">
          To restore from a backup, contact your system administrator or developer. Automatic restore requires database access and is not available through the web interface for security reasons.
        </p>
      </div>

      {/* Backup history */}
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border bg-navy-50">
          <h2 className="font-semibold text-navy-900">Backup History</h2>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-navy-500 mt-3">Loading...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-navy-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-navy-500">No backups yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase">Filename</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-navy-600 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-navy-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-navy-700">{log.filename}</td>
                    <td className="px-4 py-3 text-navy-500">{log.size ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${log.status === "completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-navy-400 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
