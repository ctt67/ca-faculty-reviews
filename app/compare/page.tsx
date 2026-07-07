"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatSubjectName } from "@/lib/format";

export default function ComparePage() {
  const router = useRouter();

  const [faculties, setFaculties] = useState<any[]>([]);
  const [reviewedSlugs, setReviewedSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [faculty1, setFaculty1] = useState("");
  const [faculty2, setFaculty2] = useState("");

  useEffect(() => {
    const loadFaculties = async () => {
      const [{ data: facultyData }, { data: reviewData }] = await Promise.all([
        supabase.from("faculties").select("slug, faculty_name, level, subject").eq("active", true),
        supabase.from("reviews").select("faculty_slug").eq("approved", true),
      ]);
      setFaculties(facultyData ?? []);
      setReviewedSlugs(new Set((reviewData ?? []).map((r) => r.faculty_slug)));
      setLoading(false);
    };
    loadFaculties();
  }, []);

  const levels = [...new Set(
    faculties.filter((f) => reviewedSlugs.has(f.slug)).map((f) => f.level)
  )];
  const subjects = [...new Set(
    faculties
      .filter((f) => f.level === level && reviewedSlugs.has(f.slug))
      .map((f) => f.subject)
  )];
  const filteredFaculties = faculties.filter(
    (f) => f.level === level && f.subject === subject && reviewedSlugs.has(f.slug)
  );

  const handleCompare = () => {
    if (!faculty1 || !faculty2) return;
    if (faculty1 === faculty2) {
      alert("Please select two different faculties");
      return;
    }
    router.push(`/compare/${faculty1}/${faculty2}`);
  };

  const canCompare = faculty1 && faculty2 && faculty1 !== faculty2;

  const selectClass =
    "w-full border border-slate-200 rounded-xl p-3.5 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-navy text-sm";

  return (
    <main className="min-h-screen">

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <p className="text-gold uppercase tracking-widest text-xs font-semibold mb-3">Compare</p>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-white">
            Which faculty is right for you?
          </h1>
          <p className="mt-3 text-white/55 text-sm max-w-xl">
            Pick two faculties from the same subject and compare ratings, teaching styles,
            and student reviews side by side.
          </p>
          <p className="mt-3 inline-flex items-center gap-2 bg-white/8 border border-white/15 text-white/60 text-xs px-3 py-1.5 rounded-full">
            Only faculties with at least one approved review appear in the list below.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <h2 className="font-playfair text-xl font-bold text-ink mb-6">Select Faculties</h2>

          {loading ? (
            <div className="text-ink/40 text-sm py-8 text-center">Loading…</div>
          ) : (
            <div className="space-y-5">

              {/* Level */}
              <div>
                <label className="block mb-1.5 text-sm font-semibold text-ink">Level</label>
                <select
                  value={level}
                  onChange={(e) => {
                    setLevel(e.target.value);
                    setSubject("");
                    setFaculty1("");
                    setFaculty2("");
                  }}
                  className={selectClass}
                >
                  <option value="">Select level</option>
                  {levels.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              {level && (
                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-ink">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setFaculty1("");
                      setFaculty2("");
                    }}
                    className={selectClass}
                  >
                    <option value="">Select subject</option>
                    {subjects.map((s) => (
                      <option key={s} value={s}>{formatSubjectName(s)}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Faculty selects */}
              {subject && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-sm font-semibold text-ink">Faculty 1</label>
                    <select
                      value={faculty1}
                      onChange={(e) => setFaculty1(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select</option>
                      {filteredFaculties.map((f) => (
                        <option key={f.slug} value={f.slug}>{f.faculty_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-semibold text-ink">Faculty 2</label>
                    <select
                      value={faculty2}
                      onChange={(e) => setFaculty2(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select</option>
                      {filteredFaculties.map((f) => (
                        <option key={f.slug} value={f.slug}>{f.faculty_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button
                onClick={handleCompare}
                disabled={!canCompare}
                className="w-full bg-gold text-ink py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed mt-1"
              >
                Compare →
              </button>

            </div>
          )}
        </div>
      </section>

    </main>
  );
}
