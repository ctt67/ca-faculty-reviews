"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Review, AnalyticsEvent } from "@/lib/types";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
const DAY = 86400000;
const LOOKBACK_DAYS = 30;

type Light = "green" | "yellow" | "red";

const LIGHT_DOT: Record<Light, string> = {
  green: "🟢",
  yellow: "🟡",
  red: "🔴",
};

function lightFor(value: number, greenAt: number, yellowAt: number, higherIsBetter = true): Light {
  if (higherIsBetter) {
    if (value >= greenAt) return "green";
    if (value >= yellowAt) return "yellow";
    return "red";
  }
  if (value <= greenAt) return "green";
  if (value <= yellowAt) return "yellow";
  return "red";
}

function pct(n: number, d: number): number {
  if (d === 0) return 0;
  return Math.round((n / d) * 1000) / 10;
}

function hostnameOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function Kpi({ label, value, sub, light }: { label: string; value: string; sub?: string; light?: Light }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        {light && <span className="text-sm leading-none">{LIGHT_DOT[light]}</span>}
      </div>
      <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function Bar({ label, value, max, suffix }: { label: string; value: number; max: number; suffix?: string }) {
  const width = max > 0 ? Math.max((value / max) * 100, value > 0 ? 2 : 0) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="text-slate-400">{value}{suffix ?? ""}</span>
      </div>
      <div className="bg-slate-100 rounded-full h-2">
        <div className="bg-slate-900 h-2 rounded-full" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {sub && <p className="text-xs text-slate-400 mt-0.5 mb-4">{sub}</p>}
      <div className={sub ? "" : "mt-4"}>{children}</div>
    </div>
  );
}

