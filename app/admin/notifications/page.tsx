"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string | null;
  createdAt: string;
}

const TYPE_STYLES: Record<string, string> = {
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
};

const TYPE_ICONS: Record<string, string> = {
  info: "ℹ️", warning: "⚠️", success: "✅", error: "❌",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/notifications");
    if (res.ok) setNotifications(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id?: string) => {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { id } : { all: true }),
    });
    fetchNotifications();
  };

  const deleteNotification = async (id?: string) => {
    const url = id ? `/api/admin/notifications?id=${id}` : "/api/admin/notifications";
    await fetch(url, { method: "DELETE" });
    fetchNotifications();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-navy-500 mt-0.5">{unreadCount} unread</p>}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="ghost" onClick={() => markRead()}>Mark all read</Button>
          )}
          <Button variant="danger" onClick={() => deleteNotification()}>Clear read</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-navy-50 rounded-2xl">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-navy-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className={`flex items-start gap-4 p-4 rounded-xl border ${!n.read ? "bg-white shadow-sm" : "bg-gray-50 opacity-70"} ${TYPE_STYLES[n.type] ?? TYPE_STYLES.info}`}>
              <span className="text-xl flex-shrink-0" aria-hidden="true">{TYPE_ICONS[n.type] ?? "ℹ️"}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{n.title}</p>
                <p className="text-sm mt-0.5">{n.message}</p>
                {n.link && <a href={n.link} className="text-xs underline mt-1 inline-block">View →</a>}
                <p className="text-xs opacity-60 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!n.read && (
                  <button onClick={() => markRead(n.id)} className="text-xs px-2 py-1 bg-white/50 rounded hover:bg-white/80 transition-colors">
                    Mark read
                  </button>
                )}
                <button onClick={() => deleteNotification(n.id)} className="text-xs px-2 py-1 bg-white/50 rounded hover:bg-red-100 transition-colors">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
