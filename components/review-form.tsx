"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ratingFields } from "@/lib/rating-config";

// Rating scale is 1–5
const RATING_OPTIONS = [
  { value: 5, label: "Excellent" },
  { value: 4, label: "Good" },
  { value: 3, label: "Average" },
  { value: 2, label: "Poor" },
  { value: 1, label: "Very Poor" },
];

const BEST_FOR_OPTIONS = [
  "First Attempt",
  "Multiple Attempts",
  "Working Professionals",
  "Rankers",
  "Concept Building",
  "Fast Revision",
  "Last Day Revision",
];

export default function ReviewForm({ faculty }: { faculty: any }) {

  const [formData, setFormData] = useState({
    attempt: "",
    student_type: "",
    course_type: "",
    teacher_style: "",
    best_for: [] as string[],
    would_recommend: "",
    pros: "",
    cons: "",
    review_text: "",
  });

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [ratingReasons, setRatingReasons] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) return;

      const { data } = await supabase
        .from("reviews")
        .select("id")
        .eq("faculty_slug", faculty.slug)
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) setAlreadyReviewed(true);
    };

    checkAuth();
  }, [faculty.slug]);

  if (alreadyReviewed) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-900">Already Reviewed</h2>
          <p className="mt-3 text-slate-600">
            You've already submitted a review for {faculty.faculty_name}.
          </p>
          <a
            href={`/faculty/${faculty.slug}`}
            className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
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
    if (!user) {
      alert("Please sign in with Google before submitting a review.");
      return;
    }

    const allRated = ratingFields.every((f) => ratings[f.key]);

    if (
      !formData.attempt ||
      !formData.student_type ||
      !formData.course_type ||
      !formData.teacher_style ||
      formData.best_for.length === 0 ||
      !formData.would_recommend ||
      !formData.pros.trim() ||
      !formData.cons.trim() ||
      !formData.review_text.trim() ||
      !allRated
    ) {
      setShowErrors(true);
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("reviews").insert([{
        faculty_slug: faculty.slug,
        user_id: user.id,
        attempt: formData.attempt,
        student_type: formData.student_type,
        course_type: formData.course_type,
        teacher_style: formData.teacher_style,
        best_for: formData.best_for,
        would_recommend: formData.would_recommend === "Yes",
        pros: formData.pros,
        cons: formData.cons,
        review_text: formData.review_text,
        approved: false,
        rating_reasons: ratingReasons,
        ...ratings,
      }]);

      if (error) {
        if (JSON.stringify(error).includes("unique_user_faculty_review")) {
          setAlreadyReviewed(true);
          return;
        }
        alert("Failed to submit review. Please try again.");
        return;
      }

      alert("Review submitted! It will appear after moderation.");
      window.location.href = `/faculty/${faculty.slug}`;

    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const err = (condition: boolean) =>
    showErrors && condition ? "border-red-400" : "border-slate-200";

  return (
    <main className="min-h-screen bg-slate-100">

      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <a
            href={`/faculty/${faculty.slug}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition"
          >
            ← Back to {faculty.faculty_name}
          </a>
          <h1 className="text-5xl font-extrabold">Write a Review</h1>
          <p className="mt-4 text-slate-400">Help fellow CA students make better decisions.</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12 space-y-8">

        {/* Guideline banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <h3 className="font-semibold text-amber-900">Review Guidelines</h3>
          <p className="text-sm text-amber-800 mt-1">
            Reviews are moderated before publication. Share genuine experiences only.
            Misleading, promotional or abusive reviews will be rejected.
          </p>
        </div>

        {/* Faculty header */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="text-sm text-slate-400 mb-1">Reviewing</div>
          <h2 className="text-3xl font-bold text-slate-900">{faculty.faculty_name}</h2>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{faculty.level}</span>
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">{faculty.subject}</span>
          </div>
        </div>

        {/* Background */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Background</h2>
          <div className="grid md:grid-cols-3 gap-5">

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Attempt <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.attempt}
                onChange={(e) => setFormData({ ...formData, attempt: e.target.value })}
                className={`w-full border rounded-xl p-3.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${err(!formData.attempt)}`}
              >
                <option value="">Select Attempt</option>
                <option>First Attempt</option>
                <option>Second Attempt</option>
                <option>Third Attempt+</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Student Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.student_type}
                onChange={(e) => setFormData({ ...formData, student_type: e.target.value })}
                className={`w-full border rounded-xl p-3.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${err(!formData.student_type)}`}
              >
                <option value="">Select Type</option>
                <option>Full Time Student</option>
                <option>Working Professional</option>
                <option>Self Study</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Course Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.course_type}
                onChange={(e) => setFormData({ ...formData, course_type: e.target.value })}
                className={`w-full border rounded-xl p-3.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${err(!formData.course_type)}`}
              >
                <option value="">Select Course</option>
                <option>Regular</option>
                <option>Fast Track</option>
              </select>
            </div>

          </div>
        </div>

        {/* Faculty Fit */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Faculty Fit</h2>
          <div className="space-y-6">

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Teaching Style <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.teacher_style}
                onChange={(e) => setFormData({ ...formData, teacher_style: e.target.value })}
                className={`w-full border rounded-xl p-3.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${err(!formData.teacher_style)}`}
              >
                <option value="">Select Style</option>
                <option>Conceptual</option>
                <option>Exam Focused</option>
                <option>Balanced</option>
                <option>Fast Revision</option>
              </select>
            </div>

            <div>
              <label className="block mb-3 text-sm font-semibold text-slate-700">
                Best For <span className="text-red-500">*</span>
              </label>
              {showErrors && formData.best_for.length === 0 && (
                <p className="text-red-500 text-xs mb-2">Select at least one option</p>
              )}
              <div className="flex flex-wrap gap-3">
                {BEST_FOR_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className={`px-4 py-2 border rounded-full cursor-pointer transition font-medium text-sm select-none ${
                      formData.best_for.includes(option)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
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

        {/* Ratings — driven by rating-config.ts, 1-10 scale */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Ratings</h2>
          <p className="text-slate-500 text-sm mb-8">
            Rate each aspect from 1 (Very Poor) to 5 (Excellent). All fields required.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {ratingFields.map((field) => (
              <div
                key={field.key}
                className={`border rounded-2xl p-5 ${err(!ratings[field.key])}`}
              >
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  {field.label} <span className="text-red-500">*</span>
                </label>
                <select
                  value={ratings[field.key] ?? ""}
                  onChange={(e) =>
                    setRatings({ ...ratings, [field.key]: Number(e.target.value) })
                  }
                  className="w-full border border-slate-200 rounded-xl p-3 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Rating</option>
                  {RATING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <textarea
                  rows={2}
                  value={ratingReasons[field.key] ?? ""}
                  onChange={(e) =>
                    setRatingReasons({ ...ratingReasons, [field.key]: e.target.value })
                  }
                  placeholder="Why? (Optional)"
                  className="mt-3 w-full border border-slate-200 rounded-xl p-3 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Review */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Detailed Review</h2>
          <p className="text-slate-500 text-sm mb-8">Tell future students about your experience.</p>

          <div className="space-y-6">

            <div>
              <label className="block mb-3 text-sm font-semibold text-slate-700">
                Would You Recommend This Faculty? <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {["Yes", "No"].map((val) => (
                  <label
                    key={val}
                    className={`flex items-center gap-2 border rounded-xl px-5 py-3 cursor-pointer transition ${
                      formData.would_recommend === val
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-slate-200 text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="recommend"
                      className="hidden"
                      checked={formData.would_recommend === val}
                      onChange={() => setFormData({ ...formData, would_recommend: val })}
                    />
                    {val}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Pros <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.pros}
                onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                placeholder="What did the faculty do well?"
                className={`w-full border rounded-xl p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${err(!formData.pros.trim())}`}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Cons <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.cons}
                onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                placeholder="What could have been improved?"
                className={`w-full border rounded-xl p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${err(!formData.cons.trim())}`}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Overall Review <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                value={formData.review_text}
                onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                placeholder="Describe your overall experience with this faculty..."
                className={`w-full border rounded-xl p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${err(!formData.review_text.trim())}`}
              />
            </div>

          </div>
        </div>

        {showErrors && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4 text-sm">
            Please complete all required fields before submitting.
          </div>
        )}

        <div className="pb-16">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </div>

      </section>
    </main>
  );
}
