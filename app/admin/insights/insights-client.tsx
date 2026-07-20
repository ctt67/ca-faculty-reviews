"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Review, AnalyticsEvent } from "@/lib/types";
import { classifySource, sourceLabel, hostnameOf, isInternalHost } from "@/lib/analytics-source";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
const DAY = 86400000;
const RANGE_OPTIONS = [7, 30, 90] as const;

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

function prop(e: AnalyticsEvent, key: string): string | null {
  const v = e.properties?.[key];
  return typeof v === "string" && v.length > 0 ? v : null;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
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

const SOURCE_CHIP_STYLE: Record<string, string> = {
  google:     "bg-blue-50 text-blue-700 border-blue-200",
  bing:       "bg-blue-50 text-blue-700 border-blue-200",
  duckduckgo: "bg-blue-50 text-blue-700 border-blue-200",
  instagram:  "bg-pink-50 text-pink-700 border-pink-200",
  ig:         "bg-pink-50 text-pink-700 border-pink-200",
  whatsapp:   "bg-green-50 text-green-700 border-green-200",
  whatsapp_share: "bg-green-50 text-green-700 border-green-200",
  telegram:   "bg-sky-50 text-sky-700 border-sky-200",
  reddit:     "bg-orange-50 text-orange-700 border-orange-200",
  youtube:    "bg-red-50 text-red-700 border-red-200",
  chatgpt:    "bg-teal-50 text-teal-700 border-teal-200",
  perplexity: "bg-teal-50 text-teal-700 border-teal-200",
  direct:     "bg-slate-100 text-slate-600 border-slate-200",
  internal:   "bg-slate-50 text-slate-400 border-slate-200",
};

function SourceChip({ source, title }: { source: string; title?: string }) {
  const style = SOURCE_CHIP_STYLE[source] ?? "bg-violet-50 text-violet-700 border-violet-200";
  return (
    <span
      title={title}
      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${style}`}
    >
      {sourceLabel(source)}
    </span>
  );
}

type ReviewAttribution = {
  source: string;
  campaign: string | null;
  landing: string | null;
  rawReferrer: string | null;
  via: "utm on review" | "session join" | "submit-event join" | "review row" | "unattributed";
};

export default function InsightsClient() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [rangeDays, setRangeDays] = useState<number>(30);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);          // windowed, all event types
  const [attrEvents, setAttrEvents] = useState<AnalyticsEvent[]>([]);  // all-time session_start + review_submitted
  const [facultyNames, setFacultyNames] = useState<Map<string, string>>(new Map());
  const [facultyCount, setFacultyCount] = useState(0);
  const [facultiesWithReviews, setFacultiesWithReviews] = useState<Set<string>>(new Set());
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) window.location.href = "/login";
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      setAuthorized(true);

      const [{ data: reviewData }, { data: facultyData }, { data: attrData }] = await Promise.all([
        supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(10000),
        supabase.from("faculties").select("slug, faculty_name, active"),
        supabase
          .from("analytics_events")
          .select("*")
          .in("event_name", ["session_start", "review_submitted"])
          .order("created_at", { ascending: false })
          .limit(10000),
      ]);

      const allReviews = (reviewData ?? []) as unknown as Review[];
      setReviews(allReviews);
      setAttrEvents((attrData ?? []) as unknown as AnalyticsEvent[]);

      const faculties = (facultyData ?? []) as { slug: string; faculty_name: string; active: boolean }[];
      setFacultyNames(new Map(faculties.map((f) => [f.slug, f.faculty_name])));
      setFacultyCount(faculties.filter((f) => f.active).length);
      setFacultiesWithReviews(
        new Set(allReviews.filter((r) => r.approved).map((r) => r.faculty_slug))
      );
      setLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    if (!authorized) return;
    const since = new Date(Date.now() - rangeDays * DAY).toISOString();
    supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10000)
      .then(({ data }) => setEvents((data ?? []) as unknown as AnalyticsEvent[]));
  }, [authorized, rangeDays]);

  // session_id → session_start events, oldest first, for point-in-time attribution
  const startsBySession = useMemo(() => {
    const map = new Map<string, AnalyticsEvent[]>();
    for (const e of attrEvents) {
      if (e.event_name !== "session_start" || !e.session_id) continue;
      const arr = map.get(e.session_id);
      if (arr) arr.push(e);
      else map.set(e.session_id, [e]);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    return map;
  }, [attrEvents]);

  // Latest session_start for a session at (or shortly after) a moment in time
  const startAt = (sessionId: string | null | undefined, atIso: string): AnalyticsEvent | null => {
    if (!sessionId) return null;
    const arr = startsBySession.get(sessionId);
    if (!arr || arr.length === 0) return null;
    const at = new Date(atIso).getTime() + 5 * 60000;
    let best: AnalyticsEvent | null = null;
    for (const s of arr) {
      if (new Date(s.created_at).getTime() <= at) best = s;
      else break;
    }
    return best ?? arr[0];
  };

  // Where each review came from: review row → submit event → session_start, first-touch first.
  const reviewAttribution = useMemo(() => {
    const subs = attrEvents.filter((e) => e.event_name === "review_submitted");
    const map = new Map<number, ReviewAttribution>();

    for (const r of reviews) {
      const t = new Date(r.created_at).getTime();

      let sub: AnalyticsEvent | null = null;
      let bestDt = 10 * 60000;
      for (const e of subs) {
        if (prop(e, "faculty_slug") !== r.faculty_slug) continue;
        const dt = Math.abs(new Date(e.created_at).getTime() - t);
        if (dt < bestDt) { bestDt = dt; sub = e; }
      }

      const sessionId = r.session_id ?? sub?.session_id ?? null;
      const start = startAt(sessionId, r.created_at);

      const utm = r.utm_source ?? sub?.utm_source ?? start?.utm_source ?? null;
      const ref =
        (sub ? prop(sub, "entry_referrer") : null) ??
        (start ? prop(start, "entry_referrer") : null) ??
        start?.referrer ??
        r.referrer ??
        null;
      const campaign =
        (sub ? prop(sub, "utm_campaign") : null) ??
        (start ? prop(start, "utm_campaign") : null);
      const landing = start ? prop(start, "landing") : null;

      const via: ReviewAttribution["via"] = r.utm_source
        ? "utm on review"
        : start
        ? "session join"
        : sub
        ? "submit-event join"
        : r.referrer
        ? "review row"
        : "unattributed";

      map.set(r.id, { source: classifySource(utm, ref), campaign, landing, rawReferrer: ref, via });
    }
    return map;
  }, [reviews, attrEvents, startsBySession]);

  const reviewSourceTotals = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of reviews) {
      const a = reviewAttribution.get(r.id);
      const src = a?.source ?? "direct";
      counts.set(src, (counts.get(src) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [reviews, reviewAttribution]);

  // Faculty page views by source (windowed): per slug, unique sessions per channel
  const facultyViewSources = useMemo(() => {
    const perFaculty = new Map<string, Map<string, Set<string>>>();
    const overall = new Map<string, Set<string>>();

    for (const e of events) {
      if (e.event_name !== "faculty_page_viewed") continue;
      const slug =
        prop(e, "faculty_slug") ??
        (e.path?.startsWith("/faculty/") ? e.path.slice("/faculty/".length) : null);
      if (!slug) continue;

      const start = startAt(e.session_id, e.created_at);
      const utm = e.utm_source ?? start?.utm_source ?? null;
      const ref =
        prop(e, "entry_referrer") ??
        (start ? prop(start, "entry_referrer") : null) ??
        start?.referrer ??
        e.referrer ??
        null;
      const src = classifySource(utm, ref);
      const sid = e.session_id ?? `evt-${e.id}`;

      if (!perFaculty.has(slug)) perFaculty.set(slug, new Map());
      const bySrc = perFaculty.get(slug)!;
      if (!bySrc.has(src)) bySrc.set(src, new Set());
      bySrc.get(src)!.add(sid);

      if (!overall.has(src)) overall.set(src, new Set());
      overall.get(src)!.add(sid);
    }

    const rows = [...perFaculty.entries()]
      .map(([slug, bySrc]) => {
        const sessions = new Set<string>();
        const breakdown = [...bySrc.entries()]
          .map(([src, sids]) => {
            for (const s of sids) sessions.add(s);
            return { src, count: sids.size };
          })
          .sort((a, b) => b.count - a.count);
        return { slug, total: sessions.size, breakdown };
      })
      .sort((a, b) => b.total - a.total);

    const overallRows = [...overall.entries()]
      .map(([src, sids]) => [src, sids.size] as const)
      .sort((a, b) => b[1] - a[1]);

    return { rows, overallRows };
  }, [events, startsBySession]);

  // Daily traffic: sessions and faculty views per day in the window
  const daily = useMemo(() => {
    const days: { key: string; label: string; sessions: Set<string>; views: number }[] = [];
    const index = new Map<string, number>();
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * DAY);
      const key = d.toLocaleDateString("en-CA");
      index.set(key, days.length);
      days.push({ key, label: fmtDate(d.toISOString()), sessions: new Set(), views: 0 });
    }
    for (const e of events) {
      const key = new Date(e.created_at).toLocaleDateString("en-CA");
      const i = index.get(key);
      if (i === undefined) continue;
      if (e.event_name === "session_start") days[i].sessions.add(e.session_id ?? `evt-${e.id}`);
      if (e.event_name === "faculty_page_viewed") days[i].views++;
    }
    return days.map((d) => ({ key: d.key, label: d.label, sessions: d.sessions.size, views: d.views }));
  }, [events, rangeDays]);

  const stats = useMemo(() => {
    const now = Date.now();
    const approved = reviews.filter((r) => r.approved);
    const pending = reviews.filter((r) => !r.approved && !r.rejected);

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

    // Published/approval come from the reviews table — publishing happens in
    // admin, so client-side events can never count it reliably.
    const inWindow = (r: Review) => now - new Date(r.created_at).getTime() < rangeDays * DAY;
    const publishedInWindow = reviews.filter((r) => r.approved && inWindow(r)).length;
    const rejectedInWindow  = reviews.filter((r) => r.rejected && inWindow(r)).length;
    const moderated = publishedInWindow + rejectedInWindow;
    const approvalRate = pct(publishedInWindow, moderated);

    const coveragePct = pct(facultiesWithReviews.size, facultyCount);

    const uniqueSessions = (filter: (e: AnalyticsEvent) => boolean) => {
      const sessions = new Set<string>();
      for (const e of events) {
        if (!filter(e)) continue;
        sessions.add(e.session_id ?? `evt-${e.id}`);
      }
      return sessions.size;
    };
    const eventCounts = (name: string) => uniqueSessions((e) => e.event_name === name);

    const totalSessions = eventCounts("session_start");
    const facultyViewSessions = eventCounts("faculty_page_viewed");

    const funnel = [
      { step: "Faculty page viewed", count: facultyViewSessions },
      { step: "Write review clicked", count: eventCounts("write_review_clicked") },
      { step: "Review started", count: eventCounts("review_started") },
      { step: "Review submitted", count: eventCounts("review_submitted") },
      { step: "Review published", count: publishedInWindow },
    ];

    // Acquisition: classified source per session (session_start events)
    const acqSessions = new Map<string, Set<string>>();
    for (const e of events) {
      if (e.event_name !== "session_start") continue;
      const src = classifySource(e.utm_source, prop(e, "entry_referrer") ?? e.referrer);
      const sid = e.session_id ?? `evt-${e.id}`;
      if (!acqSessions.has(src)) acqSessions.set(src, new Set());
      acqSessions.get(src)!.add(sid);
    }
    const acquisition = [...acqSessions.entries()]
      .map(([src, sids]) => [src, sids.size] as const)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Per-campaign depth (utm_campaign carried in event properties)
    const campaignAgg = new Map<string, { sessions: Set<string>; fac: Set<string>; clicks: Set<string> }>();
    for (const e of events) {
      const c = prop(e, "utm_campaign");
      if (!c) continue;
      if (!campaignAgg.has(c)) campaignAgg.set(c, { sessions: new Set(), fac: new Set(), clicks: new Set() });
      const g = campaignAgg.get(c)!;
      const sid = e.session_id ?? String(e.id);
      if (e.event_name === "session_start")        g.sessions.add(sid);
      if (e.event_name === "faculty_page_viewed")  g.fac.add(sid);
      if (e.event_name === "write_review_clicked") g.clicks.add(sid);
    }
    const campaignStats = [...campaignAgg.entries()]
      .map(([name, g]) => ({ name, sessions: g.sessions.size, facultyViews: g.fac.size, reviewClicks: g.clicks.size }))
      .sort((a, b) => b.sessions - a.sessions);

    // External referrers only, unique sessions (own-host reloads used to pollute this)
    const referrerSessions = new Map<string, Set<string>>();
    for (const e of events) {
      const host = hostnameOf(e.referrer);
      if (!host || isInternalHost(host)) continue;
      if (!referrerSessions.has(host)) referrerSessions.set(host, new Set());
      referrerSessions.get(host)!.add(e.session_id ?? `evt-${e.id}`);
    }
    const referrerBreakdown = [...referrerSessions.entries()]
      .map(([host, sids]) => [host, sids.size] as const)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const deviceSessions = new Map<string, Set<string>>();
    for (const e of events) {
      const d = e.device_type ?? "unknown";
      if (!deviceSessions.has(d)) deviceSessions.set(d, new Set());
      deviceSessions.get(d)!.add(e.session_id ?? `evt-${e.id}`);
    }
    const deviceCounts = [...deviceSessions.entries()]
      .map(([d, sids]) => [d, sids.size] as const)
      .sort((a, b) => b[1] - a[1]);

    const shareCounts = new Map<string, number>();
    for (const e of events) {
      if (e.event_name !== "share_clicked") continue;
      const src = prop(e, "share_source") ?? "unknown";
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

    // Search metrics
    const searchEvents = events.filter((e) => e.event_name === "search_performed");
    const totalSearches = searchEvents.length;
    const searchesWithResults = searchEvents.filter(
      (e) => ((e.properties?.results_count as number) ?? 0) > 0
    ).length;
    const searchNoResultRate = pct(totalSearches - searchesWithResults, totalSearches);

    const searchClickEvents = events.filter((e) => e.event_name === "search_result_clicked");
    const searchClickRate = pct(searchClickEvents.length, totalSearches);

    const topSearchQueries = (() => {
      const counts = new Map<string, number>();
      for (const e of searchEvents) {
        const q = (e.properties?.query as string)?.toLowerCase().trim();
        if (!q) continue;
        counts.set(q, (counts.get(q) ?? 0) + 1);
      }
      return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    })();

    const noResultQueries = (() => {
      const counts = new Map<string, number>();
      for (const e of searchEvents) {
        if (((e.properties?.results_count as number) ?? 1) > 0) continue;
        const q = (e.properties?.query as string)?.toLowerCase().trim();
        if (!q) continue;
        counts.set(q, (counts.get(q) ?? 0) + 1);
      }
      return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    })();

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
      publishedCount: publishedInWindow,
      rejectedCount: rejectedInWindow,
      coveragePct,
      totalSessions,
      facultyViewSessions,
      funnel,
      acquisition,
      campaignStats,
      referrerBreakdown,
      deviceCounts,
      shareCounts: [...shareCounts.entries()],
      whatsappAttributedReviews,
      timeBuckets,
      coverageBuckets,
      recommendYes,
      recommendNo,
      totalSearches,
      searchNoResultRate,
      searchClickRate,
      topSearchQueries,
      noResultQueries,
    };
  }, [reviews, events, facultyCount, facultiesWithReviews, rangeDays]);

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
  const acqMax = Math.max(...stats.acquisition.map(([, c]) => c), 1);
  const referrerMax = Math.max(...stats.referrerBreakdown.map(([, c]) => c), 1);
  const reviewSourceMax = Math.max(...reviewSourceTotals.map(([, c]) => c), 1);
  const dailyMax = Math.max(...daily.map((d) => Math.max(d.sessions, d.views)), 1);

  const facultyName = (slug: string) => facultyNames.get(slug) ?? slug;
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 30);

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-extrabold">Founder Dashboard</h1>
          <p className="mt-4 text-slate-300">
            North star metrics, source attribution, funnel health and spam signals. Internal only.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 space-y-8">

        {/* Range toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1">Window</span>
          {RANGE_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setRangeDays(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                rangeDays === d
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              {d}d
            </button>
          ))}
          <span className="text-xs text-slate-400 ml-2">applies to traffic, funnel and search sections</span>
        </div>

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
            label="Sessions"
            value={String(stats.totalSessions)}
            sub={`last ${rangeDays} days`}
          />
          <Kpi
            label="Faculty Page Sessions"
            value={String(stats.facultyViewSessions)}
            sub={`${pct(stats.facultyViewSessions, stats.totalSessions)}% of sessions reach a faculty page`}
          />
          <Kpi
            label="Approval Rate"
            value={`${stats.approvalRate}%`}
            sub={`${stats.publishedCount} published / ${stats.rejectedCount} rejected (${rangeDays}d)`}
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
        </div>

        {/* Daily traffic */}
        <Section title="Daily Traffic" sub={`Sessions (dark) and faculty page views (gold) per day, last ${rangeDays} days`}>
          <div className="flex items-end gap-[2px] h-28">
            {daily.map((d) => (
              <div
                key={d.key}
                className="flex-1 flex items-end justify-center gap-[1px] group relative"
                title={`${d.label}: ${d.sessions} sessions, ${d.views} faculty views`}
              >
                <div
                  className="w-1/2 max-w-[10px] bg-slate-900 rounded-t"
                  style={{ height: `${Math.max((d.sessions / dailyMax) * 100, d.sessions > 0 ? 4 : 1)}%` }}
                />
                <div
                  className="w-1/2 max-w-[10px] bg-amber-400 rounded-t"
                  style={{ height: `${Math.max((d.views / dailyMax) * 100, d.views > 0 ? 4 : 1)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>{daily[0]?.label}</span>
            <span>{daily[daily.length - 1]?.label}</span>
          </div>
        </Section>

        {/* Review sources — every review, attributed */}
        <Section
          title="Review Sources"
          sub="Where every review came from. Attribution order: UTM stored on the review → the submitter's session entry point → the review row's referrer. Hover a source for the raw referrer."
        >
          <div className="grid md:grid-cols-[240px_1fr] gap-6">
            <div className="space-y-2.5">
              {reviewSourceTotals.map(([src, count]) => (
                <Bar key={src} label={sourceLabel(src)} value={count} max={reviewSourceMax} />
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Faculty</th>
                    <th className="py-2 pr-3">Source</th>
                    <th className="py-2 pr-3">Campaign</th>
                    <th className="py-2 pr-3">Landed on</th>
                    <th className="py-2 pr-3">Device</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleReviews.map((r) => {
                    const a = reviewAttribution.get(r.id);
                    return (
                      <tr key={r.id} className="border-b border-slate-50 last:border-0">
                        <td className="py-2 pr-3 whitespace-nowrap text-slate-500">{fmtDate(r.created_at)}</td>
                        <td className="py-2 pr-3 font-medium text-slate-800">{facultyName(r.faculty_slug)}</td>
                        <td className="py-2 pr-3">
                          <SourceChip
                            source={a?.source ?? "direct"}
                            title={`${a?.via ?? ""}${a?.rawReferrer ? ` · ${a.rawReferrer}` : ""}`}
                          />
                        </td>
                        <td className="py-2 pr-3 text-slate-500">{a?.campaign ?? "—"}</td>
                        <td className="py-2 pr-3 text-slate-500 max-w-[140px] truncate" title={a?.landing ?? undefined}>
                          {a?.landing ?? "—"}
                        </td>
                        <td className="py-2 pr-3 text-slate-500">{r.device_type ?? "—"}</td>
                        <td className="py-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            r.approved
                              ? "bg-green-50 text-green-700"
                              : r.rejected
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-700"
                          }`}>
                            {r.approved ? "Published" : r.rejected ? "Rejected" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {reviews.length > 30 && (
                <button
                  onClick={() => setShowAllReviews((v) => !v)}
                  className="mt-3 text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  {showAllReviews ? "Show latest 30" : `Show all ${reviews.length} reviews`}
                </button>
              )}
            </div>
          </div>
        </Section>

        {/* Faculty page views by source */}
        <Section
          title="Faculty Page Views by Source"
          sub={`Unique sessions per faculty per channel, last ${rangeDays} days`}
        >
          {facultyViewSources.rows.length === 0 ? (
            <p className="text-sm text-slate-400">No faculty page views in this window.</p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {facultyViewSources.overallRows.map(([src, count]) => (
                  <span key={src} className="inline-flex items-center gap-1.5">
                    <SourceChip source={src} />
                    <span className="text-xs text-slate-500 font-semibold">{count}</span>
                  </span>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                      <th className="py-2 pr-4">Faculty</th>
                      <th className="py-2 pr-4">Sessions</th>
                      <th className="py-2">Sources</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facultyViewSources.rows.slice(0, 30).map((row) => (
                      <tr key={row.slug} className="border-b border-slate-50 last:border-0 align-top">
                        <td className="py-2.5 pr-4 font-medium text-slate-800 whitespace-nowrap">
                          {facultyName(row.slug)}
                        </td>
                        <td className="py-2.5 pr-4 tabular-nums">{row.total}</td>
                        <td className="py-2.5">
                          <div className="flex flex-wrap gap-1.5">
                            {row.breakdown.map((b) => (
                              <span key={b.src} className="inline-flex items-center gap-1">
                                <SourceChip source={b.src} />
                                <span className="text-[11px] text-slate-500 font-semibold">{b.count}</span>
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {facultyViewSources.rows.length > 30 && (
                  <p className="text-xs text-slate-400 mt-2">Showing top 30 of {facultyViewSources.rows.length} faculties with views.</p>
                )}
              </div>
            </div>
          )}
        </Section>

        {/* Funnel */}
        <Section title="Conversion Funnel" sub={`Unique sessions per step, last ${rangeDays} days`}>
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
          <Section title="Acquisition" sub="Unique sessions by channel (UTM first, then entry referrer)">
            <div className="space-y-2.5">
              {stats.acquisition.length === 0 ? (
                <p className="text-sm text-slate-400">No sessions in this window.</p>
              ) : (
                stats.acquisition.map(([src, count]) => (
                  <Bar key={src} label={sourceLabel(src)} value={count} max={acqMax} />
                ))
              )}
            </div>
          </Section>

          {/* Ad campaigns */}
          <Section title="Ad Campaigns" sub="Per utm_campaign: sessions and how deep they went">
            {stats.campaignStats.length === 0 ? (
              <p className="text-sm text-slate-400">No campaign-tagged traffic in this window.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                      <th className="py-2 pr-4">Campaign</th>
                      <th className="py-2 pr-4">Sessions</th>
                      <th className="py-2 pr-4">Faculty views</th>
                      <th className="py-2">Review clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.campaignStats.map((c) => (
                      <tr key={c.name} className="border-b border-slate-50 last:border-0">
                        <td className="py-2.5 pr-4 font-semibold text-slate-800">{c.name}</td>
                        <td className="py-2.5 pr-4 tabular-nums">{c.sessions}</td>
                        <td className="py-2.5 pr-4 tabular-nums">
                          {c.facultyViews}
                          {c.sessions > 0 && <span className="text-slate-400 text-xs ml-1">({Math.round((100 * c.facultyViews) / c.sessions)}%)</span>}
                        </td>
                        <td className="py-2.5 tabular-nums">{c.reviewClicks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {/* Referrers */}
          <Section title="Top External Referrers" sub="Unique sessions by referring site (own-site navigation excluded)">
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
          <Section title="Device Split" sub="Unique sessions per device">
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
          <Section title="Share Activity" sub={`share_clicked events, last ${rangeDays} days`}>
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

          {/* Recommend + WhatsApp attribution */}
          <Section title="Review Signals">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Would Recommend</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {pct(stats.recommendYes, stats.recommendYes + stats.recommendNo)}%
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{stats.recommendYes} yes / {stats.recommendNo} no</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">WhatsApp-Attributed</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.whatsappAttributedReviews}</p>
                <p className="text-xs text-slate-400 mt-0.5">Reviews via a shared link</p>
              </div>
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

        {/* Search metrics */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Kpi
            label="Total Searches"
            value={String(stats.totalSearches)}
            sub={`last ${rangeDays} days`}
          />
          <Kpi
            label="Click-through Rate"
            value={`${stats.searchClickRate}%`}
            sub="Searches that led to a faculty page"
            light={lightFor(stats.searchClickRate, 40, 20)}
          />
          <Kpi
            label="No-result Rate"
            value={`${stats.searchNoResultRate}%`}
            sub="Searches that found nothing"
            light={lightFor(stats.searchNoResultRate, 10, 25, false)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Section title="Top Search Queries" sub={`Most searched terms, last ${rangeDays} days`}>
            {stats.topSearchQueries.length === 0 ? (
              <p className="text-sm text-slate-400">No searches yet.</p>
            ) : (
              <div className="space-y-2.5">
                {stats.topSearchQueries.map(([q, count]) => (
                  <Bar
                    key={q}
                    label={q}
                    value={count}
                    max={Math.max(...stats.topSearchQueries.map(([, c]) => c), 1)}
                  />
                ))}
              </div>
            )}
          </Section>

          <Section title="Zero-result Queries" sub="What users searched for but didn't find — gaps to fill">
            {stats.noResultQueries.length === 0 ? (
              <p className="text-sm text-slate-400">No zero-result searches yet.</p>
            ) : (
              <div className="space-y-2.5">
                {stats.noResultQueries.map(([q, count]) => (
                  <Bar
                    key={q}
                    label={q}
                    value={count}
                    max={Math.max(...stats.noResultQueries.map(([, c]) => c), 1)}
                  />
                ))}
              </div>
            )}
          </Section>
        </div>

      </section>
    </main>
  );
}
