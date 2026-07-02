import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDE_TOPICS, getTopic, type GuideBlock } from "@/lib/guide-content";
import { BASE_URL, SITE_NAME } from "@/lib/config";

export function generateStaticParams() {
  return GUIDE_TOPICS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) return { title: "Not Found", robots: { index: false, follow: false } };
  const url = `${BASE_URL}/guide/${topic.slug}`;
  const title = `${topic.seoTitle} | ${SITE_NAME}`;
  return {
    title,
    description: topic.description,
    alternates: { canonical: url },
    openGraph: {
      title: topic.seoTitle,
      description: topic.description,
      url,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "article",
    },
    twitter: { card: "summary_large_image", title: topic.seoTitle, description: topic.description },
  };
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

function Block({ b }: { b: GuideBlock }) {
  switch (b.t) {
    case "p":
      return <p className="text-ink/75 text-[15.5px] leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: b.html }} />;
    case "subhead":
      return (
        <p className="text-[11px] font-semibold tracking-widest uppercase text-gold mt-8 mb-3">
          {b.label}
        </p>
      );
    case "ul":
      return (
        <ul className="space-y-2.5 mb-4">
          {b.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-ink/75 text-[15px] leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-navy shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: item }} />
            </li>
          ))}
        </ul>
      );
    case "aside":
      return (
        <p
          className="border-l-[3px] border-gold pl-4 py-1 my-4 font-playfair italic text-ink/80 text-[17px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: b.html }}
        />
      );
    case "statement":
      return (
        <p
          className="font-playfair font-bold text-ink text-xl md:text-2xl leading-snug my-6"
          dangerouslySetInnerHTML={{ __html: b.html }}
        />
      );
    case "box":
      return (
        <div className="bg-white border border-slate-200 border-l-[3px] border-l-gold rounded-lg p-5 my-5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-gold mb-2">{b.label}</p>
          <p className="text-ink/70 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: b.html }} />
        </div>
      );
    case "askbox":
      return (
        <div className="bg-navy rounded-xl p-6 my-5 text-white">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-gold mb-3">{b.label}</p>
          <ul className="space-y-2.5">
            {b.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-white/85 text-sm leading-relaxed">
                <span className="text-gold font-bold shrink-0">?</span>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        </div>
      );
    case "ratings":
      return (
        <div className="bg-parchment border border-gold/25 rounded-lg p-5 my-5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-gold mb-2">
            {b.label}
          </p>
          <p className="text-ink/70 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: b.html }} />
          <p className="text-xs mt-3">
            <Link href="/final" className="text-gold font-semibold hover:underline">
              Check these ratings on faculty pages →
            </Link>
          </p>
        </div>
      );
    case "remember":
      return (
        <div className="mt-7 pt-5 border-t border-slate-200">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-ink/40 mb-2">
            One sentence to remember
          </p>
          <blockquote
            className="font-playfair font-bold text-ink text-lg md:text-xl leading-snug"
            dangerouslySetInnerHTML={{ __html: b.html }}
          />
        </div>
      );
  }
}

export default async function GuideTopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  const idx = GUIDE_TOPICS.findIndex((t) => t.slug === topic.slug);
  const prev = idx > 0 ? GUIDE_TOPICS[idx - 1] : null;
  const next = idx < GUIDE_TOPICS.length - 1 ? GUIDE_TOPICS[idx + 1] : null;

  const remember = topic.blocks.find((b) => b.t === "remember");
  const askbox = topic.blocks.find((b) => b.t === "askbox");

  const jsonLd: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: topic.seoTitle,
      description: topic.description,
      author: { "@type": "Organization", name: SITE_NAME, url: BASE_URL },
      publisher: { "@type": "Organization", name: SITE_NAME, url: BASE_URL },
      mainEntityOfPage: `${BASE_URL}/guide/${topic.slug}`,
      isPartOf: { "@type": "CreativeWorkSeries", name: "The CA Faculty Buying Guide", url: `${BASE_URL}/guide` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Buying Guide", item: `${BASE_URL}/guide` },
        { "@type": "ListItem", position: 3, name: topic.title, item: `${BASE_URL}/guide/${topic.slug}` },
      ],
    },
  ];

  if (remember && remember.t === "remember") {
    const faq: { "@type": string; name: string; acceptedAnswer: object }[] = [
      {
        "@type": "Question",
        name: topic.seoTitle,
        acceptedAnswer: { "@type": "Answer", text: stripTags(remember.html) },
      },
    ];
    if (askbox && askbox.t === "askbox") {
      faq.push({
        "@type": "Question",
        name: `What should I ask before paying for this?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: askbox.items.map(stripTags).join(" "),
        },
      });
    }
    jsonLd.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq });
  }

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-9 md:py-12">
          <Link href="/guide" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-5 transition">
            ← The Buying Guide
          </Link>
          <p className="text-[11px] font-semibold tracking-widest text-gold uppercase mb-3">
            Chapter {String(topic.num).padStart(2, "0")} · {topic.part}
          </p>
          <h1 className="font-playfair text-2xl md:text-4xl font-bold leading-tight">{topic.seoTitle}</h1>
          {/* Answer-first: the takeaway up top for readers and AI engines alike */}
          {remember && remember.t === "remember" && (
            <p
              className="mt-4 text-gold font-playfair italic text-base md:text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: remember.html }}
            />
          )}
        </div>
      </section>

      {/* Body */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-9 md:py-12">
        <article>
          {topic.blocks.map((b, i) => (
            <Block key={i} b={b} />
          ))}
        </article>

        {/* Prev / Next */}
        <nav className="grid sm:grid-cols-2 gap-3 mt-10 pt-6 border-t border-slate-200">
          {prev ? (
            <Link href={`/guide/${prev.slug}`} className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition block">
              <p className="text-[10px] text-ink/35 uppercase tracking-wider font-medium mb-1">← Previous</p>
              <p className="text-sm font-semibold text-ink">{prev.title}</p>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/guide/${next.slug}`} className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition block sm:text-right">
              <p className="text-[10px] text-ink/35 uppercase tracking-wider font-medium mb-1">Next →</p>
              <p className="text-sm font-semibold text-ink">{next.title}</p>
            </Link>
          )}
        </nav>

        {/* Run the check */}
        <div className="bg-navy rounded-2xl px-7 py-7 mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h2 className="font-playfair text-lg font-bold text-white">Run this check on a real faculty.</h2>
            <p className="text-white/55 text-sm mt-1">
              Student ratings and reviews on Careviews are where the guide meets reality.
            </p>
          </div>
          <Link
            href="/final"
            className="shrink-0 bg-gold text-ink px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition"
          >
            Browse Faculties →
          </Link>
        </div>
      </section>
    </main>
  );
}
