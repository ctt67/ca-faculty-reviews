import type { Metadata } from "next";
import { SITE_NAME, BASE_URL, CONTACT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
  description: "How Careviews collects, uses, and protects your data.",
  alternates: { canonical: `${BASE_URL}/privacy` },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <section className="bg-navy text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <a href="/about" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition">
            ← About
          </a>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-white">Privacy Policy</h1>
          <p className="text-white/50 text-sm mt-3">Last updated: July 2026</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-slate prose-headings:font-playfair prose-headings:text-ink prose-a:text-navy prose-a:no-underline hover:prose-a:underline max-w-none">

        <p className="text-ink/70 text-base leading-relaxed">
          Careviews (&quot;we&quot;, &quot;our&quot;) is a student-run platform for CA faculty reviews. This policy explains what data we collect, why, and how we protect it.
        </p>

        <h2 className="font-playfair text-xl font-bold text-ink mt-10 mb-4">What we collect</h2>

        <div className="space-y-5">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="font-semibold text-ink text-sm mb-1">Review data</p>
            <p className="text-ink/65 text-sm leading-relaxed">When you submit a review, we store your Supabase user ID, faculty slug, all rating fields, course metadata, pros, cons, and your written review text. Reviews are moderated before going live.</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="font-semibold text-ink text-sm mb-1">Authentication</p>
            <p className="text-ink/65 text-sm leading-relaxed">We use Supabase Auth. When you sign in with Google or email, your email address is stored in Supabase. We do not store passwords.</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="font-semibold text-ink text-sm mb-1">Analytics</p>
            <p className="text-ink/65 text-sm leading-relaxed">We record anonymised events (page views, review submissions, search queries) with no personally identifiable information. Your IP address is hashed using SHA-256 with a rotating salt and is never stored in plain text. We use Vercel Analytics and our own event table.</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="font-semibold text-ink text-sm mb-1">Email newsletter</p>
            <p className="text-ink/65 text-sm leading-relaxed">If you subscribe, we store only your email address and the source of signup. You can ask us to remove it at any time.</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="font-semibold text-ink text-sm mb-1">Technical metadata</p>
            <p className="text-ink/65 text-sm leading-relaxed">For spam prevention, we store a hashed user-agent string, browser name, device type, country (from IP lookup), and time taken to complete the review form. This data is not linked to your identity outside Supabase Auth.</p>
          </div>
        </div>

        <h2 className="font-playfair text-xl font-bold text-ink mt-10 mb-4">How we use your data</h2>
        <ul className="list-disc list-inside space-y-2 text-ink/70 text-sm leading-relaxed">
          <li>To display moderated reviews to other students.</li>
          <li>To detect and prevent spam, fake reviews, and abuse.</li>
          <li>To understand how students use the platform so we can improve it.</li>
          <li>To send product updates if you subscribed.</li>
        </ul>

        <h2 className="font-playfair text-xl font-bold text-ink mt-10 mb-4">What we do not do</h2>
        <ul className="list-disc list-inside space-y-2 text-ink/70 text-sm leading-relaxed">
          <li>We do not sell your data to any third party.</li>
          <li>We do not serve advertising.</li>
          <li>We do not share your review with the faculty you reviewed without your consent.</li>
          <li>We do not use your data to train AI models.</li>
        </ul>

        <h2 className="font-playfair text-xl font-bold text-ink mt-10 mb-4">Data storage</h2>
        <p className="text-ink/70 text-sm leading-relaxed">
          All data is stored in Supabase (managed PostgreSQL, hosted on AWS). Supabase is our data processor and operates under its own privacy policy. Data may be hosted in ap-south-1 (Mumbai) or us-east-1 regions.
        </p>

        <h2 className="font-playfair text-xl font-bold text-ink mt-10 mb-4">Your rights</h2>
        <p className="text-ink/70 text-sm leading-relaxed mb-3">
          You can request access to, correction of, or deletion of your account, email subscription, or any review you submitted. Email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-navy font-medium">{CONTACT_EMAIL}</a>{" "}
          with the subject &quot;Delete my data&quot; or &quot;Data request&quot;. We will process requests within 14 days.
        </p>

        <h2 className="font-playfair text-xl font-bold text-ink mt-10 mb-4">Data retention</h2>
        <p className="text-ink/70 text-sm leading-relaxed">
          Analytics events are automatically deleted after 90 days. Reviews and account data are retained while your account exists, or until you request deletion. Anti-spam signals (hashed identifiers) are retained as long as the associated review exists.
        </p>

        <h2 className="font-playfair text-xl font-bold text-ink mt-10 mb-4">Minors</h2>
        <p className="text-ink/70 text-sm leading-relaxed">
          If you are under 18, please use Careviews and submit content only with the consent of a parent or guardian. We do not knowingly collect personal data from children, and we collect no date-of-birth or age information.
        </p>

        <h2 className="font-playfair text-xl font-bold text-ink mt-10 mb-4">Cookies</h2>
        <p className="text-ink/70 text-sm leading-relaxed">
          We use essential cookies for authentication (Supabase Auth session). We use localStorage (not cookies) for dismissing the community float and storing vote session tokens. We do not use tracking cookies or third-party ad cookies.
        </p>

        <h2 className="font-playfair text-xl font-bold text-ink mt-10 mb-4">Changes to this policy</h2>
        <p className="text-ink/70 text-sm leading-relaxed">
          We may update this policy. Material changes will be announced via our community channels. Continued use of Careviews after changes constitutes acceptance.
        </p>

        <h2 className="font-playfair text-xl font-bold text-ink mt-10 mb-4">Contact</h2>
        <p className="text-ink/70 text-sm leading-relaxed">
          Questions? Email <a href={`mailto:${CONTACT_EMAIL}`} className="text-navy font-medium">{CONTACT_EMAIL}</a>.
        </p>

      </section>
    </main>
  );
}
