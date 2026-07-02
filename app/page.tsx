import Link from "next/link";
import type { Metadata } from "next";
import { PenLine, ShieldCheck, Ban, Layers, FileText, BarChart2, CircleDollarSign, Check, BookOpen, SlidersHorizontal } from "lucide-react";
import { BASE_URL, SITE_NAME } from "@/lib/config";
import { supabase } from "@/lib/supabase";
import TrackedLink from "@/components/TrackedLink";
import CommunityLinks from "@/components/CommunityLinks";
import NewsletterSignup from "@/components/NewsletterSignup";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `${SITE_NAME} — CA Faculty Reviews | Compare CA Final, Inter & Foundation Coaching`,
  description:
    "Read genuine student reviews of CA coaching faculties. Compare teaching quality, exam focus, doubt resolution and more across CA Final, Intermediate and Foundation. Independent, no paid rankings.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: `${SITE_NAME} — Honest CA Faculty Reviews`,
    description:
      "Genuine student reviews of CA coaching faculties. Compare faculties across 10 rating dimensions for CA Final, Intermediate and Foundation. Independent, no paid rankings.",
    url: BASE_URL,
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Honest CA Faculty Reviews`,
    description:
      "Genuine student reviews of CA coaching faculties. Compare faculties across 10 rating dimensions. Independent, no paid rankings.",
  },
};

const trustItems = [
  { icon: PenLine, label: "Genuine Reviews", desc: "Real students, real experiences." },
  { icon: ShieldCheck, label: "Independent Platform", desc: "No affiliation with any coaching institute." },
  { icon: Ban, label: "No Paid Rankings", desc: "Ranked by students, not money." },
  { icon: Layers, label: "All CA Levels", desc: "Final, Intermediate and Foundation." },
];

const whyItems = [
  {
    icon: FileText,
    title: "Read honest reviews",
    desc: "Unfiltered student experiences from real CA students. No editorial control. No institute influence.",
  },
  {
    icon: BarChart2,
    title: "Compare faculties",
    desc: "Side-by-side comparison across 10 rating dimensions — concept clarity, exam focus, doubt resolution and more.",
  },
  {
    icon: CircleDollarSign,
    title: "Avoid expensive mistakes",
    desc: "CA coaching costs tens of thousands. One good review can save you from a year of regret.",
  },
];

export default async function HomePage() {
  const { count } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("approved", true);

  const reviewCount = count ?? 0;

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">

          <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-5">
            India's independent CA student review platform
          </p>

          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-white leading-tight max-w-xl">
            Honest CA Faculty Reviews
          </h1>

          <p className="font-playfair italic text-gold text-xl mt-4 max-w-lg leading-relaxed">
            Read what students wish they knew before buying.
          </p>

          <p className="text-white/70 text-sm mt-4 max-w-lg leading-relaxed">
            Genuine reviews from CA students. Compare faculties across detailed student ratings and choose your coaching with confidence.
          </p>

          <div className="flex flex-wrap gap-3 mt-7">
            <Link
              href="/final"
              className="bg-gold text-ink font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition text-sm"
            >
              Browse Faculty
            </Link>
            <TrackedLink
              href="/review"
              event="write_review_clicked"
              properties={{ source: "homepage" }}
              className="border border-white/25 text-white font-medium px-6 py-3 rounded-lg hover:bg-white/5 transition text-sm"
            >
              Write a Review
            </TrackedLink>
          </div>

          {/* Social proof */}
          <div className="mt-6 inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full px-4 py-2">
            <span className="text-gold text-sm tracking-wide">★★★★★</span>
            <span className="text-white/75 text-xs font-medium">{reviewCount} student {reviewCount === 1 ? "review" : "reviews"}</span>
            <span className="text-white/25 text-xs">·</span>
            <span className="text-white/50 text-xs">Growing every week</span>
          </div>

        </div>

        {/* Stats bar */}
        <div className="border-t border-white/10">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-white/10">
            {trustItems.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center gap-1 text-center px-4 py-5 bg-navy">
                <Icon size={16} className="text-gold mb-0.5" />
                <span className="text-white/90 text-xs font-semibold leading-tight">{label}</span>
                <span className="text-white/50 text-[10px] leading-tight mt-0.5">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 justify-between border-b border-ink/5">
        <p className="text-ink/55 text-xs">Built by CA students, for CA students.</p>
        <Link
          href="/about"
          className="text-ink/50 text-xs underline underline-offset-2 decoration-dotted hover:text-ink transition"
        >
          Learn how we moderate reviews →
        </Link>
      </div>

      {/* Why CareViews */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-10">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-2">Why students use Careviews</p>
          <h2 className="font-playfair text-2xl font-bold text-ink">Make the right call before you pay.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {whyItems.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-xl p-7 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-9 h-9 bg-parchment rounded-lg flex items-center justify-center mb-5">
                <Icon size={18} className="text-navy" />
              </div>
              <h3 className="font-semibold text-ink text-sm">{title}</h3>
              <p className="text-ink/60 text-sm mt-2 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by Level */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-2">CA Faculty Reviews</p>
          <h2 className="font-playfair text-3xl font-bold text-ink">Browse by Level</h2>
          <p className="text-ink/60 mt-2 text-sm">Choose your CA level and explore faculty reviews.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { href: "/final", label: "CA Final", subjects: "FR, Audit, DT, IDT, AFM and more" },
            { href: "/inter", label: "CA Intermediate", subjects: "Accounts, Law, Tax, Costing and more" },
            { href: "/foundation", label: "CA Foundation", subjects: "All Foundation level subjects" },
          ].map(({ href, label, subjects }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group block"
            >
              <div className="h-[3px] bg-navy" />
              <div className="p-7">
                <h3 className="font-playfair text-xl font-bold text-ink">{label}</h3>
                <p className="mt-2 text-ink/60 text-sm">{subjects}</p>
                <div className="mt-6 text-gold text-sm font-semibold group-hover:underline">
                  Browse Faculties →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Learn: guide + ratings */}
      <section className="max-w-6xl mx-auto px-6 py-4">
        <div className="grid sm:grid-cols-2 gap-5">
          {[
            {
              href: "/guide",
              icon: BookOpen,
              title: "The Buying Guide",
              desc: "20 chapters on choosing CA coaching — format, notes, validity, demo bias and every check before you pay.",
            },
            {
              href: "/ratings",
              icon: SlidersHorizontal,
              title: "Ratings, Explained",
              desc: "What our 10 rating dimensions actually measure, and how to use them when comparing faculties.",
            },
          ].map(({ href, icon: Icon, title, desc }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow p-5 flex items-start gap-4 group"
            >
              <div className="w-9 h-9 bg-parchment rounded-lg flex items-center justify-center shrink-0">
                <Icon size={17} className="text-navy" />
              </div>
              <div>
                <h3 className="font-semibold text-ink text-sm group-hover:text-navy">
                  {title} <span className="text-gold group-hover:underline">→</span>
                </h3>
                <p className="text-ink/55 text-xs mt-1 leading-relaxed">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Write a review strip */}
      <section className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-parchment border border-gold/25 rounded-2xl px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-2">For CA Students</p>
            <h2 className="font-playfair text-xl font-bold text-ink">
              Your coaching experience is worth sharing.
            </h2>
            <p className="text-ink/55 text-sm mt-1.5 max-w-md leading-relaxed">
              CA coaching costs thousands of rupees. One honest review from you could save a future aspirant from a costly mistake.
            </p>
          </div>
          <TrackedLink
            href="/review"
            event="write_review_clicked"
            properties={{ source: "homepage_strip" }}
            className="shrink-0 bg-gold text-ink px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition whitespace-nowrap"
          >
            Write a Review →
          </TrackedLink>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-10 pb-16">
        <div className="mb-8">
          <h2 className="font-playfair text-3xl font-bold text-ink">How It Works</h2>
          <p className="text-ink/60 mt-2 text-sm">Find your faculty in three steps.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { step: "01", title: "Choose Your Level", desc: "Select CA Final, Intermediate or Foundation." },
            { step: "02", title: "Browse by Subject", desc: "Pick a subject and see all available faculties with ratings." },
            { step: "03", title: "Compare & Decide", desc: "Use our side-by-side comparison to pick the best faculty for you." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="bg-white rounded-xl p-7 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
              <div className="font-playfair text-3xl font-bold text-gold/40">{step}</div>
              <h3 className="font-bold text-ink mt-3 text-sm">{title}</h3>
              <p className="text-ink/60 text-sm mt-2">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Community */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-navy rounded-2xl px-8 sm:px-12 py-10 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="flex-1 min-w-0">
            <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-2">Open Platform</p>
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-3">
              Help Build Careviews
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-lg">
              Careviews is built with the CA community. Join our WhatsApp, Telegram, or Instagram to vote on upcoming features, share ideas, and see what&apos;s being built next.
            </p>
            <div className="mt-5">
              <CommunityLinks scheme="dark" />
            </div>
          </div>
          <div className="w-full md:w-72 shrink-0">
            <NewsletterSignup source="homepage" scheme="dark" />
          </div>
        </div>
      </section>

      {/* Compare CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-navy rounded-2xl px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-playfair text-3xl font-bold text-white">
              Can't decide between two faculties?
            </h2>
            <p className="mt-3 text-white/65 text-sm">Compare two faculties side by side</p>
            <ul className="mt-3 flex flex-col gap-1.5">
              {["Ratings", "Reviews", "Student experiences"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-white/65 text-sm">
                  <Check size={13} className="text-gold flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/compare"
            className="flex-shrink-0 bg-gold text-ink px-8 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition"
          >
            Start Comparing
          </Link>
        </div>
      </section>

    </main>
  );
}
