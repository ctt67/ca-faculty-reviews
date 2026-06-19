"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ComparePage() {
  const router = useRouter();

  const [faculties, setFaculties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [faculty1, setFaculty1] = useState("");
  const [faculty2, setFaculty2] = useState("");

  useEffect(() => {
    const loadFaculties = async () => {
      const { data } = await supabase
        .from("faculties")
        .select("*")
        .eq("active", true);
      setFaculties(data ?? []);
      setLoading(false);
    };
    loadFaculties();
  }, []);

  const levels = [...new Set(faculties.map((f) => f.level))];
  const subjects = [
    ...new Set(faculties.filter((f) => f.level === level).map((f) => f.subject)),
  ];
  const filteredFaculties = faculties.filter(
    (f) => f.level === level && f.subject === subject
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

  return (
    <main className="min-h-screen bg-slate-100">

      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-extrabold">
              Compare
              <span className="text-blue-500"> Faculties</span>
            </h1>
            <p className="mt-6 text-xl text-slate-400">
              Compare two faculties side-by-side before making your decision.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-16">

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">

          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Select Faculties to Compare
          </h2>

          {loading ? (
            <div className="text-slate-400 text-sm py-8 text-center">Loading faculties...</div>
          ) : (
            <div className="space-y-5">

              {/* Level */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Level
                </label>
                <select
                  value={level}
                  onChange={(e) => {
                    setLevel(e.target.value);
                    setSubject("");
                    setFaculty1("");
                    setFaculty2("");
                  }}
                  className="w-full border border-slate-200 rounded-xl p-3.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Level</option>
                  {levels.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              {level && (
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setFaculty1("");
                      setFaculty2("");
                    }}
                    className="w-full border border-slate-200 rounded-xl p-3.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Faculty selects */}
              {subject && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700">
                      Faculty 1
                    </label>
                    <select
                      value={faculty1}
                      onChange={(e) => setFaculty1(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      {filteredFaculties.map((f) => (
                        <option key={f.slug} value={f.slug}>
                          {f.faculty_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700">
                      Faculty 2
                    </label>
                    <select
                      value={faculty2}
                      onChange={(e) => setFaculty2(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      {filteredFaculties.map((f) => (
                        <option key={f.slug} value={f.slug}>
                          {f.faculty_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button
                onClick={handleCompare}
                disabled={!canCompare}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                Compare Faculties
              </button>

            </div>
          )}
        </div>

      </section>

    </main>
  );
}
