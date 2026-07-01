import Image from "next/image";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  Heart, Shield, Eye, Users,
  FileText, Filter, Scale, BarChart2,
  AlertTriangle, CheckCircle2, Lock,
  Mail, XCircle, CheckCircle, PenLine, MessageCircle,
} from "lucide-react";
import { CONTACT_EMAIL, SITE_NAME, BASE_URL } from "@/lib/config";
import CommunityLinks from "@/components/CommunityLinks";
import NewsletterSignup from "@/components/NewsletterSignup";

export const metadata: Metadata = {
  title: `About | ${SITE_NAME}`,
  description:
    "How Careviews works — our mission, moderation policy, independence statement, and rating methodology.",
  alternates: { canonical: `${BASE_URL}/about` },
};

// ── Static data ────────────────────────────────────────────────────────────────

const PRINCIPLES = [
  {
    icon: Heart,
    title: "Student First",
    desc: "Every product decision prioritises helping students make informed decisions. We do not take direction from coaching institutes.",
  },
  {
    icon: Shield,
    title: "Independent",
    desc: "Faculty cannot pay to improve their rankings or ratings. Placement is determined by review data, not commercial relationships.",
  },
  {
    icon: Eye,
    title: "Transparent",
    desc: "We explain how ratings are calculated and how reviews are moderated. There are no hidden algorithms or undisclosed editorial decisions.",
  },
  {
    icon: Users,
    title: "Community Driven",
    desc: "The platform becomes more useful as more genuine students contribute. Every honest review helps a future student make a better decision.",
  },
];

const HOW_REVIEWS_WORK = [
  {
    title: "Submitted by students",
    desc: "Reviews are written and submitted by CA students who have personal experience with a faculty's course or teaching.",
  },
  {
    title: "Personal experience, not editorial opinion",
    desc: "Careviews does not write or influence review content. Every review reflects the individual student's experience.",
  },
  {
    title: "Minimal editing",
    desc: "Careviews does not edit review opinions. Content is only touched in cases where moderation policy requires it — typically to remove identifying information.",
  },
  {
    title: "Ratings calculated from approved reviews",
    desc: "Numeric ratings are computed directly from the scores submitted by reviewers. No manual adjustments are made to calculated ratings.",
  },
  {
    title: "Review count is always shown",
    desc: "A rating of 4.8 from 2 reviews should be interpreted very differently from 4.8 from 80 reviews. We always display both.",
  },
  {
    title: "Reviews represent a sample",
    desc: "No set of reviews captures every possible experience. Ratings may shift as more students contribute.",
  },
];

const MODERATION_REJECT = [
  "Spam or bot submissions",
  "Hate speech or discriminatory language",
  "Personal abuse directed at individuals",
  "Doxxing or publishing private information",
  "Promotional content paid for by institutes",
  "Clearly fake or fabricated reviews",
  "Duplicate submissions from the same user",
];

const MODERATION_KEEP = [
  "Critical reviews of teaching quality",
  "Negative experiences, when respectfully written",
  "Opinions that differ from the majority",
  "Constructive feedback about course materials",
  "Honest accounts of poor value for money",
];

const NO_PURCHASE = [
  "Better search rankings",
  "Improved displayed ratings",
  "Removal of critical reviews",
  "Preferred placement on subject pages",
];

const GUIDELINES = [
  "Be honest — your real experience is more valuable than a diplomatic one.",
  "Be respectful — critique the teaching, not the person.",
  "Explain your reasoning — a 2/5 with context helps far more than a 2/5 alone.",
  "Focus on educational experience — clarity, pace, materials, exam focus.",
  "Avoid personal attacks or language you wouldn't use face to face.",
  "Help future students — write the review you wish you had read before enrolling.",
];


const CONTACT_TOPICS = [
  "Incorrect faculty information",
  "Spam or fake reviews",
  "Abusive content",
  "Technical bugs",
  "Product suggestions",
  "Other feedback",
];

const DISCLAIMER_ITEMS = [
  "Reviews represent the opinions of individual students. Careviews does not independently verify every factual statement within a review.",
  "Users should conduct their own research before purchasing any course or coaching programme.",
  "Careviews is an information platform. Nothing on this site constitutes educational, financial, or professional advice.",
  "Faculty names, trademarks, course names, and associated logos remain the intellectual property of their respective owners.",
  "Careviews does not claim affiliation with any coaching institute, faculty, or educational body unless explicitly and publicly stated.",
];

// ── Shared sub-components ──────────────────────────────────────────────────────

