"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error server-side (in production, this would go to a logging service)
    console.error("Application error:", {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold text-navy-900 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-navy-700 mb-4">
          Something Went Wrong
        </h2>
        <p className="text-navy-600 mb-8">
          We apologize for the inconvenience. An unexpected error has occurred.
          Please try again or return to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-block px-6 py-3 border border-primary text-primary rounded-md hover:bg-primary-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
