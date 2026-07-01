"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ratingFields } from "@/lib/rating-config";
import { track } from "@/lib/track";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

// ── Spam scoring ──────────────────────────────────────────────────────────────

type VoteRow = { review_id: number; ip_hash: string | null; user_agent_hash: string | null };

interface SpamSignals {
  score: number;
  level: "clean" | "watch" | "suspicious" | "flag";
  timeTaken: number | null;
  browser: string | null;
  device: string | null;
  ipTag: string | null;     // last 8 chars of submission ip_hash
  reports: number;
  totalVotes: number;
  uniqueVoteIps: number;
  uniqueVoteUas: number;
  maxIpConc: number;        // fraction 0–1
  maxUaConc: number;
}

function computeSpam(
  review: Record<string, unknown>,
  votes: VoteRow[],
  reports: number,
): SpamSignals {
  let score = 0;

  const timeTaken = (review.time_taken_seconds as number | null) ?? null;
  if (timeTaken !== null) {
    if (timeTaken < 45)       score += 35;
    else if (timeTaken < 120) score += 20;
    else if (timeTaken < 300) score += 8;
  }

  score += Math.min(reports * 15, 45);

  const ipCounts  = new Map<string, number>();
  const uaCounts  = new Map<string, number>();
  for (const v of votes) {
    if (v.ip_hash)         ipCounts.set(v.ip_hash,         (ipCounts.get(v.ip_hash)         ?? 0) + 1);
    if (v.user_agent_hash) uaCounts.set(v.user_agent_hash, (uaCounts.get(v.user_agent_hash) ?? 0) + 1);
  }
  const maxIpCount = votes.length > 0 ? Math.max(...ipCounts.values(), 0) : 0;
  const maxUaCount = votes.length > 0 ? Math.max(...uaCounts.values(), 0) : 0;
  const maxIpConc  = votes.length > 0 ? maxIpCount / votes.length : 0;
  const maxUaConc  = votes.length > 0 ? maxUaCount / votes.length : 0;

  if (maxIpConc > 0.7)      score += 30;
  else if (maxIpConc > 0.5) score += 15;

  if (maxUaConc > 0.7)      score += 15;
  else if (maxUaConc > 0.5) score += 7;

  score = Math.min(score, 100);
  const level = score >= 70 ? "flag" : score >= 45 ? "suspicious" : score >= 20 ? "watch" : "clean";

  const ipHash = review.ip_hash as string | null;

  return {
    score,
    level,
    timeTaken,
    browser: (review.browser as string | null) ?? null,
    device:  (review.device_type as string | null) ?? null,
    ipTag:   ipHash ? ipHash.slice(-8) : null,
    reports,
    totalVotes:    votes.length,
    uniqueVoteIps: ipCounts.size,
    uniqueVoteUas: uaCounts.size,
    maxIpConc,
    maxUaConc,
  };
}

