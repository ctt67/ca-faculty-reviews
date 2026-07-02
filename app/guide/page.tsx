import type { Metadata } from "next";
import Link from "next/link";
import { GUIDE_TOPICS, GUIDE_PARTS } from "@/lib/guide-content";
import { BASE_URL, SITE_NAME } from "@/lib/config";
import TrackedLink from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: `How to Choose a CA Faculty: The Complete Buying Guide (2026) | ${SITE_NAME}`,
  description:
    "The complete guide to choosing CA coaching — 20 chapters covering teaching style, live vs recorded, notes, validity, demo bias and every check that matters before you pay. Free, by Careviews.",
  alternates: { canonical: `${BASE_URL}/guide` },
  openGraph: {
    title: "The CA Faculty Buying Guide — every check before you pay",
    description:
      "20 chapters on choosing CA coaching: teaching style, live vs recorded, validity, demo bias and more. Free, independent, by Careviews.",
    url: `${BASE_URL}/guide`,
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Buying Guide", item: `${BASE_URL}/guide` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "The CA Faculty Buying Guide",
    numberOfItems: GUIDE_TOPICS.length,
    itemListElement: GUIDE_TOPICS.map((t) => ({
      "@type": "ListItem",
      position: t.num,
      name: t.seoTitle,
      url: `${BASE_URL}/guide/${t.slug}`,
    })),
  },
];

export default function GuideHubPage() {
  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-4">
            A Careviews Field Manual
          </p>
          <h1 className="font-playfair text-3xl md:text-5xl font-bold leading-tight">
            The CA Faculty Buying Guide
          </h1>
          <p className="mt-4 text-white/65 text-base md:text-lg max-w-2xl leading-relaxed">
            Everything you should check before spending tens of thousands of rupees on CA coaching.
            No faculty names, no rankings — just the questions that separate a good buy from a year of regret.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <a
              href="#contents"
              className="bg-gold text-ink font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition text-sm"
            >
              Start Reading
            </a>
            <Link
              href="/checklist"
              className="border border-white/25 text-white font-medium px-6 py-3 rounded-lg hover:bg-white/5 transition text-sm"
            >
              Open the Checklist
            </Link>
            <TrackedLink
              href="/ca-faculty-buying-guide.pdf"
              event="guide_pdf_downloaded"
              properties={{ source: "guide_hub" }}
              className="border border-white/25 text-white font-medium px-6 py-3 rounded-lg hover:bg-white/5 transition text-sm"
            >
              Download the PDF (free)
            </TrackedLink>
          </div>
          <p className="text-white/35 text-xs mt-5">
            20 chapters · Read once, then keep it open while you buy · Updated for 2026 attempts
          </p>
        </div>
      </section>

      {/* Contents */}
      <section id="contents" className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        {GUIDE_PARTS.map((part, pi) => (
          <div key={part} className="mb-10">
            <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-4">
              Part {pi + 1} · {part}
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {GUIDE_TOPICS.filter((t) => t.part === part).map((t) => (
                <Link
                  key={t.slug}
                  href={`/guide/${t.slug}`}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition p-5 group block"
                >
                  <p className="text-[10px] font-semibold text-ink/30 tabular-nums mb-1.5">
                    {String(t.num).padStart(2, "0")}
                  </p>
                  <h2 className="font-semibold text-ink text-sm leading-snug group-hover:text-navy">
                    {t.title}
                  </h2>
                  <p className="text-ink/50 text-xs mt-2 leading-relaxed line-clamp-2">{t.description}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Bottom CTA */}
        <div className="bg-navy rounded-2xl px-8 py-9 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-playfair text-xl font-bold text-white">
              Done reading? See what students actually say.
            </h2>
            <p className="text-white/55 text-sm mt-1.5 max-w-md">
              Every chapter points at checks — the ratings and reviews on Careviews are where you run them.
            </p>
          </div>
          <Link
            href="/final"
            className="shrink-0 bg-gold text-ink px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition"
          >
            Browse Faculty Reviews →
          </Link>
        </div>
      </section>
    </main>
  );
}
