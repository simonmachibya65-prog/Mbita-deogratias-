"use client";

import { useState } from "react";
import { contactSchema, ContactFormData } from "@/lib/schemas/contact";
import Button from "@/components/ui/Button";

interface FieldErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setFieldErrors({});

    // Client-side validation
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (field) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message ?? "Your message has been sent successfully.");
        setFormData({ name: "", email: "", message: "" });
      } else if (response.status === 400 && data.fields) {
        setFieldErrors(data.fields);
        setErrorMessage(data.error ?? "Please correct the errors below.");
      } else {
        setErrorMessage(
          data.error ?? "An unexpected error occurred. Please try again."
        );
      }
    } catch {
      setErrorMessage(
        "A network error occurred. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Success message */}
      {successMessage && (
        <div
          role="alert"
          className="p-4 bg-accent-green/10 border border-accent-green/30 rounded-md text-accent-green"
        >
          {successMessage}
        </div>
      )}

      {/* General error message */}
      {errorMessage && !Object.keys(fieldErrors).length && (
        <div
          role="alert"
          className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-md text-accent-red"
        >
          {errorMessage}
        </div>
      )}

      {/* Name field */}
      <div>
        <label
          htmlFor="contact-name"
          className="block text-sm font-medium text-navy-900 mb-1"
        >
          Name
          <span className="text-accent-red ml-1" aria-hidden="true">*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          aria-required="true"
          aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
          aria-invalid={!!fieldErrors.name}
          className={[
            "w-full px-4 py-2 border rounded-md text-navy-900 placeholder-gray-400",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            fieldErrors.name ? "border-accent-red" : "border-border",
          ].join(" ")}
          placeholder="Your full name"
          autoComplete="name"
        />
        {fieldErrors.name && (
          <p
            id="contact-name-error"
            role="alert"
            className="mt-1 text-sm text-accent-red"
          >
            {fieldErrors.name}
          </p>
        )}
      </div>

      {/* Email field */}
      <div>
        <label
          htmlFor="contact-email"
          className="block text-sm font-medium text-navy-900 mb-1"
        >
          Email
          <span className="text-accent-red ml-1" aria-hidden="true">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          aria-required="true"
          aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
          aria-invalid={!!fieldErrors.email}
          className={[
            "w-full px-4 py-2 border rounded-md text-navy-900 placeholder-gray-400",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            fieldErrors.email ? "border-accent-red" : "border-border",
          ].join(" ")}
          placeholder="your.email@example.com"
          autoComplete="email"
        />
        {fieldErrors.email && (
          <p
            id="contact-email-error"
            role="alert"
            className="mt-1 text-sm text-accent-red"
          >
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Message field */}
      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-medium text-navy-900 mb-1"
        >
          Message
          <span className="text-accent-red ml-1" aria-hidden="true">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={6}
          aria-required="true"
          aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
          aria-invalid={!!fieldErrors.message}
          className={[
            "w-full px-4 py-2 border rounded-md text-navy-900 placeholder-gray-400 resize-vertical",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            fieldErrors.message ? "border-accent-red" : "border-border",
          ].join(" ")}
          placeholder="Your message..."
        />
        {fieldErrors.message && (
          <p
            id="contact-message-error"
            role="alert"
            className="mt-1 text-sm text-accent-red"
          >
            {fieldErrors.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
