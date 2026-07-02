import type { Metadata } from "next";
import { SITE_NAME, BASE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: `Review Guidelines | ${SITE_NAME}`,
  description: "How to write a helpful, honest review on Careviews.",
  alternates: { canonical: `${BASE_URL}/guidelines` },
  robots: { index: true, follow: true },
};

export default function GuidelinesPage() {
  return (
    <main className="min-h-screen">
      <section className="bg-navy text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <a href="/about" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition">
            ← About
          </a>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-white">Review Guidelines</h1>
          <p className="text-white/55 text-sm mt-3 max-w-lg leading-relaxed">
            A good review helps future CA students make one of the most important decisions of their preparation. Here&apos;s how to write one.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">

        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <p className="text-green-800 text-sm font-semibold mb-1">The core principle</p>
          <p className="text-green-700 text-sm leading-relaxed">
            Write the review you wish had existed when you were choosing your faculty. Be honest, be specific, and be fair.
          </p>
        </div>

        <div className="space-y-5">

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-playfair font-bold text-ink mb-4">What makes a good review</h2>
            <div className="space-y-4">
              {[
                { icon: "✅", label: "Be specific", desc: "Instead of \"great teacher\", say \"explains IFRS standards with real-world examples — makes the conceptual understanding strong but revision notes lack MCQ practice.\"" },
                { icon: "✅", label: "Include both sides", desc: "The best reviews have genuine pros AND cons. A review with only praise (or only complaints) is less useful and more likely to be flagged." },
                { icon: "✅", label: "Write from your own experience", desc: "Only review faculties you have personally studied under. Don't write reviews based on what friends said." },
                { icon: "✅", label: "Mention your context", desc: "Your experience as a first-attempt student may differ from a repeater. The form captures this — factor it into what you write." },
                { icon: "✅", label: "Be fair to the faculty", desc: "If you had a bad experience, explain what specifically went wrong. Vague negativity isn't helpful and may be removed." },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <span className="shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.label}</p>
                    <p className="text-sm text-ink/60 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-playfair font-bold text-ink mb-4">What gets removed</h2>
            <div className="space-y-3">
              {[
                { icon: "🚫", text: "Profanity, personal attacks, or abusive language." },
                { icon: "🚫", text: "Defamatory statements — making serious accusations without specifics." },
                { icon: "🚫", text: "Promotional content — reviews that read like advertisements for a faculty or institute." },
                { icon: "🚫", text: "Fake reviews — submitting reviews for faculties you haven't studied under." },
                { icon: "🚫", text: "Competitor attacks — writing negative reviews as a smear campaign." },
                { icon: "🚫", text: "Revealing private information — personal details about the faculty not relevant to students." },
                { icon: "🚫", text: "Unverifiable factual allegations — claims of fraud, cheating, paper leaks, fake results, criminal conduct, or personal misconduct. We cannot verify these, so we cannot publish them. If you believe a law has been broken, report it to the appropriate authority — a review is not the place for it." },
                { icon: "🚫", text: "Comments on a faculty's personal life, character, appearance, religion, or anything beyond their teaching and course." },
              ].map((item) => (
                <div key={item.text} className="flex gap-3">
                  <span className="shrink-0">{item.icon}</span>
                  <p className="text-sm text-ink/65 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-playfair font-bold text-ink mb-4">Examples</h2>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-2">Good review</p>
                <div className="border-l-[3px] border-green-400 pl-4 py-1">
                  <p className="text-sm text-ink/70 leading-relaxed italic">
                    &quot;Strong on conceptual clarity for SFM — the derivatives and options module in particular is excellent. Covers DT well but IDT feels rushed. Revision lectures are good but ICAI MCQ coverage is weak. Best suited for students who want deep understanding over rote learning. Notes are detailed but bulky. I&apos;d recommend pairing with Icai MCQ module.&quot;
                  </p>
                </div>
                <p className="text-xs text-ink/45 mt-2">Specific, balanced, contextual, actionable.</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-2">Review that gets rejected</p>
                <div className="border-l-[3px] border-red-400 pl-4 py-1">
                  <p className="text-sm text-ink/70 leading-relaxed italic">
                    &quot;Worst faculty ever. Complete waste of money. Don&apos;t take their classes.&quot;
                  </p>
                </div>
                <p className="text-xs text-ink/45 mt-2">No specifics, no context, no actionable information.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-playfair font-bold text-ink mb-3">Opinions vs. allegations</h2>
            <p className="text-sm text-ink/65 leading-relaxed mb-2">
              <span className="font-semibold text-ink">&quot;The teaching pace didn&apos;t work for me and I fell behind&quot;</span> is your experience — publishable.
            </p>
            <p className="text-sm text-ink/65 leading-relaxed">
              <span className="font-semibold text-ink">&quot;This faculty fakes their results&quot;</span> is a factual accusation neither you nor we can prove — not publishable, however strongly you feel it. Describe what you experienced, not what you suspect.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-amber-900 text-sm font-semibold mb-1">Moderation timeline</p>
            <p className="text-amber-800 text-sm leading-relaxed">
              Reviews are manually reviewed, typically within 24 hours. Borderline reviews may take longer. You&apos;ll see a &quot;pending approval&quot; notice until your review goes live. Moderation is limited to guideline compliance — we never alter the meaning of what you wrote.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
