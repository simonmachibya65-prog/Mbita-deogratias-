"use client";

import { useState, FormEvent, useEffect } from "react";
import Button from "@/components/ui/Button";
import Image from "next/image";

export const dynamic = "force-dynamic";

interface MFASetupData {
  secret: string;
  qrUrl: string;
}

export default function AdminAccountPage() {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // MFA state
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaSetup, setMfaSetup] = useState<MFASetupData | null>(null);
  const [mfaToken, setMfaToken] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState("");
  const [mfaSuccess, setMfaSuccess] = useState("");
  const [disableToken, setDisableToken] = useState("");
  const [showDisable, setShowDisable] = useState(false);

  useEffect(() => {
    // Check MFA status
    fetch("/api/admin/mfa/status").then(r => r.json()).then(d => {
      if (d.totpEnabled !== undefined) setMfaEnabled(d.totpEnabled);
    }).catch(() => {});
  }, []);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      setSaving(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("success", "Password changed successfully.");
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        if (data.fields) setErrors(data.fields);
        showToast("error", data.error ?? "Failed to change password.");
      }
    } catch {
      showToast("error", "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }

  async function handleMFASetup() {
    setMfaLoading(true);
    setMfaError("");
    try {
      const res = await fetch("/api/admin/mfa/setup", { method: "POST" });
      const data = await res.json();
      if (res.ok) setMfaSetup(data);
      else setMfaError(data.error ?? "Failed to setup MFA");
    } catch {
      setMfaError("Failed to setup MFA");
    } finally {
      setMfaLoading(false);
    }
  }

  async function handleMFAVerify(e: FormEvent) {
    e.preventDefault();
    setMfaLoading(true);
    setMfaError("");
    try {
      const res = await fetch("/api/admin/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: mfaToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setMfaEnabled(true);
        setMfaSetup(null);
        setMfaToken("");
        setMfaSuccess("Two-factor authentication is now enabled!");
        setTimeout(() => setMfaSuccess(""), 4000);
      } else {
        setMfaError(data.error ?? "Invalid code");
      }
    } catch {
      setMfaError("Verification failed");
    } finally {
      setMfaLoading(false);
    }
  }

  async function handleMFADisable(e: FormEvent) {
    e.preventDefault();
    setMfaLoading(true);
    setMfaError("");
    try {
      const res = await fetch("/api/admin/mfa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: disableToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setMfaEnabled(false);
        setShowDisable(false);
        setDisableToken("");
        setMfaSuccess("Two-factor authentication has been disabled.");
        setTimeout(() => setMfaSuccess(""), 4000);
      } else {
        setMfaError(data.error ?? "Invalid code");
      }
    } catch {
      setMfaError("Failed to disable MFA");
    } finally {
      setMfaLoading(false);
    }
  }

  const inputClass = (hasError: boolean) => [
    "w-full px-3 py-2 border rounded-md text-navy-900 bg-white text-sm",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    hasError ? "border-red-500" : "border-border",
  ].join(" ");

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-navy-900">Account Settings</h2>
        <p className="text-gray-500 mt-1">Manage your password and security settings</p>
      </div>

      {toast && (
        <div role="alert" className={`p-4 rounded-xl text-sm font-medium ${toast.type === "success" ? "bg-green-50 border border-green-300 text-green-800" : "bg-red-50 border border-red-300 text-red-700"}`}>
          {toast.message}
        </div>
      )}

      {/* ── CHANGE PASSWORD ── */}
      <div className="bg-white border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-navy-800 mb-4">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-navy-800 mb-1">Current Password *</label>
            <input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} aria-required="true" className={inputClass(!!errors.currentPassword)} />
            {errors.currentPassword && <p className="mt-1 text-xs text-red-600">{errors.currentPassword}</p>}
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-navy-800 mb-1">New Password *</label>
            <input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} aria-required="true" className={inputClass(!!errors.newPassword)} />
            {errors.newPassword ? <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p> : <p className="mt-1 text-xs text-gray-400">Minimum 12 characters</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy-800 mb-1">Confirm New Password *</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} aria-required="true" className={inputClass(!!errors.confirmPassword)} />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" isLoading={saving}>
              {saving ? "Changing…" : "Change Password"}
            </Button>
          </div>
        </form>
      </div>

      {/* ── TWO-FACTOR AUTHENTICATION ── */}
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-navy-800">Two-Factor Authentication</h3>
            <p className="text-sm text-navy-500 mt-0.5">Add an extra layer of security to your account</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${mfaEnabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {mfaEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>

        {mfaSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{mfaSuccess}</div>
        )}
        {mfaError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">{mfaError}</div>
        )}

        {!mfaEnabled && !mfaSetup && (
          <div>
            <p className="text-sm text-navy-600 mb-4">
              Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to generate time-based codes.
            </p>
            <Button variant="primary" onClick={handleMFASetup} isLoading={mfaLoading}>
              Enable Two-Factor Authentication
            </Button>
          </div>
        )}

        {mfaSetup && !mfaEnabled && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium text-navy-800 mb-3">1. Scan this QR code with your authenticator app:</p>
              <div className="flex justify-center">
                <Image src={mfaSetup.qrUrl} alt="MFA QR Code" width={200} height={200} className="border border-border rounded-xl p-2 bg-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-navy-800 mb-1">Or enter this secret manually:</p>
              <code className="block bg-navy-50 border border-border rounded-lg px-4 py-2 text-sm font-mono text-navy-700 break-all">
                {mfaSetup.secret}
              </code>
            </div>
            <form onSubmit={handleMFAVerify} className="space-y-3">
              <div>
                <label htmlFor="mfa-token" className="block text-sm font-medium text-navy-800 mb-1">
                  2. Enter the 6-digit code to verify:
                </label>
                <input
                  id="mfa-token"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={mfaToken}
                  onChange={e => setMfaToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-border rounded-lg text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-required="true"
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={() => { setMfaSetup(null); setMfaToken(""); setMfaError(""); }}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={mfaLoading} disabled={mfaToken.length !== 6}>
                  Verify & Enable
                </Button>
              </div>
            </form>
          </div>
        )}

        {mfaEnabled && !showDisable && (
          <div>
            <p className="text-sm text-navy-600 mb-4">
              Two-factor authentication is active. Your account requires a code from your authenticator app on each login.
            </p>
            <Button variant="danger" onClick={() => setShowDisable(true)}>
              Disable Two-Factor Authentication
            </Button>
          </div>
        )}

        {mfaEnabled && showDisable && (
          <form onSubmit={handleMFADisable} className="space-y-4">
            <p className="text-sm text-navy-700">Enter your current authenticator code to disable MFA:</p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={disableToken}
              onChange={e => setDisableToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 border border-border rounded-lg text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Authenticator code to disable MFA"
            />
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => { setShowDisable(false); setDisableToken(""); setMfaError(""); }}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" isLoading={mfaLoading} disabled={disableToken.length !== 6}>
                Disable MFA
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
