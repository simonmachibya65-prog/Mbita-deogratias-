import Link from "next/link";
import ProfessorAvatar from "@/components/ui/ProfessorAvatar";

interface FooterProfile {
  fullName: string;
  title: string;
  email: string;
  photoUrl?: string | null;
}

interface FooterProps {
  profile?: FooterProfile | null;
}

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/research", label: "Research" },
  { href: "/publications", label: "Publications" },
  { href: "/teaching", label: "Teaching" },
  { href: "/contact", label: "Contact" },
];

export default function Footer({ profile }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 dark:bg-navy-950 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Professor info with avatar */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <ProfessorAvatar
                photoUrl={profile?.photoUrl}
                alt={profile?.fullName ?? "Professor"}
                width={48}
                height={48}
                className="flex-shrink-0"
              />
              <div>
                <h3 className="font-semibold text-lg">
                  {profile?.fullName ?? "Professor"}
                </h3>
                <p className="text-sm text-navy-100">
                  {profile?.title ?? "Academic Title"}
                </p>
              </div>
            </div>
            {profile?.email && (
              <p className="text-sm text-navy-100">
                <a
                  href={`mailto:${profile.email}`}
                  className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                >
                  {profile.email}
                </a>
              </p>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-navy-100 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Copyright notice */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-4">About This Site</h3>
              <p className="text-sm text-navy-100">
                Academic personal website showcasing research, publications,
                teaching, and professional activities.
              </p>
            </div>
            <p className="text-sm text-navy-200 mt-4">
              © {currentYear} {profile?.fullName ?? "Professor"}. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
