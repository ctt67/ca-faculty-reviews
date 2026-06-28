interface FacultySchema {
  slug: string;
  faculty_name: string;
  subject: string;
  level: string;
  reviewCount: number;
  rating: number;
}

export function generateFacultySchema(faculty: FacultySchema) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",

    name: faculty.faculty_name,

    description: `${faculty.level.toUpperCase()} ${faculty.subject.toUpperCase()} Faculty`,

    url: `https://careviews.in/faculty/${faculty.slug}`,

    knowsAbout: faculty.subject,

    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: faculty.rating,
      reviewCount: faculty.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  };
}