import { prisma } from "@/lib/prisma";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getPhotoForSlot } from "@/lib/profilePhotos";

export const fetchCache = "force-no-store";

// Lazy-load the chatbot — it's not needed for initial render
const AIChatbot = dynamic(() => import("@/components/sections/AIChatbot"), {
  ssr: false,
});

async function getProfile() {
  try {
    return await prisma.profile.findFirst({
      select: {
        fullName: true,
        title: true,
        email: true,
        photoUrl: true,
        navbarPhotoUrl: true,
        footerPhotoUrl: true,
        cvUrl: true,
      },
    });
  } catch {
    return null;
  }
}

async function getSiteSettings() {
  try {
    return await prisma.siteSettings.findFirst({
      select: { hiddenSections: true, maintenanceMode: true },
    });
  } catch {
    return null;
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  const settings = await getSiteSettings();

  // Use slot-specific photos with fallback to main photoUrl
  const navbarPhoto = getPhotoForSlot(profile, "navbar");
  const footerPhoto = getPhotoForSlot(profile, "footer");

  const navbarProfile = profile
    ? { fullName: profile.fullName, title: profile.title, photoUrl: navbarPhoto || null }
    : null;

  const footerProfile = profile
    ? { fullName: profile.fullName, title: profile.title, email: profile.email, photoUrl: footerPhoto || null }
    : null;

  const hiddenSections = settings?.hiddenSections
    ? (Array.isArray(settings.hiddenSections)
        ? (settings.hiddenSections as string[])
        : JSON.parse(settings.hiddenSections as string))
    : [];

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <Navbar profile={navbarProfile} hiddenSections={hiddenSections} />

      <main id="main-content" className="flex-1 dark:bg-slate-900">
        {children}
      </main>

      <Footer profile={footerProfile} />

      <AIChatbot />
    </>
  );
}
