import type { Metadata } from "next";
import { SITE_NAME, BASE_URL, LEVEL_LABELS } from "./config";
import { formatSubjectName } from "./format";

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

export function generateFacultyMetadata(faculty: FacultySEO): Metadata {
  const title = `${faculty.faculty_name} — ${faculty.subject} Reviews (${YEAR}) | ${levelLabel(faculty.level)} | ${SITE_NAME}`;
  const description = `Verified student reviews and ratings for ${faculty.faculty_name} (${faculty.subject}, ${levelLabel(faculty.level)}). See teaching style, ratings across 12 metrics, and real student experiences before you decide.`;
  const url = `${BASE_URL}/faculty/${faculty.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, locale: "en_IN", type: "website" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

interface SubjectSEO {
  subject: string;
  level: string;
}

export function generateSubjectMetadata(page: SubjectSEO): Metadata {
  const level = levelLabel(page.level);
  const subject = formatSubjectName(page.subject);
  const title = `Best ${level} ${subject} Faculty (${YEAR}) | Student Reviews | ${SITE_NAME}`;
  const description = `Compare ${level} ${subject} faculties with verified student reviews, ratings across 12 metrics, teaching styles and real student experiences.`;
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
  const description = `Browse all ${label} subjects and compare faculties using verified student reviews, ratings and real student experiences.`;
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

export function generateCompareMetadata(page: CompareSEO): Metadata {
  const title = `${page.faculty1} vs ${page.faculty2} — ${formatSubjectName(page.subject)} Reviews (${YEAR}) | ${SITE_NAME}`;
  const description = `Compare ${page.faculty1} and ${page.faculty2} side-by-side using verified student reviews, ratings across 12 metrics and real student experiences.`;
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
