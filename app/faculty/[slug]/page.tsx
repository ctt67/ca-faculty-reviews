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
import ReviewRatingDetails from "@/components/ReviewRatingDetails";
import PageViewTracker from "@/components/PageViewTracker";
import TrackedLink from "@/components/TrackedLink";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateFacultyMetadata } from "@/lib/seo";

export const revalidate = 300;

const REVIEWS_PER_PAGE = 10;

function RatingBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
        <div
          className="bg-navy h-1.5 rounded-full"
          style={{ width: `${Math.min((value / 5) * 100, 100)}%` }}
        />
      </div>
      <span className="text-ink font-semibold text-sm w-6 text-right">{value}</span>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data: faculty } = await supabase
    .from("faculties")
    .select("slug, faculty_name, subject, level")
    .eq("slug", slug)
    .single();

  if (!faculty) {
    return {
      title: "Faculty Not Found | CareViews",
      robots: { index: false, follow: false },
    };
  }
  return generateFacultyMetadata(faculty);
}

export default async function FacultyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  const page = Math.max(1, Number(pageParam ?? 1));
  const offset = (page - 1) * REVIEWS_PER_PAGE;

  const { data: faculty } = await supabase
    .from("faculties")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!faculty) notFound();

  const ratingColumns = [
    "understandability", "exam_focus", "study_material_quality", "mock_coverage",
    "coverage_of_questions", "doubt_resolution", "revision_support", "notes_quality",
    "pace_of_teaching", "time_efficiency", "value_for_money", "expectation_match",
  ].join(", ");

  const [{ data: allRatingData }, { data: pageReviews, count }] = await Promise.all([
    supabase
      .from("reviews")
      .select(ratingColumns)
      .eq("faculty_slug", slug)
      .eq("approved", true),
    supabase
      .from("reviews")
      .select(PUBLIC_REVIEW_COLUMNS, { count: "exact" })
      .eq("faculty_slug", slug)
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + REVIEWS_PER_PAGE - 1),
  ]);

  const reviews = (pageReviews ?? []) as unknown as Record<string, any>[];
  const allReviews = (allRatingData ?? []) as unknown as Record<string, unknown>[];
  const totalReviews = count ?? 0;
  const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);
  const overallRating = getOverallRating(allReviews);

  const facultyFields = Object.keys(faculty).filter((f) => PUBLIC_FACULTY_FIELDS.has(f));
  const ratingFields = getRatingFields(allReviews);

  const subjectLabel = formatSubjectName(faculty.subject ?? "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: faculty.faculty_name,
    jobTitle: `${faculty.subject} Educator`,
    knowsAbout: faculty.subject,
    ...(faculty.website ? { url: faculty.website } : {}),
    ...(totalReviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: overallRating.toFixed(1),
            reviewCount: totalReviews,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageViewTracker event="faculty_page_viewed" properties={{ faculty_slug: faculty.slug, subject: faculty.subject, level: faculty.level }} />
      <main className="min-h-screen">

        {/* Hero */}
        <section className="bg-navy text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
            <a
              href={`/${faculty.level?.toLowerCase()}/${faculty.subject?.toLowerCase()}`}
              className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition"
            >
              ← {subjectLabel}
            </a>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex gap-2 flex-wrap mb-3">
                  {faculty.level && (
                    <span className="bg-white/10 text-white/70 px-2.5 py-1 rounded-full text-xs font-medium">
                      {faculty.level}
                    </span>
                  )}
                  {faculty.subject && (
                    <span className="bg-white/10 text-white/70 px-2.5 py-1 rounded-full text-xs font-medium">
                      {subjectLabel}
                    </span>
                  )}
                </div>
                <h1 className="font-playfair text-3xl md:text-4xl font-bold text-white">
                  {faculty.faculty_name}
                </h1>
                <p className="text-white/50 text-sm mt-2">
                  {totalReviews} student {totalReviews === 1 ? "review" : "reviews"}
                </p>
              </div>

              {/* Rating */}
              <div className="md:text-right">
                {allReviews.length > 0 ? (
                  <>
                    <div className="flex items-baseline gap-2 md:justify-end">
                      <span className="text-gold text-xl leading-none">★</span>
                      <span className="font-playfair text-5xl font-bold text-white leading-none">
                        {overallRating}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs mt-2">Overall Rating</p>
                    <p className="text-white/30 text-[10px] mt-1 max-w-[240px] md:ml-auto leading-relaxed">
                      Calculated from approved student reviews.
                    </p>
                  </>
                ) : (
                  <span className="font-playfair text-4xl font-bold text-white/20">—</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Sidebar — below reviews on mobile, left col on desktop */}
            <div className="order-2 lg:order-1 lg:col-span-1 space-y-5">

              {/* Faculty Details */}
              {facultyFields.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="font-playfair text-base font-bold text-ink mb-4">Faculty Details</h2>
                  <div className="space-y-3">
                    {facultyFields.map((field) => (
                      <div key={field} className="flex justify-between items-start gap-4">
                        <span className="text-ink/50 text-sm shrink-0">{formatFieldName(field)}</span>
                        <span className="font-medium text-ink text-sm text-right">
                          {formatValue(faculty[field])}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA buttons */}
              <TrackedLink
                href={`/review/${faculty.slug}`}
                event="write_review_clicked"
                properties={{ faculty_slug: faculty.slug, source: "faculty_page" }}
                className="bg-gold text-ink w-full text-center py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition block"
              >
                Write a Review
              </TrackedLink>
              {faculty.website && (
                <a
                  href={faculty.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-slate-200 text-ink w-full text-center py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 transition block"
                >
                  Visit Website ↗
                </a>
              )}

              {/* Ratings Summary */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-playfair text-base font-bold text-ink mb-5">Ratings Breakdown</h2>
                {allReviews.length === 0 ? (
                  <p className="text-ink/40 text-sm">No ratings yet.</p>
                ) : (
                  <div className="space-y-4">
                    {ratingFields.map((field) => (
                      <div key={field}>
                        <div className="mb-1.5">
                          <p className="text-ink text-xs font-semibold">{getRatingLabel(field)}</p>
                          <p className="text-ink/45 text-[10px] leading-tight">{getRatingHint(field)}</p>
                        </div>
                        <RatingBar value={getAverageMetric(allReviews, field)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Compare CTA */}
              <div className="bg-navy rounded-xl p-5 text-white">
                <h3 className="font-playfair font-bold text-base">Compare this faculty</h3>
                <p className="text-white/55 text-xs mt-1 leading-relaxed">
                  See how {faculty.faculty_name} stacks up against others.
                </p>
                <a
                  href="/compare"
                  className="mt-4 block text-center bg-gold text-ink py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition"
                >
                  Go to Compare →
                </a>
              </div>

            </div>

            {/* Reviews — first on mobile */}
            <div className="order-1 lg:order-2 lg:col-span-2">

              <div className="flex items-baseline gap-2 mb-2">
                <h2 className="font-playfair text-2xl font-bold text-ink">Student Reviews</h2>
                <span className="text-ink/35 font-normal text-lg">({totalReviews})</span>
              </div>
              <p className="text-ink/45 text-xs mb-7">
                Reviews represent individual student opinions. CareViews does not endorse any faculty.
              </p>

              {totalReviews === 0 ? (
                <div className="bg-white rounded-xl border border-slate-100 p-12 text-center text-ink/40">
                  No reviews yet for this faculty.
                </div>
              ) : (
                <div className="space-y-5">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl shadow-sm p-6 sm:p-7">

                      {/* Metadata grid */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5">
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
                            {review.would_recommend ? "✓ Recommends this course" : "✗ Does not recommend"}
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
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
                        <div className="border-l-[3px] border-gold pl-4">
                          <p className="text-ink/65 text-sm leading-relaxed">{review.review_text}</p>
                        </div>
                      )}

                      <ReviewRatingDetails review={review} />

                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                  <a
                    href={page > 1 ? `/faculty/${slug}?page=${page - 1}` : undefined}
                    aria-disabled={page <= 1}
                    className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition ${
                      page <= 1
                        ? "border-slate-100 text-ink/25 pointer-events-none"
                        : "border-slate-200 text-ink hover:bg-slate-50"
                    }`}
                  >
                    ← Previous
                  </a>
                  <span className="text-sm text-ink/45">Page {page} of {totalPages}</span>
                  <a
                    href={page < totalPages ? `/faculty/${slug}?page=${page + 1}` : undefined}
                    aria-disabled={page >= totalPages}
                    className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition ${
                      page >= totalPages
                        ? "border-slate-100 text-ink/25 pointer-events-none"
                        : "border-slate-200 text-ink hover:bg-slate-50"
                    }`}
                  >
                    Next →
                  </a>
                </div>
              )}

            </div>
          </div>
        </section>

      </main>
    </>
  );
}
