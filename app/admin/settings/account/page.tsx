"use client";

import { useState, useEffect, FormEvent } from "react";
import Button from "@/components/ui/Button";
import Image from "next/image";

interface AccountData {
  username: string;
  email: string;
  fullName: string;
  role: string;
  photoUrl?: string;
  createdAt: string;
}

export default function AccountPage() {
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    // Fetch account data
    fetch("/api/admin/account")
      .then((r) => r.json())
      .then((data) => {
        setAccount(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!account) return;
    
    setSaving(true);
    try {
      const res = await fetch("/api/admin/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
      });

      if (res.ok) {
        showToast("success", "Account updated successfully!");
      } else {
        showToast("error", "Failed to update account");
      }
    } catch {
      showToast("error", "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load account information</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className={[
            "p-4 rounded-xl text-sm font-medium flex items-center gap-3 shadow-lg animate-in slide-in-from-top",
            toast.type === "success"
              ? "bg-green-50 border border-green-300 text-green-800"
              : "bg-red-50 border border-red-300 text-red-700",
          ].join(" ")}
        >
          {toast.type === "success" ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      {/* Account Profile */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">👤</span>
          <h2 className="text-lg font-semibold text-navy-900">Account Profile</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center gap-4">
            {account.photoUrl ? (
              <Image
                src={account.photoUrl}
                alt={account.fullName}
                width={80}
                height={80}
                className="rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center border-2 border-border">
                <span className="text-white font-bold text-2xl">{account.fullName.charAt(0)}</span>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-navy-900">{account.fullName}</p>
              <p className="text-xs text-navy-500">{account.role}</p>
              <p className="text-xs text-navy-400 mt-1">Member since {new Date(account.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-navy-800 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={account.username}
                onChange={(e) => setAccount({ ...account, username: e.target.value })}
                className="w-full px-4 py-3 border border-border rounded-lg bg-navy-50 text-navy-500 cursor-not-allowed"
                disabled
              />
              <p className="mt-1 text-xs text-navy-500">Username cannot be changed</p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-navy-800 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={account.email}
                onChange={(e) => setAccount({ ...account, email: e.target.value })}
                className="w-full px-4 py-3 border border-border rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="fullName" className="block text-sm font-semibold text-navy-800 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={account.fullName}
                onChange={(e) => setAccount({ ...account, fullName: e.target.value })}
                className="w-full px-4 py-3 border border-border rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-navy-800 mb-2">
                Role
              </label>
              <input
                id="role"
                type="text"
                value={account.role}
                className="w-full px-4 py-3 border border-border rounded-lg bg-navy-50 text-navy-500 cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" isLoading={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>

      {/* Account Statistics */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📊</span>
          <h2 className="text-lg font-semibold text-navy-900">Account Statistics</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600 font-semibold uppercase">Total Logins</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">—</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-600 font-semibold uppercase">Last Login</p>
            <p className="text-sm font-bold text-green-900 mt-1">Today</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-600 font-semibold uppercase">Content Items</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">—</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-xs text-orange-600 font-semibold uppercase">Storage Used</p>
            <p className="text-sm font-bold text-orange-900 mt-1">—</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">⚠️</span>
          <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
        </div>
        <p className="text-sm text-red-700 mb-4">
          Irreversible and destructive actions. Please be certain before proceeding.
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm("Are you sure you want to delete your account? This action cannot be undone!")) {
              alert("Account deletion is disabled for security. Contact your administrator.");
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
