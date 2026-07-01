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
import ReviewSortControls from "@/components/ReviewSortControls";
import ReviewFilters from "@/components/ReviewFilters";
import PageViewTracker from "@/components/PageViewTracker";
import TrackedLink from "@/components/TrackedLink";
import ShareButtons from "@/components/ShareButtons";
import ReviewsLoadMore from "@/components/ReviewsLoadMore";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateFacultyMetadata } from "@/lib/seo";
import { BASE_URL, LEVEL_LABELS } from "@/lib/config";

export const revalidate = 300;

const REVIEWS_PER_PAGE = 5;

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
      title: "Faculty Not Found | Careviews",
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
  searchParams: Promise<{ sort?: string; attempt?: string; course_type?: string }>;
}) {
  const { slug } = await params;
  const { sort: sortParam, attempt: attemptParam, course_type: courseTypeParam } = await searchParams;

  const filterAttempt    = (attemptParam    ?? "").trim();
  const filterCourseType = (courseTypeParam ?? "").trim();

  const VALID_SORTS = ["newest", "oldest", "highest", "lowest", "helpful"] as const;
  type Sort = (typeof VALID_SORTS)[number];
  const sort: Sort = VALID_SORTS.includes(sortParam as Sort) ? (sortParam as Sort) : "newest";

  const isHelpful = sort === "helpful";
  const HELPFUL_LIMIT = 50;

  const { data: faculty } = await supabase
    .from("faculties")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!faculty) notFound();

  const ratingColumns = [
    "attempt", "course_type",
    "understandability", "exam_focus", "study_material_quality", "mock_coverage",
    "coverage_of_questions", "doubt_resolution", "revision_support", "notes_quality",
    "pace_of_teaching", "time_efficiency", "value_for_money", "expectation_match",
  ].join(", ");

  const sortConfig: Record<Sort, { column: string; ascending: boolean }> = {
    newest:  { column: "created_at",     ascending: false },
    oldest:  { column: "created_at",     ascending: true  },
    highest: { column: "overall_rating", ascending: false },
    lowest:  { column: "overall_rating", ascending: true  },
    helpful: { column: "created_at",     ascending: false },
  };
  const { column: orderCol, ascending: orderAsc } = sortConfig[sort];

  let baseQuery = supabase
    .from("reviews")
    .select(PUBLIC_REVIEW_COLUMNS, { count: "exact" })
    .eq("faculty_slug", slug)
    .eq("approved", true)
    .order(orderCol, { ascending: orderAsc });

  if (filterAttempt)    baseQuery = baseQuery.eq("attempt",     filterAttempt)    as typeof baseQuery;
  if (filterCourseType) baseQuery = baseQuery.eq("course_type", filterCourseType) as typeof baseQuery;

  const [{ data: allRatingData }, { data: pageReviews, count }] = await Promise.all([
    supabase
      .from("reviews")
      .select(ratingColumns)
      .eq("faculty_slug", slug)
      .eq("approved", true),
    isHelpful
      ? baseQuery.limit(HELPFUL_LIMIT)
      : baseQuery.range(0, REVIEWS_PER_PAGE - 1),
  ]);

  // Fetch vote counts for current page reviews
  const reviewIds = ((pageReviews ?? []) as unknown as Array<{ id: number }>).map((r) => r.id).filter(Boolean);
  const { data: voteData } = reviewIds.length
    ? await supabase.from("review_votes").select("review_id, vote_type").in("review_id", reviewIds)
    : { data: [] };
  const voteCounts = new Map<number, { up: number; down: number }>();
  for (const v of voteData ?? []) {
    const entry = voteCounts.get(v.review_id) ?? { up: 0, down: 0 };
    if (v.vote_type === "up") entry.up++;
    else entry.down++;
    voteCounts.set(v.review_id, entry);
  }

  let reviews = (pageReviews ?? []) as unknown as Record<string, any>[];
  if (isHelpful) {
    reviews = [...reviews].sort((a, b) => {
      const aNet = (voteCounts.get(a.id as number)?.up ?? 0) - (voteCounts.get(a.id as number)?.down ?? 0);
      const bNet = (voteCounts.get(b.id as number)?.up ?? 0) - (voteCounts.get(b.id as number)?.down ?? 0);
      return bNet - aNet;
    });
  }
  const allReviews = (allRatingData ?? []) as unknown as Record<string, any>[];
  const totalUnfiltered = allReviews.length;
  const totalReviews = count ?? 0;

  const attempts = [...new Set(allReviews.map((r) => r.attempt).filter(Boolean))].sort() as string[];
  const courseTypes = [...new Set(allReviews.map((r) => r.course_type).filter(Boolean))].sort() as string[];
  const hasFilters = filterAttempt || filterCourseType;
  const overallRating = getOverallRating(allReviews);

  const facultyFields = Object.keys(faculty).filter((f) => PUBLIC_FACULTY_FIELDS.has(f));
  const ratingFields = getRatingFields(allReviews);

  const votesObj: Record<string, { up: number; down: number }> = {};
  voteCounts.forEach((val, key) => { votesObj[String(key)] = val; });

  const subjectLabel = formatSubjectName(faculty.subject ?? "");

  const levelLabel = LEVEL_LABELS[faculty.level?.toLowerCase() ?? ""] ?? faculty.level ?? "";

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: faculty.faculty_name,
      jobTitle: `${subjectLabel} Educator`,
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
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home",          item: BASE_URL },
        { "@type": "ListItem", position: 2, name: levelLabel,      item: `${BASE_URL}/${faculty.level?.toLowerCase()}` },
        { "@type": "ListItem", position: 3, name: subjectLabel,    item: `${BASE_URL}/${faculty.level?.toLowerCase()}/${faculty.subject?.toLowerCase()}` },
        { "@type": "ListItem", position: 4, name: faculty.faculty_name, item: `${BASE_URL}/faculty/${faculty.slug}` },
      ],
    },
  ];

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
                  {totalUnfiltered} student {totalUnfiltered === 1 ? "review" : "reviews"}
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

            {/* Share row */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <ShareButtons facultySlug={faculty.slug} facultyName={faculty.faculty_name} />
            </div>

          </div>
        </section>

        {/* Body */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Sidebar — ratings on top on mobile, left col on desktop */}
            <div className="lg:col-span-1 space-y-5">

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

            {/* Reviews — below ratings on mobile, right col on desktop */}
            <div className="lg:col-span-2">

              <div className="flex items-baseline gap-2 mb-2">
                <h2 className="font-playfair text-2xl font-bold text-ink">Student Reviews</h2>
                <span className="text-ink/35 font-normal text-lg">
                  ({hasFilters ? `${totalReviews} of ${totalUnfiltered}` : totalReviews})
                </span>
              </div>
              {totalUnfiltered > 1 && (
                <div className="mb-3">
                  <ReviewSortControls slug={slug} current={sort} />
                </div>
              )}
              <ReviewFilters
                slug={slug}
                sort={sort}
                currentAttempt={filterAttempt}
                currentCourseType={filterCourseType}
                attempts={attempts}
                courseTypes={courseTypes}
              />
              <p className="text-ink/45 text-xs mb-7">
                Reviews represent individual student opinions. Careviews does not endorse any faculty.
              </p>

              {totalReviews === 0 ? (
                <div className="bg-white rounded-xl border border-slate-100 p-10 sm:p-12 text-center">
                  <Image src="/oreo.jpg" alt="Oreo" width={72} height={72} className="rounded-full object-cover mx-auto mb-5 border border-gold/20" />
                  <p className="font-playfair text-xl font-bold text-ink mb-2">Be the first to help future CA students</p>
                  <p className="text-ink/55 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
                    Your honest review of {faculty.faculty_name} could help hundreds of students make a better decision about their CA preparation.
                  </p>
                  <TrackedLink
                    href={`/review/${faculty.slug}`}
                    event="write_review_clicked"
                    properties={{ faculty_slug: faculty.slug, source: "empty_state" }}
                    className="inline-block bg-gold text-ink px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition"
                  >
                    Write the First Review →
                  </TrackedLink>
                  <p className="text-ink/30 text-xs mt-5">Takes about 5 minutes. Reviewed within 24 hours.</p>
                </div>
              ) : (
                <ReviewsLoadMore
                  initialReviews={reviews}
                  initialVotes={votesObj}
                  total={totalReviews}
                  slug={slug}
                  sort={sort}
                  filterAttempt={filterAttempt}
                  filterCourseType={filterCourseType}
                  isHelpful={isHelpful}
                />
              )}

            </div>
          </div>
        </section>

      </main>
    </>
  );
}
