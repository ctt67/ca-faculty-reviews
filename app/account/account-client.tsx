"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ratingFields } from "@/lib/rating-config";
import { formatSubjectName } from "@/lib/format";
import { LEVEL_LABELS } from "@/lib/config";
import { CheckCircle2, Clock, Star, BookOpen, Pencil, Calendar } from "lucide-react";
import EditReviewModal from "@/components/EditReviewModal";

type ReviewRow = {
  id: number;
  faculty_slug: string;
  faculty_name?: string;
  level?: string;
  subject?: string;
  created_at: string;
  updated_at?: string | null;
  approved: boolean;
  rejected?: boolean | null;
  pros?: string;
  cons?: string;
  review_text?: string;
  course_type?: string;
  attempt?: string;
  would_recommend?: boolean | null;
  [key: string]: unknown;
};

function avgRating(review: ReviewRow): number {
  const vals = ratingFields.map((f) => Number(review[f.key])).filter((v) => v > 0);
  if (!vals.length) return 0;
  return Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
}

function ReviewCard({
  review,
  onEdit,
}: {
  review: ReviewRow;
  onEdit: (id: number) => void;
}) {
  const rating = avgRating(review);
  const date = new Date(review.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  const editedDate = review.updated_at
    ? new Date(review.updated_at).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      })
    : null;

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 sm:p-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <a
            href={`/faculty/${review.faculty_slug}`}
            className="font-playfair text-lg font-bold text-ink hover:text-navy transition leading-tight"
          >
            {review.faculty_name}
          </a>
          <p className="text-xs text-ink/45 mt-0.5">
            {LEVEL_LABELS[review.level ?? ""] ?? review.level}
            {review.subject ? ` · ${formatSubjectName(review.subject)}` : ""}
            {review.course_type ? ` · ${review.course_type}` : ""}
          </p>
        </div>

        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
          review.approved
            ? "bg-green-50 text-green-700"
            : review.rejected
            ? "bg-red-50 text-red-600"
            : "bg-amber-50 text-amber-700"
        }`}>
          {review.approved ? "✓ Published" : review.rejected ? "✗ Needs changes" : "⏳ Pending Review"}
        </span>
      </div>

      {!review.approved && review.rejected && (
        <p className="text-xs text-red-500/80 mt-2 leading-relaxed">
          This review didn&apos;t pass moderation — usually a{" "}
          <a href="/guidelines" className="underline underline-offset-2 hover:text-red-600">Review Guidelines</a>{" "}
          issue (personal remarks, unverifiable claims, or identifying details). Edit it below and it&apos;ll be reviewed again.
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        {rating > 0 && (
          <span className="flex items-center gap-1">
            <Star size={12} className="text-gold fill-gold" />
            <span className="text-sm font-bold text-ink">{rating}</span>
          </span>
        )}
        <span className="text-xs text-ink/40 flex items-center gap-1">
          <Calendar size={11} />
          {date}
        </span>
        {editedDate && (
          <span className="text-xs text-ink/35 italic">edited {editedDate}</span>
        )}
        {review.would_recommend !== undefined && review.would_recommend !== null && (
          <span className="text-xs text-ink/45">
            {review.would_recommend ? "👍 Recommended" : "👎 Not recommended"}
          </span>
        )}
      </div>

      {/* Preview */}
      {review.pros && (
        <p className="mt-3 text-sm text-ink/70 leading-relaxed line-clamp-2">
          <span className="font-semibold text-green-600 mr-1">+</span>
          {review.pros}
        </p>
      )}
      {review.cons && (
        <p className="mt-1 text-sm text-ink/70 leading-relaxed line-clamp-1">
          <span className="font-semibold text-red-500 mr-1">−</span>
          {review.cons}
        </p>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="text-xs text-ink/35">{review.attempt}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onEdit(review.id)}
            className="flex items-center gap-1 text-xs font-semibold text-ink/50 hover:text-navy transition"
          >
            <Pencil size={11} />
            Edit
          </button>
          <a
            href={`/faculty/${review.faculty_slug}`}
            className="text-xs font-semibold text-navy hover:underline"
          >
            View Faculty →
          </a>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-baseline gap-2 pt-2 pb-1">
      <h2 className="font-playfair text-lg font-bold text-ink">{title}</h2>
      <span className="text-ink/35 text-sm">{count}</span>
    </div>
  );
}

export default function AccountClient() {
  const [user, setUser] = useState<{ id: string; email?: string; created_at?: string } | null | undefined>(undefined);
  const [reviews, setReviews]     = useState<ReviewRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) window.location.href = `/login?next=/account`;
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { window.location.href = `/login?next=/account`; return; }
      setUser(u);

      const { data: rows } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false });

      if (!rows?.length) { setLoading(false); return; }

      const slugs = [...new Set(rows.map((r) => r.faculty_slug as string))];
      const { data: faculties } = await supabase
        .from("faculties")
        .select("slug, faculty_name, level, subject")
        .in("slug", slugs);

      const fMap = new Map((faculties ?? []).map((f) => [f.slug, f]));
      setReviews(rows.map((r) => ({
        ...r,
        faculty_name: fMap.get(r.faculty_slug)?.faculty_name ?? r.faculty_slug,
        level:        fMap.get(r.faculty_slug)?.level ?? "",
        subject:      fMap.get(r.faculty_slug)?.subject ?? "",
      })));
      setLoading(false);
    };
    init();
  }, []);

  if (user === undefined || loading) {
    return (
      <main className="min-h-screen bg-parchment flex items-center justify-center">
        <p className="text-ink/40 text-sm">Loading…</p>
      </main>
    );
  }

  const added   = reviews.filter((r) => !r.updated_at);
  const edited  = reviews.filter((r) => !!r.updated_at);
  const published = reviews.filter((r) => r.approved);

  const joinDate = user?.created_at ? new Date(user.created_at) : null;
  const isEarlyContributor = joinDate ? joinDate < new Date("2025-10-01T00:00:00Z") : false;

  const handleSaved = (id: number) => (updated: Partial<ReviewRow> & { approved: boolean; updated_at: string }) => {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, ...updated } : r));
  };

  return (
    <main className="min-h-screen bg-parchment">

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-playfair text-3xl font-bold text-white">My Contributions</h1>
              <p className="mt-1.5 text-white/55 text-sm">{user?.email}</p>
              {joinDate && (
                <p className="text-white/35 text-xs mt-1">
                  Member since {joinDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </p>
              )}
            </div>
            {isEarlyContributor && (
              <span className="shrink-0 bg-gold/15 text-gold text-xs font-semibold px-3 py-1.5 rounded-full border border-gold/25">
                ⭐ Early Contributor
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-4 gap-3">
            {[
              { label: "Total",     value: reviews.length,   Icon: BookOpen     },
              { label: "Published", value: published.length, Icon: CheckCircle2 },
              { label: "Added",     value: added.length,     Icon: Clock        },
              { label: "Edited",    value: edited.length,    Icon: Pencil       },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="bg-white/10 rounded-xl px-3 py-3">
                <Icon size={13} className="text-white/45 mb-1.5" />
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-white/45 text-[11px] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-10 text-center">
            <p className="font-playfair text-xl font-bold text-ink mb-2">No reviews yet</p>
            <p className="text-ink/50 text-sm mb-6 max-w-xs mx-auto">
              Share your genuine experience to help future CA students make better coaching decisions.
            </p>
            <a href="/" className="inline-block bg-gold text-ink px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition">
              Browse Faculties →
            </a>
          </div>
        ) : (
          <div className="space-y-8">

            {added.length > 0 && (
              <div className="space-y-4">
                <SectionHeader title="Added" count={added.length} />
                {added.map((r) => (
                  <ReviewCard key={r.id} review={r} onEdit={setEditingId} />
                ))}
              </div>
            )}

            {edited.length > 0 && (
              <div className="space-y-4">
                <SectionHeader title="Edited" count={edited.length} />
                {edited.map((r) => (
                  <ReviewCard key={r.id} review={r} onEdit={setEditingId} />
                ))}
              </div>
            )}

          </div>
        )}
      </section>

      {editingId !== null && (() => {
        const review = reviews.find((r) => r.id === editingId);
        if (!review) return null;
        return (
          <EditReviewModal
            review={review}
            facultyName={review.faculty_name ?? review.faculty_slug}
            onClose={() => setEditingId(null)}
            onSaved={handleSaved(editingId)}
          />
        );
      })()}

    </main>
  );
}
