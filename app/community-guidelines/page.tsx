import type { Metadata } from "next";
import { SITE_NAME, BASE_URL, CONTACT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: `Community Guidelines | ${SITE_NAME}`,
  description: "Guidelines for participating in the Careviews community.",
  alternates: { canonical: `${BASE_URL}/community-guidelines` },
  robots: { index: true, follow: true },
};

export default function CommunityGuidelinesPage() {
  return (
    <main className="min-h-screen">
      <section className="bg-navy text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <a href="/about" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition">
            ← About
          </a>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-white">Community Guidelines</h1>
          <p className="text-white/55 text-sm mt-3 max-w-lg leading-relaxed">
            Careviews is built by CA students for CA students. These guidelines keep the community useful, honest, and respectful.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">

        <div className="space-y-5">

          {[
            {
              title: "Be honest, not performative",
              body: "The whole point of Careviews is honest signal. Don't write reviews to build a faculty's reputation or tear one down — write because your experience genuinely helps someone else decide. A well-considered 3/5 review with real detail beats a meaningless 5/5.",
              icon: "🎯",
            },
            {
              title: "Stay respectful",
              body: "You can be critical without being cruel. Faculty members are real people. Disagree with the teaching, not the person. Abusive, harassing, or discriminatory language will result in immediate removal and account suspension.",
              icon: "🤝",
            },
            {
              title: "No promotion or advertising",
              body: "Don't use Careviews to advertise your coaching institute, refer students to your tutor, or push any product or service. Reviews that read like marketing copy will be removed and accounts reported.",
              icon: "🚫",
            },
            {
              title: "No brigading",
              body: "Coordinated campaigns to inflate or tank a faculty's rating — whether by one person with multiple accounts or a group acting together — are a serious violation. We actively detect and remove these.",
              icon: "⚠️",
            },
            {
              title: "Protect privacy",
              body: "Don't share personal information about faculty members, fellow students, or anyone else that they haven't made public themselves. This includes phone numbers, personal addresses, or details about their private life.",
              icon: "🔒",
            },
            {
              title: "Help improve the platform",
              body: "Found a bug? A faculty missing? A review that looks fake? Use the report button or email us. You're not just a consumer here — you're a contributor. The more you help, the better this gets for the next student.",
              icon: "🛠️",
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <h2 className="font-playfair font-bold text-ink mb-2">{item.title}</h2>
                  <p className="text-sm text-ink/65 leading-relaxed">{item.body}</p>
                </div>
              </div>
            </div>
          ))}

        </div>

        <div className="bg-navy rounded-xl p-6 text-white">
          <h2 className="font-playfair font-bold text-lg mb-2">Violations</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-4">
            Violating these guidelines may result in a review being declined or removed, account suspension, or a permanent ban — depending on severity and pattern. Declined reviews are returned to their author to revise and resubmit; we never edit review content ourselves. We don&apos;t issue warnings for serious violations.
          </p>
          <p className="text-white/60 text-sm">
            To report a violation:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold hover:underline">{CONTACT_EMAIL}</a>
          </p>
        </div>

      </section>
    </main>
  );
}
