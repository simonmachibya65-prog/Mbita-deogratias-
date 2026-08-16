"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CourseFeedbackPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setMessage("Please select a rating."); return; }
    setStatus("loading");
    const res = await fetch("/api/admin/course-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, rating, comment, anonymous }),
    });
    if (res.ok) {
      setStatus("success");
      setMessage("Thank you for your feedback!");
    } else {
      setStatus("error");
      setMessage("Failed to submit feedback. Please try again.");
    }
  };

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  if (status === "success") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⭐</span>
        </div>
        <h2 className="text-2xl font-bold text-navy-900 mb-2">Thank You!</h2>
        <p className="text-navy-600 mb-6">Your feedback helps improve the course.</p>
        <Link href={`/teaching/${courseId}`} className="text-primary hover:underline">← Back to Course</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">
      <Link href={`/teaching/${courseId}`} className="text-sm text-primary hover:underline mb-4 inline-block">← Back to Course</Link>
      <h1 className="text-3xl font-bold text-navy-900 mb-2">Course Feedback</h1>
      <p className="text-navy-600 mb-8">Your feedback is anonymous and helps improve the course.</p>

      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-xl p-6 space-y-6">
        {/* Star rating */}
        <div>
          <span className="block text-sm font-medium text-navy-800 mb-3">Overall Rating *</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="text-4xl transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                aria-label={`Rate ${star} stars`}
              >
                <span className={(hovered || rating) >= star ? "text-amber-400" : "text-gray-200"}>★</span>
              </button>
            ))}
          </div>
          {(hovered || rating) > 0 && (
            <p className="text-sm text-navy-600 mt-1">{ratingLabels[hovered || rating]}</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="feedback-comment" className="block text-sm font-medium text-navy-800 mb-1">
            Comments (optional)
          </label>
          <textarea
            id="feedback-comment"
            rows={4}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="What did you like? What could be improved?"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Anonymous toggle */}
        <div className="flex items-center gap-3">
          <input id="anonymous" type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} className="w-4 h-4" />
          <label htmlFor="anonymous" className="text-sm text-navy-700">Submit anonymously</label>
        </div>

        {message && status === "error" && (
          <p className="text-red-600 text-sm">{message}</p>
        )}

        <button type="submit" disabled={status === "loading" || rating === 0}
          className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-60">
          {status === "loading" ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}
