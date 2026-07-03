"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import TurnstileWidget from "@/components/TurnstileWidget";

const LEVELS   = ["CA Final", "CA Intermediate", "CA Foundation"];
// Subject strings match existing faculties rows — same canon as the admin Add Faculty form
const SUBJECTS: Record<string, string[]> = {
  "CA Final":         ["FR", "AFM", "Auditing", "DT", "IDT", "IBS", "Law", "Cost"],
  "CA Intermediate":  ["Accounts", "Auditing", "Costing", "DT", "IDT", "Taxation", "Law", "FM", "SM", "FM-SM"],
  "CA Foundation":    ["Accounts", "Law", "Economics", "Maths"],
};

export default function AddFacultyForm() {
  const [form, setForm] = useState({
    faculty_name: "",
    level: "",
    subject: "",
    institution: "",
    course_url: "",
    notes: "",
    email: "",
  });
  const [submitting, setSubmitting]   = useState(false);
  const [done, setDone]               = useState(false);
  const [error, setError]             = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value, ...(k === "level" ? { subject: "" } : {}) }));

  const subjects = form.level ? SUBJECTS[form.level] ?? [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.faculty_name.trim()) { setError("Faculty name is required."); return; }

    const siteKey = process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY;
    if (siteKey && !captchaToken) { setError("Please complete the CAPTCHA."); return; }
    if (captchaToken) {
      const cv = await fetch("/api/verify-captcha", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken }),
      });
      if (!cv.ok) { setError("CAPTCHA verification failed. Please try again."); return; }
    }

    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/faculty-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full border border-slate-200 rounded-xl p-3 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-navy text-sm placeholder:text-ink/30";

  if (done) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-10 text-center">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-green-500" />
        </div>
        <h2 className="font-playfair text-2xl font-bold text-ink">Request submitted</h2>
        <p className="mt-2 text-ink/60 text-sm leading-relaxed max-w-xs mx-auto">
          We&apos;ll review your request and add the faculty as soon as possible. Thank you for helping grow the platform.
        </p>
        <a
          href="/"
          className="mt-6 inline-block bg-gold text-ink px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition"
        >
          Back to Home
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-playfair text-lg font-bold text-ink">Faculty Details</h2>

        <div>
          <label className="block mb-1.5 text-sm font-semibold text-ink">
            Faculty Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.faculty_name}
            onChange={set("faculty_name")}
            placeholder="e.g. CA Bhanwar Borana"
            className={inputClass}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-ink">Level</label>
            <select value={form.level} onChange={set("level")} className={inputClass}>
              <option value="">Select level</option>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-semibold text-ink">Subject</label>
            <select value={form.subject} onChange={set("subject")} className={inputClass} disabled={!form.level}>
              <option value="">Select subject</option>
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-semibold text-ink">Institute / Platform</label>
          <input
            type="text"
            value={form.institution}
            onChange={set("institution")}
            placeholder="e.g. ICAI, Unacademy, Self-taught"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-semibold text-ink">Course URL <span className="text-ink/40 font-normal">(optional)</span></label>
          <input
            type="url"
            value={form.course_url}
            onChange={set("course_url")}
            placeholder="https://…"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-semibold text-ink">Any other details <span className="text-ink/40 font-normal">(optional)</span></label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={set("notes")}
            placeholder="Anything useful for us to know…"
            className={inputClass}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-playfair text-lg font-bold text-ink mb-1">Notify me when added</h2>
        <p className="text-ink/45 text-xs mb-4">Optional — we&apos;ll send you a one-time email when this faculty is live.</p>
        <input
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="your@email.com"
          className={inputClass}
        />
      </div>

      <div className="pb-8">
        <p className="text-xs text-ink/40 mb-3">We review all requests manually. Most are added within a few days.</p>
        <div className="mb-4"><TurnstileWidget onSuccess={(t) => setCaptchaToken(t)} /></div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gold text-ink py-4 rounded-2xl font-semibold text-base hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit Request"}
        </button>
      </div>

    </form>
  );
}
