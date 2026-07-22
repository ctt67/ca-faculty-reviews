import { supabase } from "@/lib/supabase";
import { getAverageMetric, getOverallRating, getRatingFields } from "@/lib/ratings";
import {
  formatFieldName,
  formatValue,
  getRatingLabel,
  getRatingHint,
  PUBLIC_FACULTY_FIELDS,
  PUBLIC_REVIEW_COLUMNS,
  formatSubjectName,
} from "@/lib/format";
import CompareReviewCard from "@/components/compare/CompareReviewCard";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { computeRatingStats, generateCompareMetadata, generateCompareFAQ, generateCompareJsonLd } from "@/lib/seo";
import { getDimensionByKey } from "@/lib/rating-dimensions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ faculty1: string; faculty2: string }>;
}): Promise<Metadata> {
  const { faculty1: faculty1Slug, faculty2: faculty2Slug } = await params;

  // Non-canonical order — page will redirect, so suppress indexing of this variant
  if (faculty1Slug > faculty2Slug) {
    return { robots: { index: false, follow: true } };
  }

  const [{ data: faculty1 }, { data: faculty2 }, { data: ratings1 }, { data: ratings2 }] = await Promise.all([
    supabase.from("faculties").select("faculty_name, subject, level").eq("slug", faculty1Slug).eq("active", true).single(),
    supabase.from("faculties").select("faculty_name, subject, level").eq("slug", faculty2Slug).eq("active", true).single(),
    supabase.from("reviews").select("overall_rating").eq("faculty_slug", faculty1Slug).eq("approved", true),
    supabase.from("reviews").select("overall_rating").eq("faculty_slug", faculty2Slug).eq("approved", true),
  ]);

  if (!faculty1 || !faculty2) {
    return {
      title: "Comparison Not Found | Careviews",
      robots: { index: false, follow: false },
    };
  }

  const stats1 = computeRatingStats(ratings1);
  const stats2 = computeRatingStats(ratings2);

  return generateCompareMetadata(
    {
      faculty1: faculty1.faculty_name,
      faculty2: faculty2.faculty_name,
      faculty1Slug,
      faculty2Slug,
      subject: faculty1.subject,
      level: faculty1.level,
    },
    stats1 && stats2 ? { faculty1: stats1, faculty2: stats2 } : undefined,
  );
}

