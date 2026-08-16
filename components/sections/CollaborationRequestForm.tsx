"use client";

import { useState } from "react";

interface CollaborationRequestFormProps {
  projectTitle?: string;
}

export default function CollaborationRequestForm({ projectTitle }: CollaborationRequestFormProps) {
  const [form, setForm] = useState({ name: "", email: "", institution: "", area: projectTitle ?? "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/collaboration-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("Your collaboration request has been submitted. We will get back to you soon.");
        setForm({ name: "", email: "", institution: "", area: projectTitle ?? "", message: "" });
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error ?? "Failed to submit. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  const inputClass = "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  if (status === "success") {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
        <svg className="w-10 h-10 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-green-800 font-medium">{message}</p>
      </div>
    );
  }

  return (
    <div className="bg-navy-50 rounded-xl p-6">
      {!open ? (
        <div className="text-center">
          <p className="text-navy-600 mb-4">Interested in collaborating on this research? Send a collaboration request.</p>
          <button
            onClick={() => setOpen(true)}
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Request Collaboration
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cr-name" className="block text-sm font-medium text-navy-900 mb-1">Name *</label>
              <input id="cr-name" name="name" required value={form.name} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="cr-email" className="block text-sm font-medium text-navy-900 mb-1">Email *</label>
              <input id="cr-email" name="email" type="email" required value={form.email} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div>
            <label htmlFor="cr-institution" className="block text-sm font-medium text-navy-900 mb-1">Institution *</label>
            <input id="cr-institution" name="institution" required value={form.institution} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="cr-area" className="block text-sm font-medium text-navy-900 mb-1">Area of Collaboration *</label>
            <input id="cr-area" name="area" required value={form.area} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="cr-message" className="block text-sm font-medium text-navy-900 mb-1">Message *</label>
            <textarea id="cr-message" name="message" required rows={4} value={form.message} onChange={handleChange}
              placeholder="Describe your collaboration proposal..." className={inputClass} />
          </div>
          {status === "error" && <p className="text-red-600 text-sm" role="alert">{message}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={() => setOpen(false)}
              className="px-4 py-2 border border-border text-navy-700 rounded-lg hover:bg-navy-50 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              Cancel
            </button>
            <button type="submit" disabled={status === "loading"}
              className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              {status === "loading" ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
