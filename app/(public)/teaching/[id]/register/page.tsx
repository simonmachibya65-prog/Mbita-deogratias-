"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CourseRegistrationPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [form, setForm] = useState({ studentName: "", email: "", phone: "", notes: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/admin/course-registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, courseId }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("success");
      setMessage("✅ Registration submitted! You will be notified once approved.");
    } else {
      setStatus("error");
      setMessage(data.error ?? "Registration failed. Please try again.");
    }
  };

  const inputClass = "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  if (status === "success") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-navy-900 mb-2">Registration Submitted!</h2>
        <p className="text-navy-600 mb-6">{message}</p>
        <Link href={`/teaching/${courseId}`} className="text-primary hover:underline">← Back to Course</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">
      <Link href={`/teaching/${courseId}`} className="text-sm text-primary hover:underline mb-4 inline-block">← Back to Course</Link>
      <h1 className="text-3xl font-bold text-navy-900 mb-2">Course Registration</h1>
      <p className="text-navy-600 mb-8">Fill in your details to register for this course.</p>

      {status === "error" && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{message}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-xl p-6 space-y-4">
        <div>
          <label htmlFor="reg-name" className="block text-sm font-medium text-navy-800 mb-1">Full Name *</label>
          <input id="reg-name" required value={form.studentName} onChange={e => setForm(p => ({ ...p, studentName: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium text-navy-800 mb-1">Email Address *</label>
          <input id="reg-email" type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label htmlFor="reg-phone" className="block text-sm font-medium text-navy-800 mb-1">Phone Number</label>
          <input id="reg-phone" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label htmlFor="reg-notes" className="block text-sm font-medium text-navy-800 mb-1">Additional Notes</label>
          <textarea id="reg-notes" rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className={`${inputClass} resize-none`} />
        </div>
        <button type="submit" disabled={status === "loading"}
          className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-60">
          {status === "loading" ? "Submitting..." : "Register for Course"}
        </button>
      </form>
    </div>
  );
}
