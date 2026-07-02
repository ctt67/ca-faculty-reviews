import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { RATING_DIMENSIONS } from "@/lib/rating-dimensions";
import { BASE_URL, SITE_NAME } from "@/lib/config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `The 10 Careviews Rating Dimensions, Explained | ${SITE_NAME}`,
  description:
    "Every faculty on Careviews is rated across 10 dimensions — Concept Clarity, Exam Focus, Doubt Resolution, Value for Money and more. What each one measures and how to use it when choosing CA coaching.",
  alternates: { canonical: `${BASE_URL}/ratings` },
  openGraph: {
    title: "The 10 Careviews Rating Dimensions, Explained",
    description:
      "What Concept Clarity, Exam Focus, Expectation Match and the other Careviews ratings actually measure — and how to use them when buying CA coaching.",
    url: `${BASE_URL}/ratings`,
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
  },
};

export default async function RatingsIndexPage() {
  const { count } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("approved", true);
  const reviewCount = count ?? 0;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Ratings Explained", item: `${BASE_URL}/ratings` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Careviews Rating Dimensions",
      numberOfItems: RATING_DIMENSIONS.length,
      itemListElement: RATING_DIMENSIONS.map((d, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: d.label,
        url: `${BASE_URL}/ratings/${d.slug}`,
      })),
    },
  ];

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-4">Methodology</p>
          <h1 className="font-playfair text-3xl md:text-5xl font-bold leading-tight">
            The 10 Rating Dimensions
          </h1>
          <p className="mt-4 text-white/65 text-base md:text-lg max-w-2xl leading-relaxed">
            A single star rating hides more than it shows. Every faculty on Careviews is rated across
            ten specific dimensions by students who took the course
            {reviewCount > 0 && <> — {reviewCount} approved reviews and counting</>}.
            Here is what each one measures and how to use it.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="grid sm:grid-cols-2 gap-4">
          {RATING_DIMENSIONS.map((d) => (
            <Link
              key={d.slug}
              href={`/ratings/${d.slug}`}
              className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition p-6 group block"
            >
              <h2 className="font-playfair text-lg font-bold text-ink group-hover:text-navy">{d.label}</h2>
              <p className="text-ink/55 text-sm mt-2 leading-relaxed line-clamp-3">{d.definition}</p>
              <p className="text-gold text-sm font-semibold mt-4 group-hover:underline">What it measures →</p>
            </Link>
          ))}
        </div>

        <div className="bg-navy rounded-2xl px-8 py-9 mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-playfair text-xl font-bold text-white">New to buying CA coaching?</h2>
            <p className="text-white/55 text-sm mt-1.5 max-w-md">
              The Buying Guide walks through every decision these ratings help you make.
            </p>
          </div>
          <Link href="/guide" className="shrink-0 bg-gold text-ink px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition">
            Read the Buying Guide →
          </Link>
        </div>
      </section>
    </main>
  );
}