export default function InsightsClient() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [facultyCount, setFacultyCount] = useState(0);
  const [facultiesWithReviews, setFacultiesWithReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      setAuthorized(true);

      const since = new Date(Date.now() - LOOKBACK_DAYS * DAY).toISOString();

      const [{ data: reviewData }, { data: eventData }, { data: facultyData }] = await Promise.all([
        supabase.from("reviews").select("*").order("created_at", { ascending: false }),
        supabase
          .from("analytics_events")
          .select("*")
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(10000),
        supabase.from("faculties").select("slug").eq("active", true),
      ]);

      const allReviews = (reviewData ?? []) as unknown as Review[];
      setReviews(allReviews);
      setEvents((eventData ?? []) as unknown as AnalyticsEvent[]);
      setFacultyCount((facultyData ?? []).length);
      setFacultiesWithReviews(
        new Set(allReviews.filter((r) => r.approved).map((r) => r.faculty_slug))
      );
      setLoading(false);
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const approved = reviews.filter((r) => r.approved);
    const pending = reviews.filter((r) => !r.approved);

    const last7 = reviews.filter((r) => now - new Date(r.created_at).getTime() < 7 * DAY);
    const prev7 = reviews.filter((r) => {
      const t = now - new Date(r.created_at).getTime();
      return t >= 7 * DAY && t < 14 * DAY;
    });
    const weeklyGrowth = prev7.length === 0
      ? (last7.length > 0 ? 100 : 0)
      : pct(last7.length - prev7.length, prev7.length);

    const timed = reviews.filter((r) => r.time_taken_seconds != null);
    const avgTimeTaken = timed.length > 0
      ? Math.round(timed.reduce((s, r) => s + (r.time_taken_seconds ?? 0), 0) / timed.length)
      : 0;
    const suspiciouslyFast = timed.filter((r) => (r.time_taken_seconds ?? 0) < 60);
    const suspiciousRate = pct(suspiciouslyFast.length, timed.length);

    const publishedEvents = events.filter((e) => e.event_name === "review_published");
    const rejectedEvents = events.filter((e) => e.event_name === "review_rejected");
    const moderated = publishedEvents.length + rejectedEvents.length;
    const approvalRate = pct(publishedEvents.length, moderated);

    const coveragePct = pct(facultiesWithReviews.size, facultyCount);

    const eventCounts = (name: string) => {
      const sessions = new Set(
        events.filter((e) => e.event_name === name).map((e) => e.session_id ?? Math.random())
      );
      return sessions.size;
    };

    const funnel = [
      { step: "Faculty page viewed", count: eventCounts("faculty_page_viewed") },
      { step: "Write review clicked", count: eventCounts("write_review_clicked") },
      { step: "Review started", count: eventCounts("review_started") },
      { step: "Review submitted", count: eventCounts("review_submitted") },
      { step: "Review published", count: eventCounts("review_published") },
    ];

    const utmCounts = new Map<string, number>();
    for (const e of events) {
      const src = e.utm_source ?? "(direct / none)";
      utmCounts.set(src, (utmCounts.get(src) ?? 0) + 1);
    }
    const utmBreakdown = [...utmCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

    const referrerCounts = new Map<string, number>();
    for (const e of events) {
      const host = hostnameOf(e.referrer);
      if (!host) continue;
      referrerCounts.set(host, (referrerCounts.get(host) ?? 0) + 1);
    }
    const referrerBreakdown = [...referrerCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

    const deviceCounts = new Map<string, number>();
    for (const e of events) {
      const d = e.device_type ?? "unknown";
      deviceCounts.set(d, (deviceCounts.get(d) ?? 0) + 1);
    }

    const shareCounts = new Map<string, number>();
    for (const e of events) {
      if (e.event_name !== "share_clicked") continue;
      const src = (e.properties?.share_source as string) ?? "unknown";
      shareCounts.set(src, (shareCounts.get(src) ?? 0) + 1);
    }
    const whatsappAttributedReviews = reviews.filter((r) => r.utm_source === "whatsapp_share").length;

    const timeBuckets = [
      { label: "< 30s", test: (s: number) => s < 30 },
      { label: "30s – 1m", test: (s: number) => s >= 30 && s < 60 },
      { label: "1m – 3m", test: (s: number) => s >= 60 && s < 180 },
      { label: "3m – 10m", test: (s: number) => s >= 180 && s < 600 },
      { label: "10m+", test: (s: number) => s >= 600 },
    ].map((b) => ({
      label: b.label,
      count: timed.filter((r) => b.test(r.time_taken_seconds ?? 0)).length,
    }));

    const coverageBuckets = [
      { label: "0 reviews", count: facultyCount - facultiesWithReviews.size },
      { label: "1 review", count: 0 },
      { label: "2–4 reviews", count: 0 },
      { label: "5–9 reviews", count: 0 },
      { label: "10+ reviews", count: 0 },
    ];
    const perFaculty = new Map<string, number>();
    for (const r of approved) {
      perFaculty.set(r.faculty_slug, (perFaculty.get(r.faculty_slug) ?? 0) + 1);
    }
    for (const n of perFaculty.values()) {
      if (n === 1) coverageBuckets[1].count++;
      else if (n <= 4) coverageBuckets[2].count++;
      else if (n <= 9) coverageBuckets[3].count++;
      else coverageBuckets[4].count++;
    }

    const recommendYes = reviews.filter((r) => r.would_recommend === true).length;
    const recommendNo = reviews.filter((r) => r.would_recommend === false).length;

    return {
      totalApproved: approved.length,
      totalPending: pending.length,
      last7: last7.length,
      prev7: prev7.length,
      weeklyGrowth,
      avgTimeTaken,
      suspiciousFastCount: suspiciouslyFast.length,
      suspiciousRate,
      approvalRate,
      publishedCount: publishedEvents.length,
      rejectedCount: rejectedEvents.length,
      coveragePct,
      funnel,
      utmBreakdown,
      referrerBreakdown,
      deviceCounts: [...deviceCounts.entries()],
      shareCounts: [...shareCounts.entries()],
      whatsappAttributedReviews,
      timeBuckets,
      coverageBuckets,
      recommendYes,
      recommendNo,
    };
  }, [reviews, events, facultyCount, facultiesWithReviews]);

  if (loading) {
    return <main className="p-10 text-slate-500">Loading…</main>;
  }

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

  const funnelMax = Math.max(...stats.funnel.map((f) => f.count), 1);
  const timeBucketMax = Math.max(...stats.timeBuckets.map((b) => b.count), 1);
  const coverageMax = Math.max(...stats.coverageBuckets.map((b) => b.count), 1);
  const utmMax = Math.max(...stats.utmBreakdown.map(([, c]) => c), 1);
  const referrerMax = Math.max(...stats.referrerBreakdown.map(([, c]) => c), 1);

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-extrabold">Founder Dashboard</h1>
          <p className="mt-4 text-slate-300">
            North star metrics, funnel health and spam signals. Internal only — not for public reporting.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 space-y-8">

        {/* KPI traffic-light panel */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi
            label="Published Reviews"
            value={String(stats.totalApproved)}
            sub={`${stats.totalPending} pending moderation`}
          />
          <Kpi
            label="Weekly Growth"
            value={`${stats.weeklyGrowth > 0 ? "+" : ""}${stats.weeklyGrowth}%`}
            sub={`${stats.last7} this week vs ${stats.prev7} last week`}
            light={lightFor(stats.weeklyGrowth, 5, -10)}
          />
          <Kpi
            label="Approval Rate"
            value={`${stats.approvalRate}%`}
            sub={`${stats.publishedCount} published / ${stats.rejectedCount} rejected (${LOOKBACK_DAYS}d)`}
            light={lightFor(stats.approvalRate, 80, 50)}
          />
          <Kpi
            label="Faculty Coverage"
            value={`${stats.coveragePct}%`}
            sub={`${facultiesWithReviews.size} of ${facultyCount} faculties reviewed`}
            light={lightFor(stats.coveragePct, 50, 25)}
          />
          <Kpi
            label="Avg. Time to Review"
            value={stats.avgTimeTaken > 0 ? `${Math.round(stats.avgTimeTaken / 60)}m ${stats.avgTimeTaken % 60}s` : "—"}
            sub="From first interaction to submit"
          />
          <Kpi
            label="Suspiciously Fast Reviews"
            value={`${stats.suspiciousRate}%`}
            sub={`${stats.suspiciousFastCount} submitted in under 60s`}
            light={lightFor(stats.suspiciousRate, 5, 15, false)}
          />
          <Kpi
            label="Would Recommend"
            value={pct(stats.recommendYes, stats.recommendYes + stats.recommendNo) + "%"}
            sub={`${stats.recommendYes} yes / ${stats.recommendNo} no`}
          />
          <Kpi
            label="WhatsApp-Attributed Reviews"
            value={String(stats.whatsappAttributedReviews)}
            sub="Submitted via a shared review link"
          />
        </div>

        {/* Funnel */}
        <Section title="Conversion Funnel" sub={`Unique sessions per step, last ${LOOKBACK_DAYS} days`}>
          <div className="space-y-3">
            {stats.funnel.map((f, i) => {
              const prevCount = i > 0 ? stats.funnel[i - 1].count : null;
              const conv = prevCount ? pct(f.count, prevCount) : null;
              return (
                <div key={f.step}>
                  <Bar label={f.step} value={f.count} max={funnelMax} />
                  {conv !== null && (
                    <p className="text-[10px] text-slate-400 mt-0.5">{conv}% of previous step</p>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Acquisition */}
          <Section title="Acquisition" sub="Top utm_source values across all tracked events">
            <div className="space-y-2.5">
              {stats.utmBreakdown.length === 0 ? (
                <p className="text-sm text-slate-400">No data yet.</p>
              ) : (
                stats.utmBreakdown.map(([src, count]) => (
                  <Bar key={src} label={src} value={count} max={utmMax} />
                ))
              )}
            </div>
          </Section>

          {/* Referrers */}
          <Section title="Top Referrers" sub="External sites sending traffic">
            <div className="space-y-2.5">
              {stats.referrerBreakdown.length === 0 ? (
                <p className="text-sm text-slate-400">No external referrers yet.</p>
              ) : (
                stats.referrerBreakdown.map(([host, count]) => (
                  <Bar key={host} label={host} value={count} max={referrerMax} />
                ))
              )}
            </div>
          </Section>

          {/* Device split */}
          <Section title="Device Split">
            <div className="space-y-2.5">
              {stats.deviceCounts.map(([device, count]) => (
                <Bar
                  key={device}
                  label={device}
                  value={count}
                  max={Math.max(...stats.deviceCounts.map(([, c]) => c), 1)}
                />
              ))}
            </div>
          </Section>

          {/* Share funnel */}
          <Section title="Share Activity" sub={`share_clicked events, last ${LOOKBACK_DAYS} days`}>
            <div className="space-y-2.5">
              {stats.shareCounts.length === 0 ? (
                <p className="text-sm text-slate-400">No shares yet.</p>
              ) : (
                stats.shareCounts.map(([src, count]) => (
                  <Bar
                    key={src}
                    label={src}
                    value={count}
                    max={Math.max(...stats.shareCounts.map(([, c]) => c), 1)}
                  />
                ))
              )}
            </div>
          </Section>
        </div>

        {/* Review quality / spam */}
        <Section title="Review Quality & Spam Signal" sub="Time taken to fill the review form — fast outliers may indicate low-effort or bot submissions">
          <div className="space-y-2.5">
            {stats.timeBuckets.map((b) => (
              <Bar key={b.label} label={b.label} value={b.count} max={timeBucketMax} />
            ))}
          </div>
        </Section>

        {/* Faculty coverage */}
        <Section title="Faculty Coverage Distribution" sub="How many faculties have how many reviews">
          <div className="space-y-2.5">
            {stats.coverageBuckets.map((b) => (
              <Bar key={b.label} label={b.label} value={b.count} max={coverageMax} />
            ))}
          </div>
        </Section>

      </section>
    </main>
  );
}
