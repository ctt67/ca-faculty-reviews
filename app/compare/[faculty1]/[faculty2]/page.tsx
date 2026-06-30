import { supabase } from "@/lib/supabase";
import { getAverageMetric, getOverallRating, getRatingFields } from "@/lib/ratings";
import {
  formatFieldName,
  formatValue,
  getRatingLabel,
  getRatingHint,
  PUBLIC_FACULTY_FIELDS,
  formatSubjectName,
} from "@/lib/format";
import CompareReviewCard from "@/components/compare/CompareReviewCard";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateCompareMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ faculty1: string; faculty2: string }>;
}): Promise<Metadata> {
  const { faculty1: faculty1Slug, faculty2: faculty2Slug } = await params;

  const [{ data: faculty1 }, { data: faculty2 }] = await Promise.all([
    supabase.from("faculties").select("faculty_name, subject, level").eq("slug", faculty1Slug).single(),
    supabase.from("faculties").select("faculty_name, subject, level").eq("slug", faculty2Slug).single(),
  ]);

  if (!faculty1 || !faculty2) {
    return {
      title: "Comparison Not Found | CareViews",
      robots: { index: false, follow: false },
    };
  }

  return generateCompareMetadata({
    faculty1: faculty1.faculty_name,
    faculty2: faculty2.faculty_name,
    faculty1Slug,
    faculty2Slug,
    subject: faculty1.subject,
    level: faculty1.level,
  });
}

export default async function CompareResultPage({
  params,
}: {
  params: Promise<{ faculty1: string; faculty2: string }>;
}) {
  const { faculty1: faculty1Slug, faculty2: faculty2Slug } = await params;

  const [{ data: faculty1 }, { data: faculty2 }] = await Promise.all([
    supabase.from("faculties").select("*").eq("slug", faculty1Slug).single(),
    supabase.from("faculties").select("*").eq("slug", faculty2Slug).single(),
  ]);

  if (!faculty1 || !faculty2) notFound();

  const [{ data: reviews1 }, { data: reviews2 }] = await Promise.all([
    supabase.from("reviews").select("*").eq("faculty_slug", faculty1Slug).eq("approved", true),
    supabase.from("reviews").select("*").eq("faculty_slug", faculty2Slug).eq("approved", true),
  ]);

  const faculty1Reviews = reviews1 ?? [];
  const faculty2Reviews = reviews2 ?? [];
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

  return (
    <main className="min-h-screen">

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
                  Higher Rated
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
                  Higher Rated
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
                        <p className="text-sm font-semibold text-ink">{getRatingLabel(field)}</p>
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
            Reviews represent individual student opinions. CareViews does not endorse any faculty.
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

      </section>
    </main>
  );
}
