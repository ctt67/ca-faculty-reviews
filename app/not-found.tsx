import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | Careviews",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <Image
        src="/20260101_200053.jpg"
        alt="Oreo"
        width={120}
        height={120}
        className="rounded-full object-cover mb-6 border-2 border-gold/30"
      />
      <h1 className="font-playfair text-3xl font-bold text-ink mb-2">Nothing here.</h1>
      <p className="text-ink/45 text-sm mb-8">Oreo looked everywhere. Still nothing.</p>
      <a
        href="/"
        className="bg-gold text-ink px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition"
      >
        Back to Home →
      </a>
    </main>
  );
}
