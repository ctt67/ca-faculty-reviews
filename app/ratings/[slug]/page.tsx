import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { RATING_DIMENSIONS, getDimension } from "@/lib/rating-dimensions";
import { GUIDE_TOPICS } from "@/lib/guide-content";
import { BASE_URL, SITE_NAME } from "@/lib/config";
import { formatSubjectName } from "@/lib/format";

export const revalidate = 3600;

const MIN_REVIEWS = 3;

export function generateStaticParams() {
  return RATING_DIMENSIONS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dim = getDimension(slug);
  if (!dim) return { title: "Not Found", robots: { index: false, follow: false } };
  const url = `${BASE_URL}/ratings/${dim.slug}`;
  return {
    title: `${dim.seoTitle} | ${SITE_NAME}`,
    description: dim.description,
    alternates: { canonical: url },
    openGraph: {
      title: dim.seoTitle,
      description: dim.description,
      url,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "article",
    },
    twitter: { card: "summary_large_image", title: dim.seoTitle, description: dim.description },
  };
}

export default async function RatingDimensionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dim = getDimension(slug);
  if (!dim) notFound();

  // Live stats for this dimension across all approved reviews
  const { data: rows } = await supabase
    .from("reviews")
    .select(`faculty_slug, ${dim.key}`)
    .eq("approved", true)
    .limit(10000);

  const reviews = (rows ?? []) as unknown as Array<Record<string, unknown>>;
  const scored = reviews.filter((r) => Number(r[dim.key]) > 0);
  const totalReviews = scored.length;
  const siteAvg = totalReviews
    ? (scored.reduce((s, r) => s + Number(r[dim.key]), 0) / totalReviews).toFixed(1)
    : null;

  // Per-faculty averages (min review threshold)
  const byFaculty = new Map<string, number[]>();
  for (const r of scored) {
    const fs = String(r.faculty_slug);
    if (!byFaculty.has(fs)) byFaculty.set(fs, []);
    byFaculty.get(fs)!.push(Number(r[dim.key]));
  }
  const facultyAverages = [...byFaculty.entries()]
    .filter(([, scores]) => scores.length >= MIN_REVIEWS)
    .map(([fs, scores]) => ({
      slug: fs,
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      n: scores.length,
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  let topFaculties: Array<{ slug: string; name: string; subject: string; level: string; avg: number; n: number }> = [];
  if (facultyAverages.length > 0) {
    const { data: faculties } = await supabase
      .from("faculties")
      .select("slug, faculty_name, subject, level")
      .in("slug", facultyAverages.map((f) => f.slug))
      .eq("active", true);
    topFaculties = facultyAverages.flatMap((fa) => {
      const f = faculties?.find((x) => x.slug === fa.slug);
      return f
        ? [{ slug: f.slug, name: f.faculty_name, subject: f.subject, level: f.level, avg: fa.avg, n: fa.n }]
        : [];
    });
  }

  const relatedTopics = GUIDE_TOPICS.filter((t) => dim.relatedGuideSlugs.includes(t.slug));
  const otherDims = RATING_DIMENSIONS.filter((d) => d.slug !== dim.slug);

  const jsonLd: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: dim.seoTitle,
      description: dim.description,
      author: { "@type": "Organization", name: SITE_NAME, url: BASE_URL },
      publisher: { "@type": "Organization", name: SITE_NAME, url: BASE_URL },
      mainEntityOfPage: `${BASE_URL}/ratings/${dim.slug}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Ratings Explained", item: `${BASE_URL}/ratings` },
        { "@type": "ListItem", position: 3, name: dim.label, item: `${BASE_URL}/ratings/${dim.slug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: dim.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-9 md:py-12">
          <Link href="/ratings" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-5 transition">
            ← Ratings Explained
          </Link>
          <p className="text-[11px] font-semibold tracking-widest text-gold uppercase mb-3">
            Careviews Rating Dimension
          </p>
          <h1 className="font-playfair text-2xl md:text-4xl font-bold leading-tight">{dim.label}</h1>
          <p className="mt-4 text-white/65 text-base leading-relaxed">{dim.definition}</p>
          {siteAvg && (
            <p className="mt-5 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm">
              <span className="text-gold">★</span>
              <span className="text-white/85">
                Site-wide average: <b>{siteAvg}/5</b> from {totalReviews} student {totalReviews === 1 ? "rating" : "ratings"} on Careviews
              </span>
            </p>
          )}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-9 md:py-12">

        {/* Why it matters */}
        <h2 className="font-playfair text-xl font-bold text-ink mb-4">Why it matters</h2>
        <ul className="space-y-3 mb-8">
          {dim.whyItMatters.map((w, i) => (
            <li key={i} className="flex items-start gap-2.5 text-ink/75 text-[15px] leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-navy shrink-0" />
              {w}
            </li>
          ))}
        </ul>

        {/* Score meaning */}
        <h2 className="font-playfair text-xl font-bold text-ink mb-4">How to read the score</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          <div className="bg-white rounded-xl border border-slate-100 border-l-[3px] border-l-green-400 p-5">
            <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider mb-1.5">High score means</p>
            <p className="text-ink/70 text-sm leading-relaxed">{dim.highScoreMeans}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 border-l-[3px] border-l-red-400 p-5">
            <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider mb-1.5">Low score means</p>
            <p className="text-ink/70 text-sm leading-relaxed">{dim.lowScoreMeans}</p>
          </div>
        </div>

        {/* How to check */}
        <h2 className="font-playfair text-xl font-bold text-ink mb-4">How to check it before you buy</h2>
        <ul className="space-y-3 mb-8">
          {dim.howToCheck.map((h, i) => (
            <li key={i} className="flex items-start gap-2.5 text-ink/75 text-[15px] leading-relaxed">
              <span className="text-gold font-bold shrink-0">{i + 1}.</span>
              {h}
            </li>
          ))}
        </ul>

        {/* Top faculties — computed, threshold-gated */}
        {topFaculties.length > 0 && (
          <>
            <h2 className="font-playfair text-xl font-bold text-ink mb-1">
              Highest-rated for {dim.label}
            </h2>
            <p className="text-ink/45 text-xs mb-4">
              Computed from approved student reviews · minimum {MIN_REVIEWS} ratings · updates as reviews come in
            </p>
            <div className="space-y-2.5 mb-8">
              {topFaculties.map((f, i) => (
                <Link
                  key={f.slug}
                  href={`/faculty/${f.slug}`}
                  className="flex items-center justify-between gap-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition p-4 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="font-playfair text-lg font-bold text-gold/60 shrink-0">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-ink text-sm truncate group-hover:text-navy">{f.name}</p>
                      <p className="text-ink/45 text-xs">{formatSubjectName(f.subject)} · {f.level}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-playfair font-bold text-ink"><span className="text-gold text-sm">★</span> {f.avg.toFixed(1)}</p>
                    <p className="text-ink/35 text-[10px]">{f.n} ratings</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* FAQ */}
        <h2 className="font-playfair text-xl font-bold text-ink mb-4">Common questions</h2>
        <div className="space-y-3 mb-8">
          {dim.faq.map((f) => (
            <div key={f.q} className="bg-white rounded-xl border border-slate-100 p-5">
              <p className="font-semibold text-ink text-sm mb-1.5">{f.q}</p>
              <p className="text-ink/65 text-sm leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>

        {/* Related guide chapters */}
        {relatedTopics.length > 0 && (
          <>
            <h2 className="font-playfair text-xl font-bold text-ink mb-4">From the Buying Guide</h2>
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {relatedTopics.map((t) => (
                <Link key={t.slug} href={`/guide/${t.slug}`} className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition block">
                  <p className="text-[10px] text-gold uppercase tracking-wider font-semibold mb-1">Chapter {String(t.num).padStart(2, "0")}</p>
                  <p className="text-sm font-semibold text-ink">{t.title}</p>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Other dimensions */}
        <h2 className="font-playfair text-xl font-bold text-ink mb-4">Other rating dimensions</h2>
        <div className="flex flex-wrap gap-2 mb-8">
          {otherDims.map((d) => (
            <Link
              key={d.slug}
              href={`/ratings/${d.slug}`}
              className="bg-white border border-slate-200 rounded-full px-3.5 py-1.5 text-xs font-medium text-ink hover:bg-slate-50 transition"
            >
              {d.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-navy rounded-2xl px-7 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h2 className="font-playfair text-lg font-bold text-white">See {dim.label} scores on real faculties.</h2>
            <p className="text-white/55 text-sm mt-1">Every faculty page shows this rating with the reviews behind it.</p>
          </div>
          <Link href="/final" className="shrink-0 bg-gold text-ink px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition">
            Browse Faculties →
          </Link>
        </div>
      </section>
    </main>
  );
}
