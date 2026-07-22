import type { Metadata } from "next";
import { SITE_NAME, BASE_URL, LEVEL_LABELS } from "./config";
import { formatSubjectName } from "./format";

const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "Careviews" };

const YEAR = new Date().getFullYear();

function levelLabel(level: string): string {
  return LEVEL_LABELS[level.toLowerCase()] ?? `CA ${level.charAt(0).toUpperCase()}${level.slice(1).toLowerCase()}`;
}

interface FacultySEO {
  slug: string;
  faculty_name: string;
  subject: string;
  level: string;
}

export interface RatingStats {
  avgRating: number;
  reviewCount: number;
}

export function computeRatingStats(
  rows: { overall_rating: unknown }[] | null,
): RatingStats | undefined {
  const ratings = (rows ?? [])
    .map((r) => r.overall_rating)
    .filter((n): n is number => typeof n === "number");
  if (ratings.length === 0) return undefined;
  return {
    avgRating: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
    reviewCount: ratings.length,
  };
}

export function generateFacultyMetadata(
  faculty: FacultySEO,
  stats?: RatingStats,
): Metadata {
  const subjectLabel = formatSubjectName(faculty.subject);
  const title = `${faculty.faculty_name} — ${subjectLabel} Reviews (${YEAR}) | ${levelLabel(faculty.level)} | ${SITE_NAME}`;
  const description = stats && stats.reviewCount > 0
    ? `Rated ${stats.avgRating}/5 by ${stats.reviewCount} CA ${stats.reviewCount === 1 ? "student" : "students"} on ${SITE_NAME}. Student reviews for ${faculty.faculty_name} (${subjectLabel}, ${levelLabel(faculty.level)}). See teaching style, detailed ratings, and student experiences before you decide.`
    : `Student reviews and ratings for ${faculty.faculty_name} (${subjectLabel}, ${levelLabel(faculty.level)}). See teaching style, detailed student ratings, and student experiences before you decide.`;
  const url = `${BASE_URL}/faculty/${faculty.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, locale: "en_IN", type: "website",
      images: [{ ...OG_IMAGE, url: `${BASE_URL}/faculty/${faculty.slug}/opengraph-image` }] },
    twitter: { card: "summary_large_image", title, description,
      images: [`${BASE_URL}/faculty/${faculty.slug}/opengraph-image`] },
    robots: { index: true, follow: true },
  };
}

interface SubjectSEO {
  subject: string;
  level: string;
}

export function generateSubjectMetadata(
  page: SubjectSEO,
  stats?: { facultyCount: number; reviewCount: number },
): Metadata {
  const level = levelLabel(page.level);
  const subject = formatSubjectName(page.subject);
  const title = `Best ${level} ${subject} Faculty (${YEAR}) — Ranked by Student Reviews | ${SITE_NAME}`;
  const description = stats && stats.reviewCount > 0
    ? `${stats.facultyCount} ${level} ${subject} ${stats.facultyCount === 1 ? "faculty" : "faculties"} ranked by ${stats.reviewCount} student ${stats.reviewCount === 1 ? "review" : "reviews"} on ${SITE_NAME}. Compare teaching styles, detailed student ratings and student experiences.`
    : `Compare ${level} ${subject} faculties with student reviews, detailed student ratings, teaching styles and student experiences.`;
  const url = `${BASE_URL}/${page.level.toLowerCase()}/${page.subject.toLowerCase()}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, locale: "en_IN", type: "website" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

export function generateLevelMetadata(level: string): Metadata {
  const label = levelLabel(level);
  const title = `${label} Faculty Reviews (${YEAR}) | ${SITE_NAME}`;
  const description = `Browse all ${label} subjects and compare faculties using student reviews, ratings and student experiences.`;
  const url = `${BASE_URL}/${level.toLowerCase()}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, locale: "en_IN", type: "website" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

interface CompareSEO {
  faculty1: string;
  faculty2: string;
  faculty1Slug: string;
  faculty2Slug: string;
  subject: string;
  level: string;
}

export function generateCompareMetadata(
  page: CompareSEO,
  stats?: { faculty1: RatingStats; faculty2: RatingStats },
): Metadata {
  const title = `${page.faculty1} vs ${page.faculty2} — ${formatSubjectName(page.subject)} Reviews (${YEAR}) | ${SITE_NAME}`;
  const description = stats
    ? `${page.faculty1} rated ${stats.faculty1.avgRating}/5 by ${stats.faculty1.reviewCount} ${stats.faculty1.reviewCount === 1 ? "student" : "students"} vs ${page.faculty2} ${stats.faculty2.avgRating}/5 by ${stats.faculty2.reviewCount} on ${SITE_NAME}. Compare ${formatSubjectName(page.subject)} teaching styles, detailed ratings and student experiences side-by-side.`
    : `Compare ${page.faculty1} and ${page.faculty2} side-by-side using student reviews, detailed student ratings and student experiences.`;
  const url = `${BASE_URL}/compare/${page.faculty1Slug}/${page.faculty2Slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, locale: "en_IN", type: "website" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

interface CompareJsonLdInput {
  faculty1: { name: string; slug: string };
  faculty2: { name: string; slug: string };
  subject: string;
  level: string;
  stats1?: RatingStats;
  stats2?: RatingStats;
  // Pre-computed verdict sentence from the page — already attributed/counted
  // ("Across N approved student reviews on Careviews, students currently
  // rate X higher..."). This function never invents its own comparative claim.
  verdict: string | null;
}

// Every Q&A pair here is a restatement of a number already visible on the
// page (star rating, review count, or the existing verdict sentence) —
// never a first-party opinion about a named faculty. Keep it that way:
// no new question should ever resolve to an unattributed yes/no claim.
export function generateCompareFAQ(
  input: CompareJsonLdInput,
): { q: string; a: string }[] {
  const subjectLabel = formatSubjectName(input.subject);
  const faq: { q: string; a: string }[] = [];

  if (input.verdict) {
    faq.push({
      q: `Who do students rate higher for ${subjectLabel}, ${input.faculty1.name} or ${input.faculty2.name}?`,
      a: input.verdict,
    });
  }

  for (const [f, stats] of [
    [input.faculty1, input.stats1],
    [input.faculty2, input.stats2],
  ] as const) {
    if (!stats || stats.reviewCount === 0) continue;
    faq.push({
      q: `What rating does ${f.name} have on Careviews?`,
      a: `${f.name} is rated ${stats.avgRating}/5 by ${stats.reviewCount} CA ${stats.reviewCount === 1 ? "student" : "students"} on Careviews for ${subjectLabel}.`,
    });
  }

  return faq;
}

export function generateCompareJsonLd(input: CompareJsonLdInput): Record<string, unknown>[] {
  const subjectLabel = formatSubjectName(input.subject);
  const jsonLd: Record<string, unknown>[] = [];

  // AggregateRating, one Course block per faculty that has reviews — the
  // identical shape already live (and legally cleared) on faculty pages,
  // just reused here rather than a new claim being invented.
  for (const [f, stats] of [
    [input.faculty1, input.stats1],
    [input.faculty2, input.stats2],
  ] as const) {
    if (!stats || stats.reviewCount === 0) continue;
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "Course",
      name: `${subjectLabel} by ${f.name} (${levelLabel(input.level)})`,
      description: `${levelLabel(input.level)} ${subjectLabel} coaching by ${f.name}, rated by CA students on Careviews.`,
      provider: { "@type": "Organization", name: f.name },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: stats.avgRating.toFixed(1),
        reviewCount: stats.reviewCount,
        bestRating: "5",
        worstRating: "1",
      },
    });
  }

  const faq = generateCompareFAQ(input);
  if (faq.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    });
  }

  return jsonLd;
}
