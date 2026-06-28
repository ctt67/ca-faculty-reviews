import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CA Reviews",
  description:
    "Find and compare the best CA faculties across Final, Intermediate and Foundation. Real reviews from real students.",

  verification: {
    google: "PASTE_GOOGLE_TOKEN_HERE",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-100">

        <Navbar />

        <div className="flex-1">{children}</div>

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
          <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white font-extrabold text-lg">
              CA<span className="text-blue-500">Faculty</span>Reviews
            </div>
            <p className="text-slate-500 text-sm">
              For CA Students by CA Students
            </p>
            <p className="text-xs text-slate-500 text-center max-w-xl">
              CAFacultyReviews is an independent student platform and is not affiliated with ICAI or any coaching institute.
            </p>
            <p className="text-slate-500 text-xs mt-2">
              Contact: cagargrohan953@gmail.com
            </p>
            <nav className="flex gap-2">
              <a href="/final" className="text-slate-400 hover:text-white text-sm transition">CA Final</a>
              <a href="/inter" className="text-slate-400 hover:text-white text-sm transition">CA Inter</a>
              <a href="/foundation" className="text-slate-400 hover:text-white text-sm transition">Foundation</a>
              <a href="/compare" className="text-slate-400 hover:text-white text-sm transition">Compare</a>
            </nav>
          </div>
        </footer>

        <Analytics />
      </body>
    </html>
  );
}
