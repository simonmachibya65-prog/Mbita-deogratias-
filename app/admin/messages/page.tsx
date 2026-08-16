"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  receivedAt: string;
}

export const dynamic = "force-dynamic";

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  const loadMessages = useCallback(async function () {
    try {
      const res = await fetch("/api/admin/messages");
      const data = await res.json();
      setMessages(data);
    } catch {
      showToast("error", "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  async function handleMarkRead(msg: ContactMessage) {
    try {
      const res = await fetch(`/api/admin/messages?id=${msg.id}`, { method: "PATCH" });
      if (res.ok) {
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
      } else {
        showToast("error", "Failed to mark as read.");
      }
    } catch { showToast("error", "An unexpected error occurred."); }
  }

  async function handleDelete(msg: ContactMessage) {
    if (!window.confirm(`Delete message from "${msg.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/messages?id=${msg.id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== msg.id));
        showToast("success", "Message deleted.");
      } else {
        showToast("error", "Failed to delete message.");
      }
    } catch { showToast("error", "An unexpected error occurred."); }
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy-900">Contact Messages</h2>
        <p className="text-gray-600 mt-1">
          {unreadCount > 0 ? (
            <span className="text-amber-700 font-medium">{unreadCount} unread message{unreadCount !== 1 ? "s" : ""}</span>
          ) : (
            "All messages read"
          )}
        </p>
      </div>

      {toast && (
        <div role="alert" className={["mb-4 p-3 rounded-md text-sm font-medium", toast.type === "success" ? "bg-green-50 border border-green-300 text-green-800" : "bg-red-50 border border-red-300 text-red-700"].join(" ")}>
          {toast.message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading…</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 bg-white border border-border rounded-lg text-gray-500">
          No messages yet.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <article
              key={msg.id}
              className={["bg-white border rounded-lg p-5 transition-colors", !msg.read ? "border-amber-300 bg-amber-50" : "border-border"].join(" ")}
              aria-label={`Message from ${msg.name}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-semibold text-navy-900">{msg.name}</span>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                    >
                      {msg.email}
                    </a>
                    {!msg.read && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-200 text-amber-800">
                        Unread
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{formatDate(msg.receivedAt)}</p>
                  <p className="text-sm text-navy-800 whitespace-pre-wrap">{msg.message}</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!msg.read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkRead(msg)}
                      aria-label={`Mark message from ${msg.name} as read`}
                    >
                      Mark Read
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(msg)}
                    aria-label={`Delete message from ${msg.name}`}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