export default async function CompareResultPage({
  params,
}: {
  params: Promise<{ faculty1: string; faculty2: string }>;
}) {
  const { faculty1: faculty1Slug, faculty2: faculty2Slug } = await params;

  // Canonical ordering — always redirect to alphabetically-sorted URL so
  // /compare/pavan/bhavik and /compare/bhavik/pavan resolve to one page.
  if (faculty1Slug > faculty2Slug) {
    permanentRedirect(`/compare/${faculty2Slug}/${faculty1Slug}`);
  }

  const [{ data: faculty1 }, { data: faculty2 }] = await Promise.all([
    supabase.from("faculties").select("*").eq("slug", faculty1Slug).eq("active", true).single(),
    supabase.from("faculties").select("*").eq("slug", faculty2Slug).eq("active", true).single(),
  ]);

  if (!faculty1 || !faculty2) notFound();

  const [{ data: reviews1 }, { data: reviews2 }] = await Promise.all([
    supabase.from("reviews").select(PUBLIC_REVIEW_COLUMNS).eq("faculty_slug", faculty1Slug).eq("approved", true),
    supabase.from("reviews").select(PUBLIC_REVIEW_COLUMNS).eq("faculty_slug", faculty2Slug).eq("approved", true),
  ]);

  const faculty1Reviews = (reviews1 ?? []) as unknown as Record<string, any>[];
  const faculty2Reviews = (reviews2 ?? []) as unknown as Record<string, any>[];
  const faculty1Rating = getOverallRating(faculty1Reviews);
  const faculty2Rating = getOverallRating(faculty2Reviews);

  const facultyFields = Object.keys(faculty1).filter((field) => PUBLIC_FACULTY_FIELDS.has(field));
  const ratingFields = getRatingFields(
    faculty1Reviews.length > 0 ? faculty1Reviews : faculty2Reviews
  );
  const hasAnyReviews = faculty1Reviews.length > 0 || faculty2Reviews.length > 0;

  const subjectLabel = formatSubjectName(faculty1.subject ?? "");

  const winner = (v1: number, v2: number) => {
    if (v1 > v2) return "left";
    if (v2 > v1) return "right";
    return "tie";
  };

  // Computed verdict — unique data sentence, only when both sides have reviews
  let verdict: string | null = null;
  if (faculty1Reviews.length > 0 && faculty2Reviews.length > 0 && ratingFields.length > 0) {
    let w1 = 0, w2 = 0, ties = 0;
    for (const f of ratingFields) {
      const v1 = getAverageMetric(faculty1Reviews, f);
      const v2 = getAverageMetric(faculty2Reviews, f);
      if (v1 > v2) w1++;
      else if (v2 > v1) w2++;
      else ties++;
    }
    const totalR = faculty1Reviews.length + faculty2Reviews.length;
    const lead = w1 > w2 ? faculty1.faculty_name : w2 > w1 ? faculty2.faculty_name : null;
    verdict = lead
      ? `Across ${totalR} approved student reviews on Careviews, students currently rate ${lead} higher on ${Math.max(w1, w2)} of ${ratingFields.length} rating dimensions${ties > 0 ? ` (${ties} tied)` : ""}.`
      : `Across ${totalR} approved student reviews on Careviews, students currently rate these two faculties evenly across the ${ratingFields.length} rating dimensions.`;
  }

  // AI/search structured data — every sentence restates a number already
  // shown in the hero above (rating, review count) or the verdict computed
  // just above. No new claim is introduced here.
  const compareJsonLdInput = {
    faculty1: { name: faculty1.faculty_name, slug: faculty1.slug },
    faculty2: { name: faculty2.faculty_name, slug: faculty2.slug },
    subject: faculty1.subject,
    level: faculty1.level,
    stats1: faculty1Reviews.length > 0 ? { avgRating: faculty1Rating, reviewCount: faculty1Reviews.length } : undefined,
    stats2: faculty2Reviews.length > 0 ? { avgRating: faculty2Rating, reviewCount: faculty2Reviews.length } : undefined,
    verdict,
  };
  const compareFaq = generateCompareFAQ(compareJsonLdInput);
  const compareJsonLd = generateCompareJsonLd(compareJsonLdInput);

  return (
    <main className="min-h-screen">

      {compareJsonLd.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(compareJsonLd) }}
        />
      )}

      {/* ── Hero ── */}
      <section className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-12">
          <a
            href="/compare"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-5 transition"
          >
            ← Compare
          </a>

          <p className="text-white/40 text-xs uppercase tracking-widest mb-4">
            {subjectLabel} · {faculty1.level}
          </p>

          {/* Compact side-by-side faculty cards — always horizontal */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">

            {/* Faculty 1 */}
            <div className="bg-white/8 border border-white/10 rounded-xl px-5 py-4">
              {faculty1Rating > faculty2Rating && faculty1Reviews.length > 0 && faculty2Reviews.length > 0 && (
                <span className="inline-block bg-green-400/15 text-green-300 border border-green-400/20 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide mb-2">
                  Rated Higher by Students
                </span>
              )}
              <h1 className="font-playfair text-lg sm:text-2xl font-bold text-white leading-tight">
                {faculty1.faculty_name}
              </h1>
              {faculty1Reviews.length > 0 ? (
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-gold text-sm leading-none">★</span>
                  <span className="font-playfair text-3xl font-bold text-white leading-none">{faculty1Rating}</span>
                  <span className="text-white/35 text-xs ml-1">
                    {faculty1Reviews.length} {faculty1Reviews.length === 1 ? "review" : "reviews"}
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-playfair text-2xl font-bold text-white/20">—</span>
                  <span className="text-white/25 text-xs">No reviews</span>
                </div>
              )}
              <a
                href={`/faculty/${faculty1.slug}`}
                className="mt-3 inline-block text-white/35 hover:text-white/65 text-xs transition"
              >
                View profile →
              </a>
            </div>

            {/* VS */}
            <div className="text-center">
              <span className="font-playfair text-gold text-xl font-bold">vs</span>
            </div>

            {/* Faculty 2 */}
            <div className="bg-white/8 border border-white/10 rounded-xl px-5 py-4">
              {faculty2Rating > faculty1Rating && faculty1Reviews.length > 0 && faculty2Reviews.length > 0 && (
                <span className="inline-block bg-green-400/15 text-green-300 border border-green-400/20 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide mb-2">
                  Rated Higher by Students
                </span>
              )}
              <h1 className="font-playfair text-lg sm:text-2xl font-bold text-white leading-tight">
                {faculty2.faculty_name}
              </h1>
              {faculty2Reviews.length > 0 ? (
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-gold text-sm leading-none">★</span>
                  <span className="font-playfair text-3xl font-bold text-white leading-none">{faculty2Rating}</span>
                  <span className="text-white/35 text-xs ml-1">
                    {faculty2Reviews.length} {faculty2Reviews.length === 1 ? "review" : "reviews"}
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-playfair text-2xl font-bold text-white/20">—</span>
                  <span className="text-white/25 text-xs">No reviews</span>
                </div>
              )}
              <a
                href={`/faculty/${faculty2.slug}`}
                className="mt-3 inline-block text-white/35 hover:text-white/65 text-xs transition"
              >
                View profile →
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-14">

        {/* Quick Answers — same sentences as the FAQPage schema above, kept
            visible so the markup never says anything the page doesn't. */}
        {compareFaq.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-playfair text-lg font-bold text-ink mb-1">Quick Answers</h2>
            <p className="text-ink/40 text-[10px] mb-4">
              Computed from approved student reviews on Careviews
            </p>
            <div className="space-y-4">
              {compareFaq.map(({ q, a }) => (
                <div key={q}>
                  <p className="text-sm font-semibold text-ink">{q}</p>
                  <p className="text-sm text-ink/70 mt-0.5 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Faculty Details */}
        {facultyFields.length > 0 && (
          <div>
            <h2 className="font-playfair text-2xl font-bold text-ink mb-5">Faculty Details</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
              {/* Header */}
              <div className="grid grid-cols-3 bg-slate-100 border-b border-slate-200 min-w-[480px]">
                <div className="px-5 py-3.5 text-[10px] font-semibold text-ink/50 uppercase tracking-wider">
                  Detail
                </div>
                <div className="px-5 py-3.5 font-semibold text-ink text-sm text-center border-l border-slate-100 truncate">
                  {faculty1.faculty_name}
                </div>
                <div className="px-5 py-3.5 font-semibold text-ink text-sm text-center border-l border-slate-100 truncate">
                  {faculty2.faculty_name}
                </div>
              </div>
              <div className="min-w-[480px]">
                {facultyFields.map((field) => (
                  <div key={field} className="grid grid-cols-3 border-b border-slate-100 last:border-b-0">
                    <div className="px-5 py-4 text-sm font-medium text-ink/70">
                      {formatFieldName(field)}
                    </div>
                    <div className="px-5 py-4 border-l border-slate-100 text-center text-sm font-medium text-ink">
                      {formatValue(faculty1[field])}
                    </div>
                    <div className="px-5 py-4 border-l border-slate-100 text-center text-sm font-medium text-ink">
                      {formatValue(faculty2[field])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ratings Comparison */}
        {hasAnyReviews && ratingFields.length > 0 && (
          <div>
            <h2 className="font-playfair text-2xl font-bold text-ink mb-1">Ratings Comparison</h2>
            {verdict && (
              <p className="text-ink/70 text-sm mb-1.5 max-w-2xl leading-relaxed">{verdict}</p>
            )}
            <p className="text-ink/45 text-xs mb-6">
              Calculated from approved reviews. Differences may reflect review volume, not just faculty quality.
            </p>

            <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
              {/* Header */}
              <div className="grid grid-cols-3 bg-slate-100 border-b border-slate-200 min-w-[480px]">
                <div className="px-5 py-3.5 text-[10px] font-semibold text-ink/50 uppercase tracking-wider">
                  Metric
                </div>
                <div className="px-5 py-3.5 font-semibold text-ink text-sm text-center border-l border-slate-100 truncate">
                  {faculty1.faculty_name}
                </div>
                <div className="px-5 py-3.5 font-semibold text-ink text-sm text-center border-l border-slate-100 truncate">
                  {faculty2.faculty_name}
                </div>
              </div>

              {/* Rows */}
              <div className="min-w-[480px]">
                {ratingFields.map((field) => {
                  const v1 = getAverageMetric(faculty1Reviews, field);
                  const v2 = getAverageMetric(faculty2Reviews, field);
                  const w = winner(v1, v2);
                  return (
                    <div key={field} className="grid grid-cols-3 border-b border-slate-100 last:border-b-0">
                      {/* Metric label + hint */}
                      <div className="px-5 py-4">
                        {getDimensionByKey(field) ? (
                          <a href={`/ratings/${getDimensionByKey(field)!.slug}`} className="text-sm font-semibold text-ink hover:text-navy hover:underline decoration-dotted underline-offset-2">
                            {getRatingLabel(field)}
                          </a>
                        ) : (
                          <p className="text-sm font-semibold text-ink">{getRatingLabel(field)}</p>
                        )}
                        <p className="text-[10px] text-ink/40 mt-0.5 leading-tight">{getRatingHint(field)}</p>
                      </div>

                      {/* Faculty 1 score */}
                      <div className={`px-5 py-4 border-l border-slate-100 flex items-center justify-center gap-1.5 ${
                        w === "left" ? "bg-gold/10" : ""
                      }`}>
                        <span className={`font-playfair text-2xl font-bold tabular-nums leading-none ${
                          w === "left" ? "text-ink" : "text-ink/35"
                        }`}>
                          {faculty1Reviews.length > 0 ? v1 : "—"}
                        </span>
                        {w === "left" && <span className="text-gold text-sm font-bold leading-none">↑</span>}
                      </div>

                      {/* Faculty 2 score */}
                      <div className={`px-5 py-4 border-l border-slate-100 flex items-center justify-center gap-1.5 ${
                        w === "right" ? "bg-gold/10" : ""
                      }`}>
                        <span className={`font-playfair text-2xl font-bold tabular-nums leading-none ${
                          w === "right" ? "text-ink" : "text-ink/35"
                        }`}>
                          {faculty2Reviews.length > 0 ? v2 : "—"}
                        </span>
                        {w === "right" && <span className="text-gold text-sm font-bold leading-none">↑</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Student Reviews */}
        <div>
          <h2 className="font-playfair text-2xl font-bold text-ink mb-2">What Students Are Saying</h2>
          <p className="text-ink/45 text-xs mb-7">
            Reviews represent individual student opinions. Careviews does not endorse any faculty.
          </p>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            {[
              { faculty: faculty1, reviews: faculty1Reviews },
              { faculty: faculty2, reviews: faculty2Reviews },
            ].map(({ faculty, reviews }) => (
              <div key={faculty.slug}>
                <div className="flex items-baseline gap-2 mb-4">
                  <h3 className="font-playfair text-lg font-bold text-ink">{faculty.faculty_name}</h3>
                  <span className="text-ink/35 text-sm">({reviews.length})</span>
                </div>

                {reviews.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-ink/40 text-sm">
                    No reviews yet.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {reviews.map((review) => (
                      <CompareReviewCard
                        key={review.id}
                        review={review}
                        ratingFields={ratingFields}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Guide CTA */}
        <div className="bg-navy rounded-2xl px-7 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h2 className="font-playfair text-lg font-bold text-white">Ratings are half the decision.</h2>
            <p className="text-white/55 text-sm mt-1">
              The Buying Guide covers the other half — format, validity, demo bias and every check before you pay.
            </p>
          </div>
          <a href="/guide" className="shrink-0 bg-gold text-ink px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition">
            Read the Buying Guide →
          </a>
        </div>

      </section>
    </main>
  );
}
