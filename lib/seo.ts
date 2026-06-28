import type { Metadata } from "next";

const SITE_NAME = "CA Reviews";
const BASE_URL = "https://careviews.in";

interface FacultySEO {
    slug: string;
    faculty_name: string;
    subject: string;
    level: string;
}

export function generateFacultyMetadata(
    faculty: FacultySEO
): Metadata {
    const title = `${faculty.faculty_name} ${faculty.subject} Reviews (2026) | ${faculty.level} | ${SITE_NAME}`;

    const description =
        `Read verified student reviews, ratings, teaching style, fees, batches and experiences for ${faculty.faculty_name}. Compare before choosing your CA faculty.`;

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
            type: "website",
        },

        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}