function formatTime(s: number | null) {
  if (s === null) return "—";
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

// ── Spam badge ────────────────────────────────────────────────────────────────

function SpamBadge({ level, score }: { level: SpamSignals["level"]; score: number }) {
  const cfg = {
    clean:      "bg-green-50 text-green-700 border-green-200",
    watch:      "bg-yellow-50 text-yellow-700 border-yellow-200",
    suspicious: "bg-orange-50 text-orange-700 border-orange-200",
    flag:       "bg-red-50 text-red-700 border-red-200",
  }[level];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg}`}>
      {level === "flag" ? "🚩" : level === "suspicious" ? "⚠️" : level === "watch" ? "👁" : "✓"} {score}
    </span>
  );
}

// ── Spam signals panel ────────────────────────────────────────────────────────

function SpamPanel({ signals }: { signals: SpamSignals }) {
  const [open, setOpen] = useState(false);

  const timeFlag = signals.timeTaken !== null && signals.timeTaken < 120;
  const ipVoteFlag  = signals.maxIpConc > 0.5;
  const uaVoteFlag  = signals.maxUaConc > 0.5;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Spam Signals</span>
          <SpamBadge level={signals.level} score={signals.score} />
        </div>
        <span className="text-slate-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-4 py-4 grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50/50">

          <Cell
            label="Time to submit"
            value={formatTime(signals.timeTaken)}
            flag={timeFlag}
            note={timeFlag ? "suspiciously fast" : undefined}
          />
          <Cell label="Browser"  value={signals.browser ?? "—"} />
          <Cell label="Device"   value={signals.device  ?? "—"} />
          <Cell
            label="Submission IP"
            value={signals.ipTag ? `···${signals.ipTag}` : "—"}
            note="match across reviews"
          />
          <Cell
            label="Reports"
            value={String(signals.reports)}
            flag={signals.reports > 0}
          />

          {signals.totalVotes > 0 ? (
            <>
              <Cell
                label="Vote IP diversity"
                value={`${signals.uniqueVoteIps} / ${signals.totalVotes}`}
                flag={ipVoteFlag}
                note={ipVoteFlag ? `${Math.round(signals.maxIpConc * 100)}% from 1 IP` : undefined}
              />
              <Cell
                label="Vote UA diversity"
                value={`${signals.uniqueVoteUas} / ${signals.totalVotes}`}
                flag={uaVoteFlag}
                note={uaVoteFlag ? `${Math.round(signals.maxUaConc * 100)}% from 1 UA` : undefined}
              />
            </>
          ) : (
            <Cell label="Votes" value="No votes yet" />
          )}

        </div>
      )}
    </div>
  );
}

function Cell({ label, value, flag, note }: { label: string; value: string; flag?: boolean; note?: string }) {
  return (
    <div className={`rounded-lg p-3 ${flag ? "bg-red-50 border border-red-100" : "bg-white border border-slate-100"}`}>
      <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${flag ? "text-red-500" : "text-slate-400"}`}>{label}</p>
      <p className={`text-sm font-semibold ${flag ? "text-red-700" : "text-slate-800"}`}>{value}</p>
      {note && <p className="text-[10px] text-slate-400 mt-0.5">{note}</p>}
    </div>
  );
}

// ── Main admin component ──────────────────────────────────────────────────────

