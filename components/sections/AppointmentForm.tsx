"use client";

import { useState } from "react";

export default function AppointmentForm() {
  const [form, setForm] = useState({ name: "", email: "", date: "", timeSlot: "", purpose: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("Appointment request submitted! You will receive a confirmation email.");
        setForm({ name: "", email: "", date: "", timeSlot: "", purpose: "" });
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

  if (status === "success") {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
        <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-green-800 font-medium">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="appt-name" className="block text-sm font-medium text-navy-900 mb-1">
            Full Name <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="appt-name"
            name="name"
            type="text"
            required
            aria-required="true"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="appt-email" className="block text-sm font-medium text-navy-900 mb-1">
            Email <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="appt-email"
            name="email"
            type="email"
            required
            aria-required="true"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="appt-date" className="block text-sm font-medium text-navy-900 mb-1">
            Preferred Date <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="appt-date"
            name="date"
            type="date"
            required
            aria-required="true"
            value={form.date}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="appt-time" className="block text-sm font-medium text-navy-900 mb-1">
            Time Slot <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <select
            id="appt-time"
            name="timeSlot"
            required
            aria-required="true"
            value={form.timeSlot}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option value="">Select a time</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="appt-purpose" className="block text-sm font-medium text-navy-900 mb-1">
          Purpose of Meeting <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <textarea
          id="appt-purpose"
          name="purpose"
          required
          aria-required="true"
          rows={3}
          value={form.purpose}
          onChange={handleChange}
          placeholder="Briefly describe the purpose of your meeting..."
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {status === "error" && (
        <p className="text-red-600 text-sm" role="alert">{message}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {status === "loading" ? "Submitting..." : "Request Appointment"}
      </button>
    </form>
  );
}
