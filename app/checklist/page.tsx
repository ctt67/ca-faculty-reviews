import type { Metadata } from "next";
import Link from "next/link";
import ChecklistClient from "@/components/ChecklistClient";
import { CHECKLIST_GROUPS } from "@/lib/checklist-content";
import { BASE_URL, SITE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: `The CA Faculty Buying Checklist — ${CHECKLIST_GROUPS.reduce((s, g) => s + g.items.length, 0)} Checks Before You Pay | ${SITE_NAME}`,
  description:
    "The interactive checklist to run before buying any CA coaching course — goal, language, format, material, doubt support, validity and more. Your progress saves automatically. Free, by Careviews.",
  alternates: { canonical: `${BASE_URL}/checklist` },
  openGraph: {
    title: "The CA Faculty Buying Checklist",
    description:
      "Run these checks before you pay for CA coaching. If you can't clear a line, you're not ready to buy yet.",
    url: `${BASE_URL}/checklist`,
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Buying Guide", item: `${BASE_URL}/guide` },
    { "@type": "ListItem", position: 3, name: "Buying Checklist", item: `${BASE_URL}/checklist` },
  ],
};

export default function ChecklistPage() {
  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-navy text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <Link href="/guide" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-5 transition">
            ← The Buying Guide
          </Link>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold leading-tight">
            The Final Buying Checklist
          </h1>
          <p className="mt-4 text-white/65 text-base leading-relaxed">
            Run this before you pay. If you can't clear a line, you're not ready to buy yet —
            the gap is exactly what would have cost you. Your progress saves on this device.
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <ChecklistClient />

        <div className="bg-navy rounded-2xl px-7 py-7 mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h2 className="font-playfair text-lg font-bold text-white">Stuck on a line?</h2>
            <p className="text-white/55 text-sm mt-1">
              Every check has a full chapter in the Buying Guide explaining how to clear it.
            </p>
          </div>
          <Link href="/guide" className="shrink-0 bg-gold text-ink px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition">
            Open the Guide →
          </Link>
        </div>
      </section>
    </main>
  );
}
