"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ratingFields } from "@/lib/rating-config";
import { formatSubjectName } from "@/lib/format";

const RATING_LABELS: Record<number, string> = {
  1: "Very Poor",
  2: "Poor",
  3: "Average",
  4: "Good",
  5: "Excellent",
};

const BEST_FOR_OPTIONS = [
  "Conceptual Learners",
  "Exam-Focused Students",
  "Rank Aspirants",
  "Last-Minute Revisers",
  "Working Professionals / Articleship",
  "First Timers",
  "Repeaters",
];

const selectClass =
  "w-full border border-slate-200 rounded-xl p-3 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-navy text-sm";

export default function ReviewForm({
  faculty,
}: {
  faculty: { slug: string; faculty_name: string; level: string; subject: string };
}) {
  const [formData, setFormData] = useState({
    attempt: "",
    student_type: "",
    course_type: "",
    teacher_style: "",
    course_progress: "",
    class_environment: "",
    actual_duration_hours: "",
    best_for: [] as string[],
    would_recommend: "",
    pros: "",
    cons: "",
    review_text: "",
  });

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [ratingReasons, setRatingReasons] = useState<Record<string, string>>({});
  const [expandedReasons, setExpandedReasons] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | undefined>(undefined);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        return;
      }

      setUser(user);

      const { data } = await supabase
        .from("reviews")
        .select("id")
        .eq("faculty_slug", faculty.slug)
        .eq("user_id", user.id)
        .maybeSingle();

      setAlreadyReviewed(!!data);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [faculty.slug]);

  if (user === undefined) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-ink/45 text-sm">Checking authentication…</p>
      </main>
    );
  }

  if (alreadyReviewed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md w-full">
          <h2 className="font-playfair text-2xl font-bold text-ink">Already Reviewed</h2>
          <p className="mt-3 text-ink/60 text-sm">
            You&apos;ve already submitted a review for {faculty.faculty_name}.
          </p>
          <a
            href={`/faculty/${faculty.slug}`}
            className="mt-6 inline-block bg-gold text-ink px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition"
          >
            Back to Faculty
          </a>
        </div>
      </main>
    );
  }

  const toggleBestFor = (option: string) => {
    setFormData((prev) => ({
      ...prev,
      best_for: prev.best_for.includes(option)
        ? prev.best_for.filter((i) => i !== option)
        : [...prev.best_for, option],
    }));
  };

  const handleSubmit = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }

    const allRated = ratingFields.every((f) => ratings[f.key]);

    if (
      !formData.attempt ||
      !formData.course_progress ||
      !formData.course_type ||
      !formData.teacher_style ||
      !formData.class_environment ||
      !formData.would_recommend ||
      !formData.pros.trim() ||
      !formData.cons.trim() ||
      !allRated
    ) {
      setShowErrors(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("reviews").insert([{
        faculty_slug: faculty.slug,
        user_id: currentUser.id,
        attempt: formData.attempt,
        student_type: formData.student_type || null,
        course_type: formData.course_type,
        teacher_style: formData.teacher_style,
        course_progress: formData.course_progress,
        class_environment: formData.class_environment,
        actual_duration_hours: formData.actual_duration_hours ? Number(formData.actual_duration_hours) : null,
        best_for: formData.best_for.length > 0 ? formData.best_for : null,
        would_recommend: formData.would_recommend === "Yes",
        pros: formData.pros,
        cons: formData.cons,
        review_text: formData.review_text || null,
        approved: false,
        rating_reasons: Object.keys(ratingReasons).length > 0 ? ratingReasons : null,
        ...ratings,
      }]);

      if (error) {
        if (JSON.stringify(error).includes("unique_user_faculty_review")) {
          setAlreadyReviewed(true);
          return;
        }
        setNotification({ type: "error", message: "Failed to submit review. Please try again." });
        return;
      }

      window.location.href = `/faculty/${faculty.slug}`;

    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldErr = (condition: boolean) =>
    showErrors && condition ? "border-red-400" : "border-slate-200";

  const subjectLabel = formatSubjectName(faculty.subject);

  return (
    <main className="min-h-screen">

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-12">
          <a
            href={`/faculty/${faculty.slug}`}
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition"
          >
            ← Back to {faculty.faculty_name}
          </a>
          <h1 className="font-playfair text-3xl font-bold text-white">Write a Review</h1>
          <p className="mt-2 text-white/50 text-sm">
            {faculty.faculty_name} · {faculty.level} · {subjectLabel}
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Guideline banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
          <div className="flex-1 text-amber-900 space-y-0.5">
            <p>✅ Share your genuine experience — both positives and negatives.</p>
            <p>🚫 No personal info, promotional content, or defamatory language.</p>
          </div>
          <p className="text-xs text-amber-700 shrink-0">Moderated · usually within 24h</p>
        </div>

        {showErrors && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm">
            Please complete all required fields marked with *.
          </div>
        )}

        {notification && (
          <div className={`rounded-xl px-5 py-3 text-sm ${notification.type === "error"
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-green-50 border border-green-200 text-green-700"
            }`}>
            {notification.message}
          </div>
        )}

        {/* ── Section 1: Background ── */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-playfair text-lg font-bold text-ink mb-4">Your Background</h2>
          <div className="grid sm:grid-cols-2 gap-4">

            <div>
              <label className="block mb-1.5 text-sm font-semibold text-ink">
                Attempt <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.attempt}
                onChange={(e) => setFormData({ ...formData, attempt: e.target.value })}
                className={`${selectClass} ${fieldErr(!formData.attempt)}`}
              >
                <option value="">Select</option>
                <option>First Attempt</option>
                <option>Second Attempt</option>
                <option>Third Attempt+</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-semibold text-ink">
                Course Progress <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.course_progress}
                onChange={(e) => setFormData({ ...formData, course_progress: e.target.value })}
                className={`${selectClass} ${fieldErr(!formData.course_progress)}`}
              >
                <option value="">Select</option>
                <option>Less than 25%</option>
                <option>25% – 50%</option>
                <option>50% – 75%</option>
                <option>More than 75%</option>
                <option>Completed</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-semibold text-ink">
                Course Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.course_type}
                onChange={(e) => setFormData({ ...formData, course_type: e.target.value })}
                className={`${selectClass} ${fieldErr(!formData.course_type)}`}
              >
                <option value="">Select</option>
                <option>Regular</option>
                <option>Fast Track</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-semibold text-ink">
                Student Type <span className="text-red-500">*</span>
              </label>

              <select
                value={formData.student_type}
                onChange={(e) =>
                  setFormData({ ...formData, student_type: e.target.value })
                }
                className={`${selectClass} ${fieldErr(!formData.student_type)}`}
              >
                <option value="">Select</option>
                <option>In Articleship</option>
                <option>On Study Leave</option>
                <option>Industrial Training</option>
                <option>Not In Articleship</option>
              </select>
            </div>

          </div>
        </div>

        {/* ── Section 2: Ratings ── */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-playfair text-lg font-bold text-ink mb-1">
            Rate Your Experience <span className="text-red-500">*</span>
          </h2>
          <p className="text-ink/45 text-sm mb-5">Help future CA students make better coaching decisions.</p>

          <div className="grid md:grid-cols-2 gap-3">
            {ratingFields.map((field) => {
              const selected = ratings[field.key];
              const hasError = showErrors && !selected;
              return (
                <div
                  key={field.key}
                  className={`border rounded-xl p-5 ${hasError ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                >
                  <div className="mb-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-ink">{field.label}</span>
                      {selected && (
                        <span className="text-xs text-navy font-medium shrink-0">{RATING_LABELS[selected]}</span>
                      )}
                    </div>
                    <p className="text-xs text-ink/60 mt-0.5 leading-snug">{field.hint}</p>
                  </div>

                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRatings({ ...ratings, [field.key]: val })}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${selected === val
                            ? "bg-navy text-white"
                            : "bg-slate-100 text-ink/80 hover:bg-slate-200"
                          }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-ink/45">Poor</span>
                    <span className="text-[10px] text-ink/45">Excellent</span>
                  </div>

                  {expandedReasons[field.key] ? (
                    <textarea
                      rows={2}
                      value={ratingReasons[field.key] ?? ""}
                      onChange={(e) => setRatingReasons({ ...ratingReasons, [field.key]: e.target.value })}
                      placeholder="Why? (optional)"
                      autoFocus
                      className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 text-ink placeholder:text-ink/30 text-xs focus:outline-none focus:ring-2 focus:ring-navy"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setExpandedReasons((prev) => ({ ...prev, [field.key]: true }))}
                      className="mt-3 text-xs text-ink/50 hover:text-ink/70 transition flex items-center gap-1"
                    >
                      💬 Explain your rating <span className="text-ink/35">(optional)</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Section 3: Your Review ── */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-playfair text-lg font-bold text-ink mb-4">Your Review</h2>

          <div className="space-y-5">

            <div>
              <label className="block mb-2 text-sm font-semibold text-ink">
                Would you recommend this faculty? <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                {["Yes", "No"].map((val) => (
                  <label
                    key={val}
                    className={`flex-1 text-center border rounded-xl py-3 cursor-pointer font-semibold text-sm transition ${formData.would_recommend === val
                        ? val === "Yes"
                          ? "bg-green-50 border-green-500 text-green-700"
                          : "bg-red-50 border-red-400 text-red-700"
                        : "border-slate-200 text-ink/70 hover:bg-slate-50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="recommend"
                      className="hidden"
                      checked={formData.would_recommend === val}
                      onChange={() => setFormData({ ...formData, would_recommend: val })}
                    />
                    {val === "Yes" ? "👍 Yes" : "👎 No"}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-semibold text-ink">
                Pros <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.pros}
                onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                placeholder="What worked well? Teaching, notes, revision, doubt support…"
                className={`w-full border rounded-xl p-3 text-ink placeholder:text-ink/30 text-sm focus:outline-none focus:ring-2 focus:ring-navy ${fieldErr(!formData.pros.trim())}`}
              />
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-semibold text-ink">
                Cons <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.cons}
                onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                placeholder="What could be better? Pacing, coverage, updates, support…"
                className={`w-full border rounded-xl p-3 text-ink placeholder:text-ink/30 text-sm focus:outline-none focus:ring-2 focus:ring-navy ${fieldErr(!formData.cons.trim())}`}
              />
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-semibold text-ink">
                Overall Review <span className="text-ink/40 font-normal">(optional)</span>
              </label>
              <textarea
                rows={4}
                value={formData.review_text}
                onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                placeholder="Anything else future students should know…"
                className="w-full border border-slate-200 rounded-xl p-3 text-ink placeholder:text-ink/30 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>

          </div>
        </div>

        {/* ── Section 4: Course Experience ── */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-playfair text-lg font-bold text-ink mb-4">Course Experience</h2>
          <div className="grid sm:grid-cols-2 gap-4">

            <div>
              <label className="block mb-1.5 text-sm font-semibold text-ink">
                Teaching Style <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.teacher_style}
                onChange={(e) => setFormData({ ...formData, teacher_style: e.target.value })}
                className={`${selectClass} ${fieldErr(!formData.teacher_style)}`}
              >
                <option value="">Select</option>
                <option>Conceptual</option>
                <option>Exam Oriented</option>
                <option>Balanced</option>
                <option>Revision Focused</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-semibold text-ink">
                Class Environment <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.class_environment}
                onChange={(e) => setFormData({ ...formData, class_environment: e.target.value })}
                className={`${selectClass} ${fieldErr(!formData.class_environment)}`}
              >
                <option value="">Select</option>
                <option>Strict &amp; Focused</option>
                <option>Balanced</option>
                <option>Interactive &amp; Fun</option>
                <option>Too Much Timepass</option>
              </select>
            </div>

          </div>
        </div>

        {/* ── Section 5: Optional extras ── */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-playfair text-lg font-bold text-ink mb-1">A Few More Details</h2>
          <p className="text-ink/40 text-xs mb-4">Optional — helps future students filter.</p>

          <div className="space-y-5">

            <div>
              <label className="block mb-1.5 text-sm font-semibold text-ink">Actual Duration (Hours)</label>
              <input
                type="number"
                min="1"
                value={formData.actual_duration_hours}
                onChange={(e) => setFormData({ ...formData, actual_duration_hours: e.target.value })}
                placeholder="e.g. 240"
                className={selectClass}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-ink">Best For</label>
              <div className="flex flex-wrap gap-2">
                {BEST_FOR_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className={`px-3 py-1.5 border rounded-full cursor-pointer transition font-medium text-sm select-none ${formData.best_for.includes(option)
                        ? "bg-navy text-white border-navy"
                        : "border-slate-200 text-ink/60 hover:bg-slate-50"
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.best_for.includes(option)}
                      onChange={() => toggleBestFor(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Submit */}
        <div className="pb-12">
          <p className="text-xs text-ink/40 mb-3">
            By submitting, you confirm this is your genuine experience and you are not affiliated with this faculty.
          </p>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-gold text-ink py-4 rounded-2xl font-semibold text-base hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </div>

      </section>
    </main>
  );
}
