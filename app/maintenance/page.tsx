import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findFirst();
    return settings;
  } catch {
    return null;
  }
}

export default async function MaintenancePage() {
  const settings = await getSiteSettings();

  const defaultMessage =
    "The website is currently undergoing scheduled maintenance. We'll be back shortly. Thank you for your patience.";

  const message = settings?.maintenanceMsg || defaultMessage;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Maintenance icon */}
        <div className="mb-8 flex justify-center">
          <svg
            className="w-24 h-24 text-navy-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-navy-900 mb-4">
          Under Maintenance
        </h1>

        {/* Custom message */}
        <div className="prose prose-navy max-w-none mb-8">
          <p className="text-lg text-navy-700 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        {/* Admin login link */}
        <div className="mt-8">
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 bg-navy-600 text-white rounded-md hover:bg-navy-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Admin Login
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Metadata for maintenance page
export async function generateMetadata() {
  return {
    title: "Under Maintenance",
    description: "The website is currently undergoing maintenance.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

/**
 * Note on HTTP 503 Status:
 * Next.js App Router pages cannot directly set HTTP status codes.
 * In production, configure your hosting platform (Vercel, Netlify, etc.) or
 * reverse proxy (nginx, Apache) to return HTTP 503 for the /maintenance route.
 * 
 * Example nginx configuration:
 *   location /maintenance {
 *     return 503;
 *   }
 * 
 * The middleware sets Retry-After and Cache-Control headers appropriately.
 */
