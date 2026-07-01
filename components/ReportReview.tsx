"use client";

import { useState } from "react";
import { Flag } from "lucide-react";

const REASONS = [
  { value: "fake",          label: "Fake review" },
  { value: "abuse",         label: "Abusive language" },
  { value: "wrong_faculty", label: "Wrong faculty" },
  { value: "spam",          label: "Spam / promotional" },
  { value: "other",         label: "Other" },
];

function getSessionToken(): string {
  let token = localStorage.getItem("cv_session_token");
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("cv_session_token", token);
  }
  return token;
}

export default function ReportReview({ reviewId }: { reviewId: string | number }) {
  const [open, setOpen]         = useState(false);
  const [reason, setReason]     = useState("");
  const [details, setDetails]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]         = useState(false);

  const close = () => {
    setOpen(false);
    setTimeout(() => { setDone(false); setReason(""); setDetails(""); }, 300);
  };

  const submit = async () => {
    if (!reason || submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_id: reviewId,
          reason,
          details: details.trim() || null,
          session_token: getSessionToken(),
        }),
      });
      setDone(true);
      setTimeout(close, 1800);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[11px] text-ink/30 hover:text-ink/55 transition flex items-center gap-1"
      >
        <Flag size={11} />
        Report
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-500 text-xl">✓</span>
                </div>
                <p className="font-semibold text-ink">Report submitted</p>
                <p className="text-sm text-ink/50 mt-1 leading-relaxed">Thanks for helping keep Careviews accurate.</p>
              </div>
            ) : (
              <>
                <h3 className="font-playfair font-bold text-ink text-lg mb-4">Report this review</h3>
                <div className="space-y-2 mb-4">
                  {REASONS.map((r) => (
                    <label
                      key={r.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        reason === r.value
                          ? "border-navy bg-navy/5"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                        className="accent-navy"
                      />
                      <span className="text-sm text-ink">{r.label}</span>
                    </label>
                  ))}
                </div>

                {(reason === "other" || reason === "abuse") && (
                  <textarea
                    rows={2}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Describe the issue…"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-navy mb-4 placeholder:text-ink/30"
                  />
                )}

                <div className="flex gap-2">
                  <button
                    onClick={close}
                    className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm font-medium text-ink/60 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submit}
                    disabled={!reason || submitting}
                    className="flex-1 bg-navy text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-40"
                  >
                    {submitting ? "Submitting…" : "Submit"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
