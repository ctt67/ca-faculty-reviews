import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import { generateLevelMetadata } from "@/lib/seo";
import { LEVEL_LABELS } from "@/lib/config";
import { formatSubjectName } from "@/lib/format";
import { notFound } from "next/navigation";

const RESERVED = new Set(["admin", "api", "account", "login", "compare", "review", "add-faculty", "about", "privacy", "terms", "guidelines", "community-guidelines"]);

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ level: string }>;
}): Promise<Metadata> {
  const { level } = await params;
  return generateLevelMetadata(level);
}

export default async function LevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  if (RESERVED.has(level)) notFound();

  const { data: faculties, error } = await supabase
    .from("faculties")
    .select("subject")
    .eq("active", true)
    .ilike("level", level);

  if (error) {
    return (
      <main className="max-w-6xl mx-auto p-10 text-red-500">
        Error loading subjects.
      </main>
    );
  }

  // Dedupe case-insensitively — DB has mixed-case subject strings
  const subjects = [
    ...new Map((faculties ?? []).map((f) => [f.subject.toLowerCase(), f.subject])).values(),
  ].sort((a, b) => a.localeCompare(b));
  const levelLabel = LEVEL_LABELS[level.toLowerCase()] ?? `CA ${level.toUpperCase()}`;

  return (
    <main className="min-h-screen">

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition"
          >
            ← Home
          </a>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-white">
            {levelLabel}
          </h1>
          <p className="text-white/55 text-sm mt-3">
            {subjects.length} {subjects.length === 1 ? "subject" : "subjects"} · Browse and compare faculty reviews.
          </p>
        </div>
      </section>

      {/* Subjects */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="mb-8">
          <h2 className="font-playfair text-2xl font-bold text-ink">Subjects</h2>
          <p className="text-ink/60 mt-2 text-sm">
            Select a subject to view faculty reviews and ratings.
          </p>
        </div>

        {subjects.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-12 text-center text-ink/40">
            No subjects found for this level yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((subject) => (
              <a
                key={subject}
                href={`/${level}/${encodeURIComponent(subject.toLowerCase())}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group block"
              >
                <div className="h-[3px] bg-navy" />
                <div className="p-6 sm:p-7">
                  <h3 className="font-playfair text-xl font-bold text-ink">{formatSubjectName(subject)}</h3>
                  <p className="mt-2 text-ink/60 text-sm">
                    Browse faculty reviews, ratings and comparisons.
                  </p>
                  <div className="mt-6 text-gold text-sm font-semibold group-hover:underline">
                    Browse Faculties →
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
        {subjects.length > 0 && (
          <p className="text-sm text-ink/45 mt-8 text-center">
            Studied under a {levelLabel} faculty?{" "}
            <a href="/review" className="text-gold font-semibold hover:underline">
              Write a review →
            </a>
          </p>
        )}
      </section>

    </main>
  );
}
