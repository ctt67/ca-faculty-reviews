import { supabase } from "@/lib/supabase";
import { getOverallRating } from "@/lib/ratings";
import { FACULTY_SUMMARY_FIELDS } from "@/lib/faculty-config";
import { LEVEL_LABELS } from "@/lib/config";
import { formatSubjectName } from "@/lib/format";
import type { Metadata } from "next";
import { generateSubjectMetadata } from "@/lib/seo";

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
}: {
  params: Promise<{ level: string; subject: string }>;
}) {
  const { level, subject } = await params;

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

  const { data: allReviews } = slugs.length
    ? await supabase
        .from("reviews")
        .select("*")
        .in("faculty_slug", slugs)
        .eq("approved", true)
    : { data: [] };

  // Enrich with review data and sort by review count descending
  const enrichedFaculties = (subjectFaculties ?? [])
    .map((faculty) => {
      const facultyReviews = allReviews?.filter((r) => r.faculty_slug === faculty.slug) ?? [];
      return { faculty, facultyReviews };
    })
    .sort((a, b) => b.facultyReviews.length - a.facultyReviews.length);

  const levelLabel = LEVEL_LABELS[level.toLowerCase()] ?? level.toUpperCase();
  const subjectLabel = formatSubjectName(subject);

  return (
    <main className="min-h-screen">

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
        </div>
      </section>

      {/* Faculty grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        {enrichedFaculties.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-12 text-center text-ink/40">
            No faculties found for this subject yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {enrichedFaculties.map(({ faculty, facultyReviews }) => {
              const overallRating = getOverallRating(
                facultyReviews as unknown as Record<string, unknown>[]
              );
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
      </section>

    </main>
  );
}
