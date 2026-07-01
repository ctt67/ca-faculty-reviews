"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatSubjectName } from "@/lib/format";
import type { Faculty } from "@/lib/types";

export default function ReviewHomePage() {
  const router = useRouter();

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [faculty, setFaculty] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("faculties")
        .select("slug, faculty_name, level, subject")
        .eq("active", true);
      setFaculties((data as Faculty[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const levels = [...new Set(faculties.map((f) => f.level))];
  const subjects = [...new Set(faculties.filter((f) => f.level === level).map((f) => f.subject))];
  const filteredFaculties = faculties.filter((f) => f.level === level && f.subject === subject);

  const handleContinue = () => {
    if (faculty) router.push(`/review/${faculty}`);
  };

  return (
    <main className="min-h-screen bg-parchment">

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold">
            Write a <span className="text-gold">Review</span>
          </h1>
          <p className="mt-3 text-white/55 text-base max-w-xl">
            Share your experience and help fellow CA students choose the right faculty.
          </p>
        </div>
      </section>

      {/* Faculty selector */}
      <section className="max-w-xl mx-auto px-4 sm:px-6 py-14">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="font-playfair text-xl font-bold text-ink mb-6">Select Faculty</h2>

          {loading ? (
            <div className="text-ink/35 text-sm py-8 text-center">Loading faculties…</div>
          ) : (
            <div className="space-y-5">

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-ink/55 uppercase tracking-wider">Level</label>
                <select
                  value={level}
                  onChange={(e) => { setLevel(e.target.value); setSubject(""); setFaculty(""); }}
                  className="w-full border border-slate-200 rounded-xl p-3.5 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-navy"
                >
                  <option value="">Select Level</option>
                  {levels.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {level && (
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-ink/55 uppercase tracking-wider">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => { setSubject(e.target.value); setFaculty(""); }}
                    className="w-full border border-slate-200 rounded-xl p-3.5 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s} value={s}>{formatSubjectName(s)}</option>
                    ))}
                  </select>
                </div>
              )}

              {subject && (
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-ink/55 uppercase tracking-wider">Faculty</label>
                  <select
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3.5 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    <option value="">Select Faculty</option>
                    {filteredFaculties.map((f) => (
                      <option key={f.slug} value={f.slug}>{f.faculty_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleContinue}
                disabled={!faculty}
                className="w-full bg-gold text-ink py-3.5 rounded-xl text-sm font-semibold hover:bg-gold/90 transition disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                Continue to Review →
              </button>

            </div>
          )}
        </div>
      </section>

    </main>
  );
}
