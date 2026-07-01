import type { Metadata } from "next";
import { SITE_NAME, BASE_URL, CONTACT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: `Terms of Service | ${SITE_NAME}`,
  description: "Terms governing your use of Careviews.",
  alternates: { canonical: `${BASE_URL}/terms` },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <section className="bg-navy text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <a href="/about" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition">
            ← About
          </a>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-white">Terms of Service</h1>
          <p className="text-white/50 text-sm mt-3">Last updated: July 2025</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">

        <p className="text-ink/70 text-sm leading-relaxed">
          By using Careviews, you agree to these terms. If you do not agree, please stop using the platform.
        </p>

        <div className="space-y-6">

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-playfair font-bold text-ink mb-3">1. About Careviews</h2>
            <p className="text-ink/65 text-sm leading-relaxed">
              Careviews is an independent, student-run platform that collects and displays reviews of CA (Chartered Accountancy) faculty members in India. We are not affiliated with ICAI, any coaching institute, or any faculty member listed on the platform.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-playfair font-bold text-ink mb-3">2. Reviews and User Content</h2>
            <ul className="space-y-2 text-ink/65 text-sm leading-relaxed list-disc list-inside">
              <li>You may only submit a review if you have personally studied under the faculty you are reviewing.</li>
              <li>Reviews must reflect your genuine, honest experience.</li>
              <li>You must not submit reviews on behalf of another person, coaching institute, or competitor.</li>
              <li>Reviews containing defamatory statements, profanity, personal attacks, sexually explicit content, or false information are strictly prohibited and will be removed.</li>
              <li>By submitting a review, you grant Careviews a perpetual, royalty-free, worldwide licence to display that review on the platform.</li>
              <li>You retain ownership of the content you submit.</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-playfair font-bold text-ink mb-3">3. Moderation</h2>
            <p className="text-ink/65 text-sm leading-relaxed">
              All reviews are manually moderated before going live. We reserve the right to reject, edit, or remove any review that violates these terms or our Review Guidelines, at our sole discretion, without prior notice. Repeated violations may result in account suspension.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-playfair font-bold text-ink mb-3">4. No Endorsement or Guarantee</h2>
            <p className="text-ink/65 text-sm leading-relaxed">
              Reviews on Careviews represent individual student opinions and experiences. Careviews does not endorse, recommend, or verify claims made by reviewers. We do not guarantee the accuracy, completeness, or usefulness of any review. Faculty ratings and rankings should be used as one input among many when making educational decisions.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-playfair font-bold text-ink mb-3">5. Prohibited Conduct</h2>
            <ul className="space-y-2 text-ink/65 text-sm leading-relaxed list-disc list-inside">
              <li>Submitting fake, paid, or incentivised reviews.</li>
              <li>Using automated tools, bots, or scripts to submit reviews or interact with the platform.</li>
              <li>Attempting to manipulate ratings or rankings artificially.</li>
              <li>Scraping the platform without written permission.</li>
              <li>Impersonating any person, student, or institution.</li>
              <li>Any activity that disrupts or damages the platform or other users&apos; experience.</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-playfair font-bold text-ink mb-3">6. Intellectual Property</h2>
            <p className="text-ink/65 text-sm leading-relaxed">
              The Careviews name, logo, design, and platform code are owned by Careviews. User-submitted reviews remain the intellectual property of the reviewer. Faculty information (names, subjects, levels) is factual data not subject to copyright.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-playfair font-bold text-ink mb-3">7. Limitation of Liability</h2>
            <p className="text-ink/65 text-sm leading-relaxed">
              Careviews is provided &quot;as is&quot; without warranties of any kind. To the fullest extent permitted by law, Careviews shall not be liable for any indirect, incidental, or consequential damages arising from use of the platform, reliance on any review, or unavailability of the service.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-playfair font-bold text-ink mb-3">8. Governing Law</h2>
            <p className="text-ink/65 text-sm leading-relaxed">
              These terms are governed by the laws of India. Disputes shall be subject to the jurisdiction of courts in India.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-playfair font-bold text-ink mb-3">9. Changes to Terms</h2>
            <p className="text-ink/65 text-sm leading-relaxed">
              We may update these terms at any time. Continued use after updates constitutes acceptance. Material changes will be communicated via our community channels.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-playfair font-bold text-ink mb-3">10. Contact</h2>
            <p className="text-ink/65 text-sm leading-relaxed">
              For questions, complaints about content, or takedown requests, email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-navy font-medium hover:underline">{CONTACT_EMAIL}</a>.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
