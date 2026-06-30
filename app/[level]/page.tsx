import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import { generateLevelMetadata } from "@/lib/seo";
import { LEVEL_LABELS } from "@/lib/config";

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

  const { data: faculties, error } = await supabase
    .from("faculties")
    .select("subject")
    .eq("active", true)
    .ilike("level", level);

  if (error) {
    return (
      <main className="max-w-7xl mx-auto p-10 text-red-500">
        Error loading subjects.
      </main>
    );
  }

  const subjects = [
    ...new Set(faculties?.map((f) => f.subject) ?? []),
  ];

  const levelLabel = LEVEL_LABELS[level.toLowerCase()] ?? `CA ${level.toUpperCase()}`;

  return (
    <main className="min-h-screen bg-slate-100">

      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-4xl">

            <a
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition"
            >
              ← Home
            </a>

            <h1 className="text-5xl md:text-7xl font-extrabold">
              {levelLabel}
            </h1>

            <p className="mt-6 text-xl text-slate-400">
              Browse subjects, compare faculties and find the right teacher for you.
            </p>

          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">

        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Subjects</h2>
          <p className="mt-2 text-slate-500">
            Select a subject to view faculty reviews and ratings.
          </p>
        </div>

        {subjects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            No subjects found for this level yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <a
                key={subject}
                href={`/${level}/${encodeURIComponent(subject.toLowerCase())}`}
                className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all group"
              >
                <h3 className="text-2xl font-bold text-slate-900">{subject}</h3>
                <p className="mt-3 text-slate-500 text-sm">
                  Browse faculty reviews, ratings and comparisons.
                </p>
                <div className="mt-8 text-blue-600 font-semibold text-sm group-hover:underline">
                  Browse Faculties →
                </div>
              </a>
            ))}
          </div>
        )}

      </section>

    </main>
  );
}
