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
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateCompareMetadata } from "@/lib/seo";

function getScoreWord(score: number): string {
  if (score >= 4.5) return "Excellent";
  if (score >= 3.5) return "Good";
  if (score >= 2.5) return "Average";
  if (score >= 1.5) return "Poor";
  return "Very Poor";
}

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

  const winner = (v1: number, v2: number) => {
    if (v1 > v2) return "left";
    if (v2 > v1) return "right";
    return "tie";
  };

  const subjectLabel = formatSubjectName(faculty1.subject ?? "");

  return (
    <main className="min-h-screen">

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <a
            href="/compare"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition"
          >
            ← Compare
          </a>

          <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-5 mb-3">
            <h1 className="font-playfair text-2xl md:text-4xl font-bold text-white leading-tight">
              {faculty1.faculty_name}
            </h1>
            <span className="font-playfair text-gold text-xl font-bold sm:pb-0.5">vs</span>
            <h1 className="font-playfair text-2xl md:text-4xl font-bold text-white leading-tight">
              {faculty2.faculty_name}
            </h1>
          </div>

          <p className="text-white/45 text-sm">{subjectLabel} · {faculty1.level}</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-10">

        {/* Overall Rating Cards */}
        <div className="grid sm:grid-cols-2 gap-5">
          {[
            { faculty: faculty1, reviews: faculty1Reviews, rating: faculty1Rating, otherRating: faculty2Rating },
            { faculty: faculty2, reviews: faculty2Reviews, rating: faculty2Rating, otherRating: faculty1Rating },
          ].map(({ faculty, reviews, rating, otherRating }) => (
            <div key={faculty.slug} className="bg-white rounded-xl shadow-sm p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-playfair text-xl font-bold text-ink leading-tight">
                    {faculty.faculty_name}
                  </h2>
                  <p className="text-ink/45 text-xs mt-1">{faculty.subject}</p>
                </div>
                {rating > otherRating && (
                  <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0">
                    Best Rated
                  </span>
                )}
              </div>

              {reviews.length > 0 ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-gold text-xl leading-none">★</span>
                    <span className="font-playfair text-5xl font-bold text-ink leading-none">{rating}</span>
                  </div>
                  <p className="text-ink/40 text-xs mt-2">Overall Rating</p>
                  <p className="text-ink/35 text-[10px] mt-1">
                    {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                  </p>
                </>
              ) : (
                <>
                  <span className="font-playfair text-5xl font-bold text-ink/20">—</span>
                  <p className="text-ink/35 text-xs mt-2">No reviews yet</p>
                </>
              )}

              <a
                href={`/faculty/${faculty.slug}`}
                className="mt-5 block text-center border border-slate-200 text-ink text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50 transition"
              >
                View Full Profile →
              </a>
            </div>
          ))}
        </div>

        {/* Faculty Details */}
        {facultyFields.length > 0 && (
          <div>
            <h2 className="font-playfair text-2xl font-bold text-ink mb-4">Faculty Details</h2>
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

                {facultyFields.map((field) => (
                  <div key={field} className="contents">
                    <div className="p-4 border-b text-ink/60 text-sm">{formatFieldName(field)}</div>
                    <div className="p-4 border-b border-l text-center text-ink font-medium text-sm">
                      {formatValue(faculty1[field])}
                    </div>
                    <div className="p-4 border-b border-l text-center text-ink font-medium text-sm">
                      {formatValue(faculty2[field])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ratings Comparison */}
        <div>
          <h2 className="font-playfair text-2xl font-bold text-ink mb-1">Ratings Comparison</h2>
          <p className="text-ink/45 text-xs mb-5">
            Calculated from approved reviews. Differences may reflect review volume, not just faculty quality.
          </p>

          {!hasAnyReviews || ratingFields.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 p-10 text-center text-ink/40 text-sm">
              No ratings available yet for these faculties.
            </div>
          ) : (
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
          )}
        </div>

        {/* What Students Are Saying */}
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
                      <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-x-5 gap-y-3 mb-5">
                          {review.course_type && (
                            <div>
                              <p className="text-[10px] text-ink/40 uppercase tracking-wider font-medium">Course</p>
                              <p className="text-sm font-medium text-ink mt-0.5">{review.course_type}</p>
                            </div>
                          )}
                          {review.student_type && (
                            <div>
                              <p className="text-[10px] text-ink/40 uppercase tracking-wider font-medium">Reviewer</p>
                              <p className="text-sm font-medium text-ink mt-0.5">{review.student_type}</p>
                            </div>
                          )}
                          {review.attempt && (
                            <div>
                              <p className="text-[10px] text-ink/40 uppercase tracking-wider font-medium">Attempt</p>
                              <p className="text-sm font-medium text-ink mt-0.5">{review.attempt}</p>
                            </div>
                          )}
                          {review.teacher_style && (
                            <div>
                              <p className="text-[10px] text-ink/40 uppercase tracking-wider font-medium">Teaching Style</p>
                              <p className="text-sm font-medium text-ink mt-0.5">{review.teacher_style}</p>
                            </div>
                          )}
                        </div>

                        {/* Recommend badge */}
                        {review.would_recommend !== null && review.would_recommend !== undefined && (
                          <div className="mb-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${
                              review.would_recommend
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-600 border-red-200"
                            }`}>
                              {review.would_recommend ? "✓ Recommends" : "✗ Does not recommend"}
                            </span>
                          </div>
                        )}

                        {/* Best for */}
                        {review.best_for?.length > 0 && (
                          <p className="text-sm text-ink/60 mb-4">
                            <span className="font-semibold text-ink">Best for:</span>{" "}
                            {review.best_for.join(", ")}
                          </p>
                        )}

                        {/* Pros / Cons */}
                        {(review.pros || review.cons) && (
                          <div className="space-y-2 mb-4">
                            {review.pros && (
                              <div className="border-l-[3px] border-green-400 pl-3 py-0.5">
                                <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider mb-1">Pros</p>
                                <p className="text-ink/70 text-sm leading-relaxed">{review.pros}</p>
                              </div>
                            )}
                            {review.cons && (
                              <div className="border-l-[3px] border-red-400 pl-3 py-0.5">
                                <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider mb-1">Cons</p>
                                <p className="text-ink/70 text-sm leading-relaxed">{review.cons}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Review text */}
                        {review.review_text && (
                          <div className="border-l-[3px] border-gold pl-4 mb-4">
                            <p className="text-ink/65 text-sm leading-relaxed">{review.review_text}</p>
                          </div>
                        )}

                        {/* Per-rating breakdown with reasons */}
                        {ratingFields.some((f) => review[f] != null) && (
                          <div className="border-t border-slate-100 pt-4 mt-2">
                            <p className="text-[10px] font-semibold text-ink/40 uppercase tracking-wider mb-3">
                              Ratings
                            </p>
                            <div className="space-y-2">
                              {ratingFields.map((field) => {
                                const score = review[field];
                                if (score == null) return null;
                                const reason = review.rating_reasons?.[field];
                                return (
                                  <div key={field} className="flex items-start gap-2">
                                    <span className="shrink-0 bg-gold/10 text-ink font-bold rounded-lg px-2 py-0.5 text-xs min-w-[36px] text-center">
                                      {score}/5
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <span className="text-ink text-xs font-medium">{getRatingLabel(field)}</span>
                                      <span className="text-ink/40 text-xs ml-1.5">— {getScoreWord(score)}</span>
                                      {reason && (
                                        <p className="text-ink/50 text-xs mt-0.5 italic">"{reason}"</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </div>
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
