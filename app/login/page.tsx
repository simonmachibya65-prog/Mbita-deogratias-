"use client";

import { useState, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

type Step = "credentials" | "mfa";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [totpToken, setTotpToken] = useState("");
  const [errors, setErrors] = useState<{ username?: string; password?: string; totp?: string; general?: string }>({});
  const [lockoutMessage, setLockoutMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const totpRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLockoutMessage(null);
    setIsLoading(true);

    try {
      const body: Record<string, string> = { username, password };
      if (step === "mfa") body.totpToken = totpToken;

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      // MFA required — show MFA step
      if (res.ok && data.code === "MFA_REQUIRED") {
        setStep("mfa");
        setTimeout(() => totpRef.current?.focus(), 100);
        return;
      }

      if (res.ok) {
        router.push("/admin");
        return;
      }

      if (res.status === 423) {
        setLockoutMessage(data.error ?? "Account is temporarily locked.");
        return;
      }

      if (data.code === "INVALID_MFA") {
        setErrors({ totp: data.error });
        return;
      }

      if (res.status === 400 && data.fields) {
        setErrors(data.fields);
        return;
      }

      setErrors({ general: data.error ?? "Invalid credentials. Please try again." });
    } catch {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass = (hasError: boolean) => [
    "w-full px-3 py-2 border rounded-md text-navy-900 bg-white",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    hasError ? "border-red-500" : "border-border hover:border-navy-400",
  ].join(" ");

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8 text-center">
          <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-navy-900">
            {step === "mfa" ? "Two-Factor Authentication" : "Admin Login"}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {step === "mfa"
              ? "Enter the 6-digit code from your authenticator app"
              : "Sign in to manage your website content"}
          </p>
        </div>

        {lockoutMessage && (
          <div role="alert" className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-800 text-sm">
            <strong>Account Locked:</strong> {lockoutMessage}
          </div>
        )}

        {errors.general && (
          <div role="alert" id="general-error" className="mb-6 p-4 bg-red-50 border border-red-300 rounded-xl text-red-700 text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {step === "credentials" ? (
            <>
              <div className="mb-5">
                <label htmlFor="username" className="block text-sm font-medium text-navy-800 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  aria-required="true"
                  aria-describedby={errors.username ? "username-error" : undefined}
                  aria-invalid={!!errors.username}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass(!!errors.username)}
                />
                {errors.username && (
                  <p id="username-error" role="alert" className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-navy-800 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    aria-required="true"
                    aria-describedby={errors.password ? "password-error" : undefined}
                    aria-invalid={!!errors.password}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass(!!errors.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" role="alert" className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </>
          ) : (
            <div className="mb-6">
              <label htmlFor="totp" className="block text-sm font-medium text-navy-800 mb-1">
                Authentication Code
              </label>
              <input
                id="totp"
                ref={totpRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                aria-required="true"
                aria-describedby={errors.totp ? "totp-error" : "totp-hint"}
                aria-invalid={!!errors.totp}
                value={totpToken}
                onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className={`${inputClass(!!errors.totp)} text-center text-2xl tracking-[0.5em] font-mono`}
              />
              <p id="totp-hint" className="mt-1 text-xs text-navy-400">
                Open your authenticator app and enter the 6-digit code
              </p>
              {errors.totp && (
                <p id="totp-error" role="alert" className="mt-1 text-sm text-red-600">{errors.totp}</p>
              )}

              <button
                type="button"
                onClick={() => { setStep("credentials"); setTotpToken(""); setErrors({}); }}
                className="mt-3 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                ← Back to login
              </button>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
            {isLoading ? "Signing in…" : step === "mfa" ? "Verify Code" : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
