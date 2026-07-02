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
          <p className="text-white/50 text-sm mt-3">Last updated: July 2026</p>
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
              All reviews are screened against these terms and our Review Guidelines before going live. We reserve the right to reject any review, or to redact it (remove specific portions such as personal information, abusive language, or unverifiable factual allegations) at our sole discretion, without prior notice. We do not rewrite, add to, or alter the meaning of review content — moderation is limited to compliance screening and redaction. Repeated violations may result in account suspension.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-playfair font-bold text-ink mb-3">4. No Endorsement or Guarantee; Intermediary Status</h2>
            <p className="text-ink/65 text-sm leading-relaxed mb-3">
              Reviews on Careviews represent individual student opinions and experiences, and are the statements of their authors — not of Careviews. Careviews functions as an intermediary under the Information Technology Act, 2000 with respect to user-submitted content. Careviews does not endorse, recommend, or verify claims made by reviewers. We do not guarantee the accuracy, completeness, or usefulness of any review.
            </p>
            <p className="text-ink/65 text-sm leading-relaxed">
              Aggregate ratings, rankings, and computed statistics displayed on the platform are arithmetic summaries of scores submitted by student reviewers, generated automatically without editorial adjustment. They are not opinions, recommendations, or assessments made by Careviews, and should be used as one input among many when making educational decisions.
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
            <h2 className="font-playfair font-bold text-ink mb-3">8. Indemnity</h2>
            <p className="text-ink/65 text-sm leading-relaxed">
              You are solely responsible for the content you submit. You agree to indemnify and hold harmless Careviews and its operator from any claim, demand, loss, or damage (including reasonable legal costs) arising out of content you submit, your breach of these terms, or your violation of any law or third-party right.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-playfair font-bold text-ink mb-3">9. Grievance Redressal &amp; Content Removal</h2>
            <p className="text-ink/65 text-sm leading-relaxed mb-3">
              In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the Grievance Officer for Careviews is:
            </p>
            <p className="text-ink/65 text-sm leading-relaxed mb-3">
              <span className="font-semibold text-ink">Rohan Garg</span> — Grievance Officer<br />
              Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-navy font-medium hover:underline">{CONTACT_EMAIL}</a> (subject line: &quot;Grievance&quot;)
            </p>
            <ul className="space-y-2 text-ink/65 text-sm leading-relaxed list-disc list-inside">
              <li>Complaints are acknowledged within 24 hours of receipt.</li>
              <li>Complaints are resolved within 15 days of receipt.</li>
              <li>Content found to violate these terms or applicable law is removed or redacted; where a complaint concerns a review of a specific faculty, the contested review may be temporarily unpublished while under assessment.</li>
              <li>We comply with valid orders of courts and government agencies within the timelines prescribed by law.</li>
              <li>If you are a faculty member or institute and believe a review about you is false or unlawful, email the URL of the review, the specific statements you dispute, and the basis of your complaint.</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-playfair font-bold text-ink mb-3">10. Governing Law &amp; Jurisdiction</h2>
            <p className="text-ink/65 text-sm leading-relaxed">
              These terms are governed by the laws of India. Subject to applicable law, disputes arising out of or relating to these terms or the platform shall be subject to the exclusive jurisdiction of the competent courts at Sirsa, Haryana, India.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-playfair font-bold text-ink mb-3">11. Changes to Terms</h2>
            <p className="text-ink/65 text-sm leading-relaxed">
              We may update these terms at any time. Continued use after updates constitutes acceptance. Material changes will be communicated via our community channels.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-playfair font-bold text-ink mb-3">12. Contact</h2>
            <p className="text-ink/65 text-sm leading-relaxed">
              For questions, complaints about content, or takedown requests, email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-navy font-medium hover:underline">{CONTACT_EMAIL}</a>, or use the grievance process in Section 9.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
