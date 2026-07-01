"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { ratingFields } from "@/lib/rating-config";
import { formatSubjectName } from "@/lib/format";
import { CheckCircle2, Share2, Copy, Check } from "lucide-react";
import { BASE_URL, INSTAGRAM_URL, WHATSAPP_URL, TELEGRAM_URL } from "@/lib/config";
import { track } from "@/lib/track";
import { REVIEW_VERSION, detectBrowser, hashUserAgent } from "@/lib/client-meta";
import TurnstileWidget from "@/components/TurnstileWidget";

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
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{ slug: string; faculty_name: string; subject: string }>>([]);

  const typingStartedAtRef = useRef<number | null>(null);
  const markStarted = () => {
    if (typingStartedAtRef.current === null) {
      typingStartedAtRef.current = Date.now();
      track("review_started", { faculty_slug: faculty.slug, subject: faculty.subject, level: faculty.level });
    }
  };

  useEffect(() => {
    if (!submitted || !user) return;
    const fetchSuggestions = async () => {
      const [{ data: candidates }, { data: myReviews }] = await Promise.all([
        supabase
          .from("faculties")
          .select("slug, faculty_name, subject")
          .eq("level", faculty.level)
          .neq("subject", faculty.subject)
          .limit(30),
        supabase
          .from("reviews")
          .select("faculty_slug")
          .eq("user_id", user.id),
      ]);
      const reviewed = new Set((myReviews ?? []).map((r) => r.faculty_slug));
      const seen = new Set<string>();
      setSuggestions(
        (candidates ?? [])
          .filter((f) => !reviewed.has(f.slug))
          .filter((f) => { if (seen.has(f.subject)) return false; seen.add(f.subject); return true; })
          .slice(0, 4)
      );
    };
    fetchSuggestions();
  }, [submitted, user, faculty.level, faculty.subject]);

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
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
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

    // CAPTCHA check
    const siteKey = process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY;
    if (siteKey && !captchaToken) {
      setNotification({ type: "error", message: "Please complete the CAPTCHA to continue." });
      return;
    }
    if (captchaToken) {
      const captchaRes = await fetch("/api/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken }),
      });
      if (!captchaRes.ok) {
        setNotification({ type: "error", message: "CAPTCHA verification failed. Please refresh and try again." });
        return;
      }
    }

    setSubmitting(true);

    try {
      const submittedAt    = new Date();
      const typingStartedAt = typingStartedAtRef.current ? new Date(typingStartedAtRef.current) : null;
      const timeTakenSeconds = typingStartedAt
        ? Math.round((submittedAt.getTime() - typingStartedAt.getTime()) / 1000)
        : null;

      const userAgentHash = await hashUserAgent(navigator.userAgent);

      const reviewData = {
        faculty_slug:          faculty.slug,
        attempt:               formData.attempt,
        student_type:          formData.student_type || null,
        course_type:           formData.course_type,
        teacher_style:         formData.teacher_style,
        course_progress:       formData.course_progress,
        class_environment:     formData.class_environment,
        actual_duration_hours: formData.actual_duration_hours ? Number(formData.actual_duration_hours) : null,
        best_for:              formData.best_for.length > 0 ? formData.best_for : null,
        would_recommend:       formData.would_recommend === "Yes",
        pros:                  formData.pros,
        cons:                  formData.cons,
        review_text:           formData.review_text || null,
        rating_reasons:        Object.keys(ratingReasons).length > 0 ? ratingReasons : null,
        ...ratings,
        typing_started_at:  typingStartedAt?.toISOString() ?? null,
        submitted_at:       submittedAt.toISOString(),
        time_taken_seconds: timeTakenSeconds,
        referrer:           document.referrer || null,
        utm_source:         new URLSearchParams(window.location.search).get("utm_source"),
        device_type:        /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
        user_agent_hash:    userAgentHash,
        browser:            detectBrowser(navigator.userAgent),
        review_version:     REVIEW_VERSION,
        // user_id, ip_hash, country, approved — set server-side
      };

      const res = await fetch("/api/submit-review", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ reviewData }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429) {
          setNotification({ type: "error", message: data.message ?? "Too many submissions today. Try again tomorrow." });
          return;
        }
        if (res.status === 422) {
          setNotification({ type: "error", message: data.message ?? "Your review contains language that isn't allowed. Please revise and resubmit." });
          return;
        }
        if (res.status === 409) {
          setAlreadyReviewed(true);
          return;
        }
        setNotification({ type: "error", message: "Failed to submit review. Please try again." });
        return;
      }

      setSubmitted(true);
      track("review_submitted", {
        faculty_slug: faculty.slug,
        subject:      faculty.subject,
        level:        faculty.level,
        time_taken_seconds: timeTakenSeconds,
      });

    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const shareUrl = `${BASE_URL}/faculty/${faculty.slug}?utm_source=whatsapp_share`;
  const shareText = `I just reviewed ${faculty.faculty_name} on Careviews. If you've studied under them too, your experience could help a lot of CA students — takes 5 minutes. Write yours: ${shareUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleShareClick = () => {
    track("share_clicked", { share_source: "whatsapp", faculty_slug: faculty.slug });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    track("share_clicked", { share_source: "copy_link", faculty_slug: faculty.slug });
    setTimeout(() => setCopied(false), 2500);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-parchment">
        <section className="bg-navy text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-12">
            <h1 className="font-playfair text-3xl font-bold text-white">Review Submitted</h1>
            <p className="mt-2 text-white/50 text-sm">
              {faculty.faculty_name} · {faculty.level} · {formatSubjectName(faculty.subject)}
            </p>
          </div>
        </section>

        <section className="max-w-xl mx-auto px-4 sm:px-6 py-14 space-y-5">

          {/* Success card */}
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-green-500" />
            </div>
            <h2 className="font-playfair text-2xl font-bold text-ink">Thank you</h2>
            <p className="mt-2 text-ink/60 text-sm leading-relaxed max-w-xs mx-auto">
              Your review is pending approval and will go live within 24 hours. Every genuine review makes this platform more useful.
            </p>
            <a
              href={`/faculty/${faculty.slug}`}
              className="mt-6 inline-block bg-gold text-ink px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition"
            >
              Back to {faculty.faculty_name} →
            </a>
          </div>

          {/* Community CTA */}
          <div className="bg-navy rounded-xl p-6">
            <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-2">You&apos;re now a contributor</p>
            <h3 className="text-white font-semibold text-base mb-1">Want to help shape Careviews?</h3>
            <p className="text-white/55 text-sm leading-relaxed mb-4">
              Join our community where we discuss new features, collect feedback, and share updates.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Instagram", url: INSTAGRAM_URL, color: "#E1306C" },
                { name: "WhatsApp",  url: WHATSAPP_URL,  color: "#25D366" },
                { name: "Telegram",  url: TELEGRAM_URL,  color: "#2CA5E0" },
              ].map(({ name, url, color }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-85"
                  style={{ backgroundColor: color }}
                >
                  {name}
                </a>
              ))}
            </div>
          </div>

          {/* Cross-review nudge */}
          {suggestions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm font-semibold text-ink mb-1">Did you also study under…</p>
              <p className="text-xs text-ink/50 mb-4 leading-relaxed">
                You reviewed {formatSubjectName(faculty.subject)} — if you took other subjects too, your review helps those students as well.
              </p>
              <div className="flex flex-col gap-2">
                {suggestions.map((s) => (
                  <a
                    key={s.subject}
                    href={`/${faculty.level.toLowerCase()}/${s.subject.toLowerCase()}`}
                    className="flex items-center justify-between px-4 py-3 border border-slate-200 rounded-xl hover:border-gold hover:bg-gold/5 transition group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">{formatSubjectName(s.subject)}</p>
                      <p className="text-xs text-ink/45 mt-0.5">Browse faculties</p>
                    </div>
                    <span className="text-gold text-sm font-semibold group-hover:translate-x-0.5 transition-transform">View →</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Share card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-2">
              <Share2 size={16} className="text-gold shrink-0" />
              <p className="text-sm font-semibold text-ink">Know someone else who studied from {faculty.faculty_name}?</p>
            </div>
            <p className="text-xs text-ink/55 leading-relaxed mb-5">
              Their experience could help a future CA student make a better decision. One more review takes 5 minutes and goes a long way.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleShareClick}
                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.554 4.107 1.523 5.83L.057 23.7a.5.5 0 0 0 .61.61l5.87-1.466A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.012-1.375l-.36-.213-3.724.975.994-3.635-.234-.373A9.818 9.818 0 1 1 12 21.818z"/>
                </svg>
                Share on WhatsApp
              </a>

              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 border border-slate-200 text-ink px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
              >
                {copied
                  ? <><Check size={15} className="text-green-500" /> Copied!</>
                  : <><Copy size={15} /> Copy Link</>
                }
              </button>
            </div>
          </div>

        </section>
      </main>
    );
  }

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

      <section
        className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5"
        onChangeCapture={markStarted}
        onClickCapture={markStarted}
      >

        {/* Guideline banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
          <div className="flex-1 text-amber-900 space-y-0.5">
            <p>✅ Share your genuine experience — both positives and negatives.</p>
            <p>🚫 No profanity, personal attacks, promotional content, or defamatory language.</p>
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
          <div className="mb-4">
            <TurnstileWidget onSuccess={(token) => setCaptchaToken(token)} />
          </div>
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
