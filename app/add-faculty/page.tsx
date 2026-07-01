import type { Metadata } from "next";
import { SITE_NAME, BASE_URL } from "@/lib/config";
import AddFacultyForm from "./add-faculty-form";

export const metadata: Metadata = {
  title: `Request a Faculty | ${SITE_NAME}`,
  description: "Can't find your CA faculty on Careviews? Submit a request and we'll add them.",
  alternates: { canonical: `${BASE_URL}/add-faculty` },
  robots: { index: true, follow: true },
};

export default function AddFacultyPage() {
  return (
    <main className="min-h-screen">
      <section className="bg-navy text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <a href="/" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition">
            ← Home
          </a>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-white">Request a Faculty</h1>
          <p className="text-white/55 text-sm mt-3 max-w-md leading-relaxed">
            Can&apos;t find the faculty you studied under? Submit their details and we&apos;ll add them so others can review.
          </p>
        </div>
      </section>
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <AddFacultyForm />
      </section>
    </main>
  );
}
