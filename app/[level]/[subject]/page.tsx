import { supabase } from "@/lib/supabase";
import { getOverallRating } from "@/lib/ratings";
import { FACULTY_SUMMARY_FIELDS } from "@/lib/faculty-config";
import { LEVEL_LABELS, BASE_URL } from "@/lib/config";
import { formatSubjectName, PUBLIC_REVIEW_COLUMNS } from "@/lib/format";
import SubjectSortControls from "@/components/SubjectSortControls";
import type { Metadata } from "next";
import { generateSubjectMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";

const RESERVED = new Set(["admin", "api", "account", "login", "compare", "review", "add-faculty", "about", "privacy", "terms", "guidelines", "community-guidelines", "sitemap.xml", "robots.txt"]);

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ level: string; subject: string }>;
}): Promise<Metadata> {
  const { level, subject } = await params;
  return generateSubjectMetadata({ level, subject });
}

export default async function SubjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ level: string; subject: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { level, subject } = await params;
  if (RESERVED.has(level) || RESERVED.has(subject)) notFound();

  const { sort: sortParam } = await searchParams;

  const VALID_SORTS = ["most_reviewed", "highest_rated", "recent", "az", "za"] as const;
  type Sort = (typeof VALID_SORTS)[number];
  const sort: Sort = VALID_SORTS.includes(sortParam as Sort) ? (sortParam as Sort) : "most_reviewed";

  const { data: subjectFaculties, error } = await supabase
    .from("faculties")
    .select("*")
    .ilike("subject", subject)
    .ilike("level", level)
    .eq("active", true);

  if (error) {
    return (
      <main className="max-w-6xl mx-auto p-10 text-red-500">
        Error loading faculties.
      </main>
    );
  }

  const slugs = subjectFaculties?.map((f) => f.slug) ?? [];

  const { data: rawReviews } = slugs.length
    ? await supabase
        .from("reviews")
        .select(PUBLIC_REVIEW_COLUMNS)
        .in("faculty_slug", slugs)
        .eq("approved", true)
    : { data: [] };

  const allReviews = (rawReviews ?? []) as unknown as Record<string, any>[];

  // Enrich with computed sort keys
  const enrichedFaculties = (subjectFaculties ?? []).map((faculty) => {
    const facultyReviews = allReviews?.filter((r) => r.faculty_slug === faculty.slug) ?? [];
    const overallRating = getOverallRating(facultyReviews as unknown as Record<string, unknown>[]);
    const latestReview = facultyReviews.reduce<string | null>((max, r) => {
      if (!r.created_at) return max;
      return !max || r.created_at > max ? r.created_at : max;
    }, null);
    return { faculty, facultyReviews, overallRating, latestReview };
  });

  switch (sort) {
    case "highest_rated":
      enrichedFaculties.sort((a, b) => b.overallRating - a.overallRating);
      break;
    case "recent":
      enrichedFaculties.sort((a, b) => {
        if (!a.latestReview) return 1;
        if (!b.latestReview) return -1;
        return b.latestReview.localeCompare(a.latestReview);
      });
      break;
    case "az":
      enrichedFaculties.sort((a, b) => a.faculty.faculty_name.localeCompare(b.faculty.faculty_name));
      break;
    case "za":
      enrichedFaculties.sort((a, b) => b.faculty.faculty_name.localeCompare(a.faculty.faculty_name));
      break;
    default:
      enrichedFaculties.sort((a, b) => b.facultyReviews.length - a.facultyReviews.length);
  }

  const levelLabel = LEVEL_LABELS[level.toLowerCase()] ?? level.toUpperCase();
  const subjectLabel = formatSubjectName(subject);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",       item: BASE_URL },
      { "@type": "ListItem", position: 2, name: levelLabel,   item: `${BASE_URL}/${level.toLowerCase()}` },
      { "@type": "ListItem", position: 3, name: subjectLabel, item: `${BASE_URL}/${level.toLowerCase()}/${subject.toLowerCase()}` },
    ],
  };

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <a
            href={`/${level}`}
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition"
          >
            ← {levelLabel}
          </a>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-white">
            {subjectLabel}
          </h1>
          <p className="text-white/55 text-sm mt-3">
            {enrichedFaculties.length}{" "}
            {enrichedFaculties.length === 1 ? "faculty" : "faculties"} · Compare reviews, ratings and student experiences.
          </p>
          {enrichedFaculties.length > 1 && (
            <SubjectSortControls level={level} subject={subject} current={sort} />
          )}
        </div>
      </section>

      {/* Faculty grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        {enrichedFaculties.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-10 sm:p-12 text-center">
            <p className="font-playfair text-xl font-bold text-ink mb-2">No faculties listed yet</p>
            <p className="text-ink/55 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
              Know a {subjectLabel} faculty who should be here? Request them and we&apos;ll add them.
            </p>
            <a
              href={`/add-faculty`}
              className="inline-block bg-gold text-ink px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition"
            >
              Request a Faculty →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {enrichedFaculties.map(({ faculty, facultyReviews, overallRating }) => {
              const hasReviews = facultyReviews.length > 0;
              const bestFor = hasReviews ? facultyReviews[0]?.best_for?.[0] : null;
              const teachingStyle = hasReviews ? facultyReviews[0]?.teacher_style : null;
              const reviewPreview = hasReviews ? facultyReviews[0]?.review_text : null;

              return (
                <a
                  key={faculty.slug}
                  href={`/faculty/${faculty.slug}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group block"
                >
                  <div className="h-[3px] bg-navy" />
                  <div className="p-6 sm:p-7">

                    {/* Name + Rating */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="font-playfair text-xl font-bold text-ink leading-tight">
                          {faculty.faculty_name}
                        </h2>
                        {(teachingStyle || bestFor) && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {teachingStyle && (
                              <span className="bg-parchment text-ink/65 px-2.5 py-1 rounded-full text-xs font-medium">
                                {teachingStyle}
                              </span>
                            )}
                            {bestFor && (
                              <span className="bg-parchment text-ink/65 px-2.5 py-1 rounded-full text-xs font-medium">
                                {formatSubjectName(bestFor)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Rating block */}
                      <div className="text-right shrink-0">
                        {hasReviews ? (
                          <>
                            <div className="flex items-baseline justify-end gap-1">
                              <span className="text-gold text-sm leading-none">★</span>
                              <span className="font-playfair text-2xl font-bold text-ink leading-none">
                                {overallRating}
                              </span>
                            </div>
                            <div className="text-ink/40 text-[10px] mt-1 text-right">
                              {facultyReviews.length}{" "}
                              {facultyReviews.length === 1 ? "review" : "reviews"}
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="font-playfair text-2xl font-bold text-ink/25">—</span>
                            <div className="text-ink/30 text-[10px] mt-1">No reviews</div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Review preview */}
                    {reviewPreview ? (
                      <div className="mt-5 border-l-[3px] border-gold pl-4">
                        <p className="text-ink/55 italic text-sm line-clamp-2">
                          "{reviewPreview}"
                        </p>
                      </div>
                    ) : (
                      <p className="mt-5 text-ink/35 text-sm italic">
                        No reviews yet. Be the first to review.
                      </p>
                    )}

                    {/* Faculty metadata */}
                    {FACULTY_SUMMARY_FIELDS.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-5">
                        {FACULTY_SUMMARY_FIELDS.map((field) => {
                          const value = faculty[field.key as keyof typeof faculty];
                          if (!value) return null;
                          return (
                            <div
                              key={field.key}
                              className="bg-parchment rounded-lg p-2.5 text-center"
                            >
                              <div className="text-ink text-xs font-semibold">
                                {Array.isArray(value) ? value.join(", ") : String(value)}
                              </div>
                              <div className="text-ink/45 text-[10px] mt-0.5">
                                {field.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-5 text-gold text-sm font-semibold group-hover:underline">
                      View Profile →
                    </div>

                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Add Faculty CTA */}
        {enrichedFaculties.length > 0 && (
          <div className="mt-10 pt-8 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink">Can&apos;t find your faculty?</p>
              <p className="text-xs text-ink/50 mt-0.5">Help grow the platform — request a faculty and we&apos;ll add them.</p>
            </div>
            <a
              href="/add-faculty"
              className="shrink-0 border border-slate-300 text-ink px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
            >
              + Request a Faculty
            </a>
          </div>
        )}

      </section>

    </main>
  );
}
