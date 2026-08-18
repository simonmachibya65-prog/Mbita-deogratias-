import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mbita-deogratias.vercel.app'),
  title: {
    default: "Mbita Deogratias - Academic Profile & Research",
    template: "%s | Mbita Deogratias",
  },
  description: "Official academic website of Mbita Deogratias. Explore research publications, teaching resources, academic collaborations, and professional achievements.",
  keywords: [
    "Mbita Deogratias",
    "Academic Profile",
    "Research",
    "Publications",
    "Teaching",
    "Higher Education",
    "Professor",
    "Researcher",
    "Academic Portfolio",
    "University",
    "Scholar"
  ],
  authors: [{ name: "Mbita Deogratias" }],
  creator: "Mbita Deogratias",
  publisher: "Mbita Deogratias",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: "lKgCZMyDKdyEjfWbqCe0OxM7CAqzv-FPL-jbrleKKzo",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mbita-deogratias.vercel.app',
    siteName: 'Mbita Deogratias',
    title: 'Mbita Deogratias - Academic Profile & Research',
    description: 'Official academic website of Mbita Deogratias. Explore research publications, teaching resources, academic collaborations, and professional achievements.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mbita Deogratias - Academic Profile',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mbita Deogratias - Academic Profile & Research',
    description: 'Official academic website of Mbita Deogratias. Explore research publications, teaching resources, academic collaborations, and professional achievements.',
    images: ['/og-image.jpg'],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// Root layout — ONLY wraps with html/body.
// Navbar/Footer are added by child layouts:
//   - app/(public)/layout.tsx  → public pages
//   - app/admin/layout.tsx     → admin pages (has its own AdminLayout)
//   - app/login/page.tsx       → standalone login page
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="lKgCZMyDKdyEjfWbqCe0OxM7CAqzv-FPL-jbrleKKzo" />
        <link rel="canonical" href="https://mbita-deogratias.vercel.app" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var t = localStorage.getItem('theme');
            if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            }
          })();
        `}} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Mbita Deogratias",
              "url": "https://mbita-deogratias.vercel.app",
              "jobTitle": "Professor",
              "description": "Academic researcher and educator",
              "sameAs": [
                "https://scholar.google.com",
                "https://orcid.org",
                "https://www.researchgate.net"
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
