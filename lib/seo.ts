import type { Metadata } from "next";

const SITE_NAME = "CA Reviews";
const BASE_URL = "https://careviews.in";
const CURRENT_YEAR = new Date().getFullYear();

interface FacultySEO {
  slug: string;
  faculty_name: string;
  subject: string;
  level: string;
}

interface SubjectSEO {
  subject: string;
  level: string;
}

export function generateFacultyMetadata(
  faculty: FacultySEO
): Metadata {
  const title = `${faculty.faculty_name} ${faculty.subject} Reviews (${CURRENT_YEAR}) | ${faculty.level.toUpperCase()} | ${SITE_NAME}`;

  const description = `Read verified student reviews, ratings, teaching style, fees, batches, language and student experiences for ${faculty.faculty_name}. Compare before choosing your CA faculty.`;

  const url = `${BASE_URL}/faculty/${faculty.slug}`;

  return {
    title,
    description,

    alternates: {
      canonical: url,
    },

    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generateSubjectMetadata(
  page: SubjectSEO
): Metadata {
  const title = `Best ${page.level.toUpperCase()} ${page.subject.toUpperCase()} Faculties (${CURRENT_YEAR}) | Student Reviews | ${SITE_NAME}`;

  const description = `Compare the best ${page.level.toUpperCase()} ${page.subject.toUpperCase()} faculties using verified student reviews, ratings, teaching styles and experiences.`;

  const url = `${BASE_URL}/${page.level.toLowerCase()}/${page.subject.toLowerCase()}`;

  return {
    title,
    description,

    alternates: {
      canonical: url,
    },

    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}