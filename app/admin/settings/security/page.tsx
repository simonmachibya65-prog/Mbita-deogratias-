"use client";

import { useState, FormEvent } from "react";
import Button from "@/components/ui/Button";

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  async function handlePasswordChange(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      showToast("error", "New passwords do not match!");
      return;
    }

    if (newPassword.length < 8) {
      showToast("error", "Password must be at least 8 characters long!");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/security/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        showToast("success", "Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        showToast("error", data.error || "Failed to update password");
      }
    } catch {
      showToast("error", "An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
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

      {/* Change Password */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🔐</span>
          <h2 className="text-lg font-semibold text-navy-900">Change Password</h2>
        </div>
        <p className="text-sm text-navy-600 mb-6">
          Update your admin password. Make sure to use a strong password with at least 8 characters.
        </p>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-semibold text-navy-800 mb-2">
              Current Password <span className="text-red-500">*</span>
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-border rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-semibold text-navy-800 mb-2">
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-border rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <p className="mt-1 text-xs text-navy-500">Must be at least 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-navy-800 mb-2">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-border rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <Button type="submit" variant="primary" isLoading={saving}>
            {saving ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>

      {/* Security Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <span>💡</span> Security Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Use a password manager to generate and store strong passwords</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Never share your admin credentials with anyone</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Change your password regularly (every 3-6 months)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Always log out after using the admin panel on shared computers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Use HTTPS (secure connection) when accessing the admin panel</span>
          </li>
        </ul>
      </div>

      {/* Session Info */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📱</span>
          <h2 className="text-lg font-semibold text-navy-900">Active Session</h2>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-navy-600">Status:</span>
            <span className="font-semibold text-green-600">🟢 Active</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-navy-600">Login Time:</span>
            <span className="font-semibold text-navy-900">{new Date().toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-navy-600">Device:</span>
            <span className="font-semibold text-navy-900">Web Browser</span>
          </div>
        </div>
      </div>
    </div>
  );
}