export default function AdminClient() {
  const [loading, setLoading]           = useState(true);
  const [authorized, setAuthorized]     = useState(false);
  const [adminEmail, setAdminEmail]     = useState("");
  const [reviews, setReviews]           = useState<any[]>([]);
  const [spamMap, setSpamMap]           = useState<Map<number, SpamSignals>>(new Map());
  const [publishedReviews, setPublishedReviews]   = useState<any[]>([]);
  const [showPublished, setShowPublished]         = useState(false);
  const [loadingPublished, setLoadingPublished]   = useState(false);
  const [facultyRequests, setFacultyRequests]     = useState<any[]>([]);
  const [showRequests, setShowRequests]           = useState(false);
  const [loadingRequests, setLoadingRequests]     = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      setAuthorized(true);
      setAdminEmail(user.email ?? ADMIN_EMAIL);

      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("approved", false)
        .order("created_at", { ascending: false });

      const loaded = data ?? [];
      setReviews(loaded);

      if (loaded.length > 0) {
        const ids = loaded.map((r: any) => r.id);

        const [{ data: voteRows }, { data: reportRows }] = await Promise.all([
          supabase.from("review_votes").select("review_id, ip_hash, user_agent_hash").in("review_id", ids),
          supabase.from("review_reports").select("review_id").in("review_id", ids),
        ]);

        const votesBy  = new Map<number, VoteRow[]>();
        const reportsBy = new Map<number, number>();
        for (const v of voteRows  ?? []) { const a = votesBy.get(v.review_id)  ?? []; a.push(v);  votesBy.set(v.review_id, a); }
        for (const r of reportRows ?? []) reportsBy.set(r.review_id, (reportsBy.get(r.review_id) ?? 0) + 1);

        const map = new Map<number, SpamSignals>();
        for (const r of loaded) {
          map.set(r.id, computeSpam(r, votesBy.get(r.id) ?? [], reportsBy.get(r.id) ?? 0));
        }
        setSpamMap(map);
      }

      setLoading(false);
    };

    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load());
    return () => subscription.unsubscribe();
  }, []);

  const logAudit = (
    action: string,
    entityId: number,
    metadata?: Record<string, unknown>,
    entityType = "review",
  ) =>
    supabase.from("audit_logs").insert({
      action,
      entity_type: entityType,
      entity_id:   entityId,
      admin_email: adminEmail,
      metadata:    metadata ?? null,
    });

  const approveReview = async (reviewId: number) => {
    const review = reviews.find((r) => r.id === reviewId);
    await Promise.all([
      supabase.from("reviews").update({ approved: true }).eq("id", reviewId),
      logAudit("approve_review", reviewId, { faculty_slug: review?.faculty_slug }),
    ]);
    track("review_published", { review_id: reviewId, faculty_slug: review?.faculty_slug, time_taken_seconds: review?.time_taken_seconds });
    setReviews(reviews.filter((r) => r.id !== reviewId));
  };

  const rejectReview = async (reviewId: number) => {
    const review = reviews.find((r) => r.id === reviewId);
    await Promise.all([
      supabase.from("reviews").delete().eq("id", reviewId),
      logAudit("reject_review", reviewId, { faculty_slug: review?.faculty_slug }),
    ]);
    track("review_rejected", { review_id: reviewId, faculty_slug: review?.faculty_slug, time_taken_seconds: review?.time_taken_seconds });
    setReviews(reviews.filter((r) => r.id !== reviewId));
  };

  const loadPublished = async () => {
    if (publishedReviews.length > 0) { setShowPublished(true); return; }
    setLoadingPublished(true);
    const { data } = await supabase
      .from("reviews")
      .select("id, faculty_slug, pros, cons, created_at, attempt, course_type, would_recommend")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(50);
    setPublishedReviews(data ?? []);
    setShowPublished(true);
    setLoadingPublished(false);
  };

  const hideReview = async (reviewId: number) => {
    const review = publishedReviews.find((r) => r.id === reviewId);
    await Promise.all([
      supabase.from("reviews").update({ approved: false }).eq("id", reviewId),
      logAudit("hide_review", reviewId, { faculty_slug: review?.faculty_slug }),
    ]);
    setPublishedReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const loadFacultyRequests = async () => {
    if (facultyRequests.length > 0) { setShowRequests(true); return; }
    setLoadingRequests(true);
    const { data } = await supabase
      .from("faculty_requests")
      .select("id, faculty_name, level, subject, institution, notes, requester_email, created_at, status")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setFacultyRequests(data ?? []);
    setShowRequests(true);
    setLoadingRequests(false);
  };

  const markRequestDone = async (reqId: number) => {
    const req = facultyRequests.find((r) => r.id === reqId);
    await Promise.all([
      supabase.from("faculty_requests").update({ status: "done" }).eq("id", reqId),
      logAudit("faculty_request_done", reqId, { faculty_name: req?.faculty_name }, "faculty_request"),
    ]);
    setFacultyRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  const dismissRequest = async (reqId: number) => {
    const req = facultyRequests.find((r) => r.id === reqId);
    await Promise.all([
      supabase.from("faculty_requests").update({ status: "dismissed" }).eq("id", reqId),
      logAudit("faculty_request_dismissed", reqId, { faculty_name: req?.faculty_name }, "faculty_request"),
    ]);
    setFacultyRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  if (loading) return <main className="p-10 text-slate-500">Loading...</main>;

  if (!authorized) {
    return (
      <main className="min-h-screen bg-slate-100">
        <section className="bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <h1 className="text-5xl font-extrabold">Access Denied</h1>
            <p className="mt-4 text-slate-300">This page is only available to administrators.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">

      <section className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-5xl font-extrabold">Pending Reviews</h1>
              <p className="mt-4 text-slate-300">
                {reviews.length} review{reviews.length !== 1 ? "s" : ""} awaiting moderation.
              </p>
            </div>
            <a href="/admin/insights" className="shrink-0 border border-white/25 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition">
              View Insights →
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12">

        {reviews.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <h2 className="text-2xl font-bold text-slate-900">All caught up!</h2>
            <p className="text-slate-500 mt-2">No pending reviews.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => {
              const signals = spamMap.get(review.id);
              return (
                <div key={review.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">

                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <a href={`/faculty/${review.faculty_slug}`} className="text-xl font-bold text-blue-600 hover:underline">
                        {review.faculty_slug}
                      </a>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {review.teacher_style && <span className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs font-medium">{review.teacher_style}</span>}
                        {review.student_type  && <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-1 text-xs font-medium">{review.student_type}</span>}
                        {review.attempt       && <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-1 text-xs font-medium">{review.attempt}</span>}
                        {review.course_type   && <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-1 text-xs font-medium">{review.course_type}</span>}
                        {review.would_recommend !== null && review.would_recommend !== undefined && (
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${review.would_recommend ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                            {review.would_recommend ? "✓ Recommended" : "✗ Not Recommended"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-xs text-slate-400">{new Date(review.created_at).toLocaleString("en-IN")}</div>
                      {signals && <SpamBadge level={signals.level} score={signals.score} />}
                    </div>
                  </div>

                  {/* Ratings grid */}
                  <div className="mb-5">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Ratings</div>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {ratingFields.map((field) =>
                        review[field.key] != null ? (
                          <div key={field.key} className="bg-slate-50 rounded-xl p-3 text-center">
                            <div className="text-lg font-bold text-slate-900">{review[field.key]}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{field.label}</div>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>

                  {/* Best for */}
                  {review.best_for?.length > 0 && (
                    <p className="text-sm text-slate-600 mb-4">
                      <span className="font-semibold text-slate-800">Best For:</span>{" "}
                      {review.best_for.join(", ")}
                    </p>
                  )}

                  {/* Pros / Cons */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {review.pros && (
                      <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-green-700 mb-1">PROS</p>
                        <p className="text-slate-700 text-sm">{review.pros}</p>
                      </div>
                    )}
                    {review.cons && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-red-600 mb-1">CONS</p>
                        <p className="text-slate-700 text-sm">{review.cons}</p>
                      </div>
                    )}
                  </div>

                  {/* Review text */}
                  {review.review_text && (
                    <div className="bg-slate-50 rounded-xl p-4 mb-5">
                      <p className="text-xs font-semibold text-slate-500 mb-2">REVIEW</p>
                      <p className="text-slate-800 text-sm leading-relaxed">{review.review_text}</p>
                    </div>
                  )}

                  {/* Spam signals */}
                  {signals && (
                    <div className="mb-5">
                      <SpamPanel signals={signals} />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2 border-t border-slate-100">
                    <button onClick={() => approveReview(review.id)} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition">
                      Approve
                    </button>
                    <button onClick={() => rejectReview(review.id)} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition">
                      Reject
                    </button>
                    <a href={`/faculty/${review.faculty_slug}`} target="_blank" className="text-slate-500 hover:text-slate-900 px-5 py-2.5 rounded-xl text-sm transition border border-slate-200 hover:border-slate-400">
                      View Faculty
                    </a>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Faculty Requests */}
        <div className="mt-10">
          <button
            onClick={() => showRequests ? setShowRequests(false) : loadFacultyRequests()}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            {loadingRequests ? "Loading…" : showRequests ? "▲ Hide Faculty Requests" : "▼ Show Faculty Requests"}
          </button>

          {showRequests && (
            <div className="space-y-4 mt-5">
              {facultyRequests.length === 0 && (
                <p className="text-slate-400 text-sm">No pending faculty requests.</p>
              )}
              {facultyRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 text-base">{req.faculty_name}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {req.level   && <span className="bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 text-xs font-medium">{req.level}</span>}
                        {req.subject && <span className="bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5 text-xs font-medium">{req.subject}</span>}
                        {req.institution && <span className="bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5 text-xs font-medium">{req.institution}</span>}
                      </div>
                      {req.notes && (
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{req.notes}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {req.requester_email && (
                          <p className="text-xs text-slate-400">{req.requester_email}</p>
                        )}
                        <p className="text-xs text-slate-400">{new Date(req.created_at).toLocaleDateString("en-IN")}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => markRequestDone(req.id)}
                        className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition whitespace-nowrap"
                      >
                        Mark Added
                      </button>
                      <button
                        onClick={() => dismissRequest(req.id)}
                        className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Published Reviews */}
        <div className="mt-10">
          <button
            onClick={() => showPublished ? setShowPublished(false) : loadPublished()}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            {loadingPublished ? "Loading…" : showPublished ? "▲ Hide Published Reviews" : "▼ Show Published Reviews (hide/unpublish)"}
          </button>

          {showPublished && (
            <div className="space-y-4 mt-5">
              {publishedReviews.length === 0 && (
                <p className="text-slate-400 text-sm">No published reviews.</p>
              )}
              {publishedReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <a
                      href={`/faculty/${review.faculty_slug}`}
                      target="_blank"
                      className="font-semibold text-slate-900 text-sm hover:underline"
                    >
                      {review.faculty_slug}
                    </a>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {review.attempt} · {review.course_type} · {new Date(review.created_at).toLocaleDateString("en-IN")}
                    </p>
                    {review.pros && (
                      <p className="text-xs text-slate-600 mt-2 line-clamp-1">+ {review.pros}</p>
                    )}
                  </div>
                  <button
                    onClick={() => hideReview(review.id)}
                    className="shrink-0 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition"
                  >
                    Hide
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>
    </main>
  );
}
