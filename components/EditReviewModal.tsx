"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ratingFields } from "@/lib/rating-config";

type ReviewRow = {
  id: number;
  pros?: string;
  cons?: string;
  review_text?: string;
  would_recommend?: boolean | null;
  [key: string]: unknown;
};

const RATING_LABELS: Record<number, string> = {
  1: "Very Poor", 2: "Poor", 3: "Average", 4: "Good", 5: "Excellent",
};

const textareaCls =
  "w-full border border-slate-200 rounded-xl p-3 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy placeholder:text-ink/30 resize-none";

export default function EditReviewModal({
  review,
  facultyName,
  onClose,
  onSaved,
}: {
  review: ReviewRow;
  facultyName: string;
  onClose: () => void;
  onSaved: (updated: Partial<ReviewRow> & { approved: boolean; updated_at: string }) => void;
}) {
  const [pros, setPros]               = useState(review.pros         ?? "");
  const [cons, setCons]               = useState(review.cons         ?? "");
  const [reviewText, setReviewText]   = useState((review.review_text as string) ?? "");
  const [wouldRec, setWouldRec]       = useState<boolean | null>(
    review.would_recommend != null ? Boolean(review.would_recommend) : null,
  );
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const r: Record<string, number> = {};
    for (const f of ratingFields) {
      const v = Number(review[f.key]);
      if (v >= 1 && v <= 5) r[f.key] = v;
    }
    return r;
  });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError("Not logged in."); return; }

      const res = await fetch("/api/edit-review", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          review_id:       review.id,
          pros,
          cons,
          review_text:     reviewText,
          would_recommend: wouldRec,
          ...ratings,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Failed to save. Try again.");
        return;
      }

      const now = new Date().toISOString();
      onSaved({ pros, cons, review_text: reviewText, would_recommend: wouldRec, ...ratings, approved: false, updated_at: now });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xl shadow-xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="font-playfair font-bold text-ink text-lg">Edit Review</h2>
            <p className="text-xs text-ink/45 mt-0.5">{facultyName}</p>
          </div>
          <button onClick={onClose} className="text-ink/40 hover:text-ink transition p-1">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">

          {/* Pros */}
          <div>
            <label className="block text-xs font-semibold text-ink/60 mb-1.5">Pros</label>
            <textarea
              rows={3}
              value={pros}
              onChange={(e) => setPros(e.target.value)}
              placeholder="What worked well for you?"
              className={textareaCls}
            />
          </div>

          {/* Cons */}
          <div>
            <label className="block text-xs font-semibold text-ink/60 mb-1.5">Cons</label>
            <textarea
              rows={3}
              value={cons}
              onChange={(e) => setCons(e.target.value)}
              placeholder="What could be better?"
              className={textareaCls}
            />
          </div>

          {/* Review text */}
          <div>
            <label className="block text-xs font-semibold text-ink/60 mb-1.5">Overall Review</label>
            <textarea
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience in your own words…"
              className={textareaCls}
            />
          </div>

          {/* Would recommend */}
          <div>
            <label className="block text-xs font-semibold text-ink/60 mb-2">Would you recommend?</label>
            <div className="flex gap-2">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => setWouldRec(wouldRec === val ? null : val)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium transition ${
                    wouldRec === val
                      ? val
                        ? "bg-green-50 border-green-300 text-green-700"
                        : "bg-red-50 border-red-300 text-red-600"
                      : "border-slate-200 text-ink/50 hover:bg-slate-50"
                  }`}
                >
                  {val ? "✓ Yes" : "✗ No"}
                </button>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <div>
            <label className="block text-xs font-semibold text-ink/60 mb-3">Ratings</label>
            <div className="space-y-4">
              {ratingFields.map((field) => (
                <div key={field.key}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <p className="text-sm font-medium text-ink">{field.label}</p>
                    {ratings[field.key] && (
                      <span className="text-xs text-navy font-semibold">
                        {ratings[field.key]} — {RATING_LABELS[ratings[field.key]]}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setRatings((prev) =>
                          prev[field.key] === val
                            ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== field.key))
                            : { ...prev, [field.key]: val }
                        )}
                        className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition ${
                          ratings[field.key] === val
                            ? "bg-navy text-white border-navy"
                            : ratings[field.key] > val
                            ? "bg-navy/10 text-navy border-navy/20"
                            : "border-slate-200 text-ink/40 hover:border-slate-300"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 shrink-0 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm font-medium text-ink/60 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 bg-navy text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
