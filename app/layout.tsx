import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";
import { CONTACT_EMAIL } from "@/lib/config";

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

export const metadata: Metadata = {
  title: "CareViews | Honest CA Faculty Reviews",
  description:
    "Genuine reviews from CA students. Compare faculties across detailed student ratings for CA Final, Intermediate and Foundation — independent, no paid rankings.",
  verification: {
    google: "VWyYA_ltwZUPzQ32XQGCkl-j0spZmk0YI5mQV2BHwlM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-parchment text-ink">

        <Navbar />

        <div className="flex-1">{children}</div>

        <footer className="bg-navy mt-auto">
          <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="flex flex-col sm:flex-row justify-between gap-8">
              {/* Brand */}
              <div className="shrink-0">
                <div className="font-playfair text-lg font-bold">
                  <span className="text-gold">Care</span><span className="text-white">Views</span>
                </div>
                <p className="text-white/45 text-xs mt-2">For CA Students by CA Students</p>
                <p className="text-white/35 text-xs mt-1">Contact: {CONTACT_EMAIL}</p>
              </div>
              {/* Nav */}
              <nav className="flex flex-wrap gap-x-6 gap-y-2 items-start content-start">
                <a href="/final" className="text-white/55 hover:text-white text-sm transition">CA Final</a>
                <a href="/inter" className="text-white/55 hover:text-white text-sm transition">CA Inter</a>
                <a href="/foundation" className="text-white/55 hover:text-white text-sm transition">Foundation</a>
                <a href="/compare" className="text-white/55 hover:text-white text-sm transition">Compare</a>
              </nav>
            </div>
            <p className="text-xs text-white/30 mt-8 border-t border-white/10 pt-6">
              CareViews is an independent student platform and is not affiliated with ICAI or any coaching institute.
            </p>
          </div>
        </footer>

        <Analytics />
      </body>
    </html>
  );
}
