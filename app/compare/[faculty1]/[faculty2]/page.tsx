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
import MetricCard from "@/components/compare/MetricCard";
import DetailedComparisonAccordion from "@/components/compare/DetailedComparisonAccordion";
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <a
            href="/compare"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition"
          >
            ← Compare
          </a>

          <p className="text-white/40 text-xs uppercase tracking-widest mb-5">
            {subjectLabel} · {faculty1.level}
          </p>

          {/* Side-by-side faculty cards */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] items-center gap-4 sm:gap-6">

            {/* Faculty 1 */}
            <div className="bg-white/8 border border-white/10 rounded-2xl p-6 sm:p-7">
              {faculty1Rating > faculty2Rating && faculty1Reviews.length > 0 && faculty2Reviews.length > 0 && (
                <span className="inline-block bg-green-400/15 text-green-300 border border-green-400/20 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide mb-3">
                  Higher Rated
                </span>
              )}
              <h1 className="font-playfair text-2xl md:text-3xl font-bold text-white leading-tight">
                {faculty1.faculty_name}
              </h1>
              {faculty1Reviews.length > 0 ? (
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-gold text-lg leading-none">★</span>
                    <span className="font-playfair text-5xl font-bold text-white leading-none">{faculty1Rating}</span>
                  </div>
                  <p className="text-white/40 text-xs mt-2">
                    {faculty1Reviews.length} {faculty1Reviews.length === 1 ? "review" : "reviews"}
                  </p>
                </div>
              ) : (
                <div className="mt-4">
                  <span className="font-playfair text-4xl font-bold text-white/20">—</span>
                  <p className="text-white/30 text-xs mt-2">No reviews yet</p>
                </div>
              )}
              <a
                href={`/faculty/${faculty1.slug}`}
                className="mt-5 inline-block text-white/40 hover:text-white/70 text-xs transition"
              >
                View full profile →
              </a>
            </div>

            {/* VS divider */}
            <div className="text-center py-2 sm:py-0">
              <span className="font-playfair text-gold text-2xl font-bold">vs</span>
            </div>

            {/* Faculty 2 */}
            <div className="bg-white/8 border border-white/10 rounded-2xl p-6 sm:p-7">
              {faculty2Rating > faculty1Rating && faculty1Reviews.length > 0 && faculty2Reviews.length > 0 && (
                <span className="inline-block bg-green-400/15 text-green-300 border border-green-400/20 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide mb-3">
                  Higher Rated
                </span>
              )}
              <h1 className="font-playfair text-2xl md:text-3xl font-bold text-white leading-tight">
                {faculty2.faculty_name}
              </h1>
              {faculty2Reviews.length > 0 ? (
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-gold text-lg leading-none">★</span>
                    <span className="font-playfair text-5xl font-bold text-white leading-none">{faculty2Rating}</span>
                  </div>
                  <p className="text-white/40 text-xs mt-2">
                    {faculty2Reviews.length} {faculty2Reviews.length === 1 ? "review" : "reviews"}
                  </p>
                </div>
              ) : (
                <div className="mt-4">
                  <span className="font-playfair text-4xl font-bold text-white/20">—</span>
                  <p className="text-white/30 text-xs mt-2">No reviews yet</p>
                </div>
              )}
              <a
                href={`/faculty/${faculty2.slug}`}
                className="mt-5 inline-block text-white/40 hover:text-white/70 text-xs transition"
              >
                View full profile →
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
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { faculty: faculty1 },
                { faculty: faculty2 },
              ].map(({ faculty }) => (
                <div key={faculty.slug} className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-playfair text-lg font-bold text-ink pb-3 mb-4 border-b border-slate-100">
                    {faculty.faculty_name}
                  </h3>
                  <div className="space-y-4">
                    {facultyFields.map((field) => (
                      <div key={field}>
                        <p className="text-[10px] text-ink/40 uppercase tracking-wider font-medium mb-1">
                          {formatFieldName(field)}
                        </p>
                        <p className="text-ink font-medium text-sm">{formatValue(faculty[field])}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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

            <div className="space-y-3 mb-6">
              {ratingFields.map((field) => (
                <MetricCard
                  key={field}
                  label={getRatingLabel(field)}
                  hint={getRatingHint(field)}
                  v1={getAverageMetric(faculty1Reviews, field)}
                  v2={getAverageMetric(faculty2Reviews, field)}
                  name1={faculty1.faculty_name}
                  name2={faculty2.faculty_name}
                  hasReviews1={faculty1Reviews.length > 0}
                  hasReviews2={faculty2Reviews.length > 0}
                />
              ))}
            </div>

            {/* Detailed Comparison accordion */}
            <DetailedComparisonAccordion>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-3">
                  <div className="p-4 bg-parchment text-[10px] font-semibold text-ink/50 uppercase tracking-wider border-b">
                    Metric
                  </div>
                  <div className="p-4 bg-parchment font-semibold text-ink text-sm text-center border-b border-l truncate">
                    {faculty1.faculty_name}
                  </div>
                  <div className="p-4 bg-parchment font-semibold text-ink text-sm text-center border-b border-l truncate">
                    {faculty2.faculty_name}
                  </div>

                  {ratingFields.map((field) => {
                    const v1 = getAverageMetric(faculty1Reviews, field);
                    const v2 = getAverageMetric(faculty2Reviews, field);
                    const w = winner(v1, v2);
                    return (
                      <div key={field} className="contents">
                        <div className="p-4 border-b">
                          <p className="text-xs font-semibold text-ink">{getRatingLabel(field)}</p>
                          <p className="text-[10px] text-ink/40 mt-0.5 leading-tight">{getRatingHint(field)}</p>
                        </div>
                        <div className={`p-4 border-b border-l text-center text-sm font-bold ${
                          w === "left" ? "bg-gold/10 text-ink" : "text-ink/55"
                        }`}>
                          {faculty1Reviews.length > 0 ? v1 : "—"}
                          {w === "left" && <span className="ml-1 text-gold text-xs">↑</span>}
                        </div>
                        <div className={`p-4 border-b border-l text-center text-sm font-bold ${
                          w === "right" ? "bg-gold/10 text-ink" : "text-ink/55"
                        }`}>
                          {faculty2Reviews.length > 0 ? v2 : "—"}
                          {w === "right" && <span className="ml-1 text-gold text-xs">↑</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </DetailedComparisonAccordion>
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
