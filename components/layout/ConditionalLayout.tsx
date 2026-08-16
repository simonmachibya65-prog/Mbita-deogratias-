"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIChatbot from "@/components/sections/AIChatbot";

interface NavbarProfile {
  fullName: string;
  title: string;
  photoUrl?: string | null;
}

interface FooterProfile {
  fullName: string;
  title: string;
  email: string;
  photoUrl?: string | null;
}

interface ConditionalLayoutProps {
  children: React.ReactNode;
  navbarProfile?: NavbarProfile | null;
  footerProfile?: FooterProfile | null;
  hiddenSections?: string[];
  tawktoId?: string;
}

// Pages that should NOT show the public Navbar/Footer
const ADMIN_PATHS = ["/admin", "/login"];

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p));
}

export default function ConditionalLayout({
  children,
  navbarProfile,
  footerProfile,
  hiddenSections = [],
}: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdmin = isAdminPath(pathname);

  if (isAdmin) {
    // Admin and login pages: no public Navbar, no Footer, no Chatbot
    return <>{children}</>;
  }

  // Public pages: show Navbar, Footer, Chatbot
  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Navbar profile={navbarProfile} hiddenSections={hiddenSections} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer profile={footerProfile} />
      <AIChatbot />
    </>
  );
}
