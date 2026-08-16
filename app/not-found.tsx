import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

async function getProfile() {
  try {
    const profile = await prisma.profile.findFirst();
    return profile;
  } catch {
    return null;
  }
}

async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findFirst();
    return settings;
  } catch {
    return null;
  }
}

export default async function NotFound() {
  const profile = await getProfile();
  const settings = await getSiteSettings();

  const navbarProfile = profile
    ? {
        fullName: profile.fullName,
        title: profile.title,
        photoUrl: profile.photoUrl || null,
      }
    : null;

  const footerProfile = profile
    ? {
        fullName: profile.fullName,
        title: profile.title,
        email: profile.email,
        photoUrl: profile.photoUrl || null,
      }
    : null;

  const hiddenSections = settings?.hiddenSections
    ? (Array.isArray(settings.hiddenSections)
        ? settings.hiddenSections
        : JSON.parse(settings.hiddenSections as string))
    : [];

  return (
    <>
      <Navbar profile={navbarProfile} hiddenSections={hiddenSections} />
      <main id="main-content" className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center px-4 py-16">
          <h1 className="text-6xl font-bold text-navy-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-navy-700 mb-4">
            Page Not Found
          </h2>
          <p className="text-navy-600 mb-8">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Return to Homepage
          </Link>
        </div>
      </main>
      <Footer profile={footerProfile} />
    </>
  );
}
