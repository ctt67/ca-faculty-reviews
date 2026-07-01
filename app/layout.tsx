import Image from "next/image";
import type { Metadata } from "next";
import { Inter, Playfair_Display, Jost } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";
import CommunityLinks from "@/components/CommunityLinks";
import NewsletterSignup from "@/components/NewsletterSignup";
import CommunityFloat from "@/components/CommunityFloat";
import { Analytics } from "@vercel/analytics/next";
import { CONTACT_EMAIL, BASE_URL, SITE_NAME, INSTAGRAM_URL, TELEGRAM_URL } from "@/lib/config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["700"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const OG_DESCRIPTION =
  "Genuine reviews from CA students. Compare faculties across detailed student ratings for CA Final, Intermediate and Foundation — independent, no paid rankings.";

export const metadata: Metadata = {
  metadataBase: new URL("https://careviews.in"),
  title: "Careviews | Honest CA Faculty Reviews",
  description: OG_DESCRIPTION,
  verification: {
    google: "VWyYA_ltwZUPzQ32XQGCkl-j0spZmk0YI5mQV2BHwlM",
  },
  icons: {
    icon:     "/favicon.ico",
    shortcut: "/favicon.ico",
    apple:    "/apple-touch-icon.png",
  },
  openGraph: {
    title:       "Careviews | Honest CA Faculty Reviews",
    description: OG_DESCRIPTION,
    url:         "https://careviews.in",
    siteName:    "Careviews",
    locale:      "en_IN",
    type:        "website",
    images: [
      {
        url:    "/opengraph-image",
        width:  1200,
        height: 630,
        alt:    "Careviews — Honest CA Faculty Reviews",
      },
    ],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Careviews | Honest CA Faculty Reviews",
    description: OG_DESCRIPTION,
    images:      ["/opengraph-image"],
  },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: BASE_URL,
  logo: `${BASE_URL}/logo/careviews-mark-navy-1024.png`,
  contactPoint: { "@type": "ContactPoint", email: CONTACT_EMAIL, contactType: "customer support" },
  sameAs: [INSTAGRAM_URL, TELEGRAM_URL],
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: BASE_URL,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`${inter.variable} ${playfairDisplay.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-parchment text-ink">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationLd, websiteLd]) }} />

        <Navbar />

        <div className="flex-1">{children}</div>

        <footer className="bg-navy mt-auto">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

              {/* Brand */}
              <div>
                <Logo scheme="white" height={28} />
                <div className="flex items-center gap-2 mt-3">
                  <Image src="/20260101_200053.jpg" alt="Oreo" width={20} height={20} className="rounded-full object-cover border border-white/20 shrink-0" />
                  <p className="text-white/45 text-xs">For CA Students by CA Students</p>
                </div>
                <p className="text-white/30 text-xs mt-1">
                  <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white/60 transition">{CONTACT_EMAIL}</a>
                </p>
              </div>

              {/* Nav */}
              <div>
                <p className="text-white/35 text-[10px] font-semibold uppercase tracking-widest mb-4">Platform</p>
                <nav className="flex flex-col gap-2.5">
                  <a href="/final"      className="text-white/55 hover:text-white text-sm transition">CA Final</a>
                  <a href="/inter"      className="text-white/55 hover:text-white text-sm transition">CA Inter</a>
                  <a href="/foundation" className="text-white/55 hover:text-white text-sm transition">Foundation</a>
                  <a href="/compare"    className="text-white/55 hover:text-white text-sm transition">Compare</a>
                  <a href="/about"      className="text-white/55 hover:text-white text-sm transition">About</a>
                  <a href="/add-faculty" className="text-white/55 hover:text-white text-sm transition">Request a Faculty</a>
                </nav>
                <p className="text-white/35 text-[10px] font-semibold uppercase tracking-widest mt-6 mb-3">Legal</p>
                <nav className="flex flex-col gap-2">
                  <a href="/guidelines"           className="text-white/40 hover:text-white/70 text-xs transition">Review Guidelines</a>
                  <a href="/community-guidelines" className="text-white/40 hover:text-white/70 text-xs transition">Community Guidelines</a>
                  <a href="/privacy"              className="text-white/40 hover:text-white/70 text-xs transition">Privacy Policy</a>
                  <a href="/terms"                className="text-white/40 hover:text-white/70 text-xs transition">Terms of Service</a>
                </nav>
              </div>

              {/* Community */}
              <div>
                <p className="text-white/35 text-[10px] font-semibold uppercase tracking-widest mb-1">Community</p>
                <p className="text-white font-semibold text-sm mb-1">Join the Careviews Community</p>
                <p className="text-white/45 text-xs mb-4 leading-relaxed">
                  Get product updates, CA resources, and help shape Careviews through community feedback.
                </p>
                <CommunityLinks scheme="dark" size="sm" />
                <div className="mt-5">
                  <NewsletterSignup source="footer" scheme="dark" />
                </div>
              </div>

            </div>

            <p className="text-xs text-white/25 mt-10 border-t border-white/10 pt-6">
              Careviews is an independent student platform and is not affiliated with ICAI or any coaching institute.
            </p>
          </div>
        </footer>

        <CommunityFloat />

        <Analytics />
      </body>
    </html>
  );
}