function SectionTag({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon size={13} className="text-gold" />
      <span className="text-[10px] font-semibold text-ink/40 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-ink mb-5">{children}</h2>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-parchment">

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-4">About</p>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold leading-tight">
            About Careviews
          </h1>
          <p className="mt-4 text-white/60 text-base sm:text-lg max-w-2xl leading-relaxed">
            Helping CA students make better coaching decisions through transparent, community-driven reviews.
          </p>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-16">

        {/* ── Our Mission ── */}
        <section>
          <SectionTag icon={FileText} label="Mission" />
          <SectionHeading>Our Mission</SectionHeading>

          <div className="bg-white rounded-xl shadow-sm p-7 space-y-5 text-[15px] text-ink/70 leading-relaxed">
            <p>
              Choosing a faculty is one of the most significant educational investments a CA student makes.
              A single wrong decision can cost a year of preparation time and tens of thousands of rupees.
            </p>
            <p>
              Yet most students currently make this decision based on fragmented, informal information —
              scattered across Telegram groups, WhatsApp forwards, Reddit threads, YouTube comments,
              and word of mouth from seniors who may have studied under completely different conditions.
            </p>

            <div>
              <p className="font-semibold text-ink mb-3">Students currently rely on:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["Telegram groups", "WhatsApp forwards", "Reddit threads", "YouTube comments", "Senior opinions", "Demo lectures"].map((s) => (
                  <div key={s} className="flex items-center gap-2 bg-parchment rounded-lg px-3 py-2.5 text-[13px] text-ink/65">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <p>
              None of these sources are structured, searchable, or comparable. A student in Jaipur cannot
              easily access the consolidated experience of 200 students who have studied a particular
              faculty's course.
            </p>
            <p className="font-semibold text-ink">
              Careviews exists to organise student experiences into one trustworthy, searchable platform —
              so every CA student can make this decision with better information than the one before them.
            </p>
          </div>
        </section>

        {/* ── Our Principles ── */}
        <section>
          <SectionTag icon={Shield} label="Principles" />
          <SectionHeading>Our Principles</SectionHeading>

          <div className="grid sm:grid-cols-2 gap-4">
            {PRINCIPLES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl shadow-sm p-6">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-gold" />
                </div>
                <h3 className="font-playfair text-lg font-bold text-ink mb-2">{title}</h3>
                <p className="text-ink/65 text-[14px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How Reviews Work ── */}
        <section>
          <SectionTag icon={PenLine} label="Reviews" />
          <SectionHeading>How Reviews Work</SectionHeading>

          <div className="bg-white rounded-xl shadow-sm divide-y divide-slate-100">
            {HOW_REVIEWS_WORK.map(({ title, desc }) => (
              <div key={title} className="px-6 py-5">
                <p className="text-sm font-semibold text-ink mb-1">{title}</p>
                <p className="text-[14px] text-ink/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How We Moderate ── */}
        <section>
          <SectionTag icon={Filter} label="Moderation" />
          <SectionHeading>How We Moderate Reviews</SectionHeading>

          <p className="text-[15px] text-ink/65 -mt-2 mb-6 leading-relaxed">
            Moderation exists to maintain quality, not to shape sentiment. We do not remove reviews
            because they are negative. Critical reviews, when respectfully written, are valuable.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Reject */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <XCircle size={15} className="text-red-400 shrink-0" />
                <p className="text-sm font-semibold text-ink">Reviews we reject</p>
              </div>
              <ul className="space-y-2.5">
                {MODERATION_REJECT.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] text-ink/65 leading-snug">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-300 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Keep */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={15} className="text-green-500 shrink-0" />
                <p className="text-sm font-semibold text-ink">Reviews that stay published</p>
              </div>
              <ul className="space-y-2.5">
                {MODERATION_KEEP.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] text-ink/65 leading-snug">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-5 border-t border-slate-100">
                <p className="text-[13px] text-ink/50 leading-relaxed">
                  Positive reviews are also assessed for authenticity. The goal is genuine signal, not artificially positive sentiment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Independence Policy ── */}
        <section>
          <SectionTag icon={Scale} label="Independence" />
          <SectionHeading>Independence Policy</SectionHeading>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-1 bg-navy" />
            <div className="p-7 space-y-5">
              <p className="text-[15px] text-ink/70 leading-relaxed">
                Careviews is an independent review platform with no commercial relationships with coaching
                institutes or faculties.
              </p>

              <div>
                <p className="text-sm font-semibold text-ink mb-3">No faculty can purchase:</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {NO_PURCHASE.map((item) => (
                    <div key={item} className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                      <XCircle size={13} className="text-red-400 shrink-0" />
                      <span className="text-[13px] text-ink/70">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[15px] text-ink/65 leading-relaxed">
                If Careviews introduces affiliate partnerships, discount codes, or other commercial
                arrangements in the future, these will be clearly disclosed and will not influence
                review data or rankings.
              </p>
            </div>
          </div>
        </section>

        {/* ── Rating Methodology ── */}
        <section>
          <SectionTag icon={BarChart2} label="Methodology" />
          <SectionHeading>Rating Methodology</SectionHeading>

          <div className="bg-white rounded-xl shadow-sm p-7 space-y-4 text-[15px] text-ink/70 leading-relaxed">
            <p>
              Overall ratings are generated from multiple review metrics — concept clarity, exam focus,
              doubt resolution, study materials, pace of teaching, and more. No single metric is
              weighted above the others by editorial decision.
            </p>
            <p>
              Ratings are displayed alongside review counts because sample size matters. A small number
              of reviews can produce extreme averages in either direction. As more students contribute,
              ratings stabilise toward a more accurate picture.
            </p>
            <p>
              The goal is not to produce an "official ranking." The goal is to surface the community's
              collective experience in a format that helps each student make a decision suited to
              their own needs.
            </p>
          </div>
        </section>

        {/* ── Disclaimer ── */}
        <section>
          <SectionTag icon={AlertTriangle} label="Disclaimer" />
          <SectionHeading>Disclaimer</SectionHeading>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-7">
            <ul className="space-y-4">
              {DISCLAIMER_ITEMS.map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-[14px] text-ink/60 leading-relaxed">
                  <span className="shrink-0 font-semibold text-ink/25 text-xs mt-0.5 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Community Guidelines ── */}
        <section>
          <SectionTag icon={CheckCircle2} label="Community" />
          <SectionHeading>Community Guidelines</SectionHeading>

          <div className="bg-white rounded-xl shadow-sm p-7">
            <p className="text-[15px] text-ink/65 mb-5 leading-relaxed">
              When writing a review, please keep the following in mind:
            </p>
            <ul className="space-y-3.5">
              {GUIDELINES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-ink/70 leading-relaxed">
                  <CheckCircle2 size={16} className="text-gold shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Privacy ── */}
        <section>
          <SectionTag icon={Lock} label="Privacy" />
          <SectionHeading>Privacy</SectionHeading>

          <div className="bg-white rounded-xl shadow-sm p-7 space-y-4 text-[15px] text-ink/70 leading-relaxed">
            <p>
              Authentication exists primarily to reduce spam and ensure reviews are submitted by
              real individuals. It is not used to build detailed user profiles.
            </p>
            <p>
              Only the minimum necessary information is collected to enable the review submission
              process. Personal account details are not publicly displayed alongside your review.
            </p>
          </div>
        </section>

        {/* ── Community ── */}
        <section>
          <SectionTag icon={MessageCircle} label="Community" />
          <SectionHeading>Help Shape Careviews</SectionHeading>

          <div className="bg-navy rounded-xl overflow-hidden">
            <div className="p-7 sm:p-9">
              <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-4">
                🚀 Join the Careviews Community
              </p>
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <ul className="space-y-3 mb-6">
                    {[
                      "Vote on upcoming features",
                      "Share ideas and feedback",
                      "Get website updates first",
                      "Access CA resources before they're published",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-white/75 text-[14px] leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-white/45 text-sm leading-relaxed mb-5">
                    Your feedback directly influences what we build next. Help us build the platform the CA community deserves.
                  </p>
                  <CommunityLinks scheme="dark" />
                </div>
                <div className="flex flex-col justify-center">
                  <NewsletterSignup source="about" scheme="dark" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Contact ── */}
        <section>
          <SectionTag icon={Mail} label="Contact" />
          <SectionHeading>Contact</SectionHeading>

          <div className="bg-white rounded-xl shadow-sm p-7">
            <p className="text-[15px] text-ink/65 mb-5 leading-relaxed">
              If you have spotted something that needs attention, please reach out. You can report:
            </p>
            <div className="grid sm:grid-cols-2 gap-2 mb-7">
              {CONTACT_TOPICS.map((item) => (
                <div key={item} className="flex items-center gap-2.5 bg-parchment rounded-lg px-3 py-2.5 text-[14px] text-ink/65">
                  <span className="w-1.5 h-1.5 rounded-full bg-navy shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition"
            >
              <Mail size={14} />
              {CONTACT_EMAIL}
            </a>
          </div>
        </section>

        {/* ── Oreo ── */}
        <section className="text-center pb-4">
          <Image
            src="/20260101_200053.jpg"
            alt="Oreo, Chief Quality Officer"
            width={80}
            height={80}
            className="rounded-full object-cover mx-auto mb-3 border-2 border-gold/25"
          />
          <p className="font-semibold text-ink text-sm">Oreo</p>
          <p className="text-ink/40 text-xs mt-0.5">Chief Quality Officer</p>
        </section>

      </div>
    </main>
  );
}
