import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { BASE_URL } from "@/lib/config";
import { GUIDE_TOPICS } from "@/lib/guide-content";

const SITE_LAUNCH = new Date("2025-01-01");
const GUIDE_LAUNCH = new Date("2026-07-02");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Single query for faculties — need slug, level, subject for subject pages + compare pairs
  const { data: faculties } = await supabase
    .from("faculties")
    .select("slug, level, subject")
    .eq("active", true);

  // Pull approved review timestamps to compute real lastModified per faculty page
  const { data: reviews } = await supabase
    .from("reviews")
    .select("faculty_slug, created_at")
    .eq("approved", true);

  // Build faculty_slug → latest approved review date
  const lastReviewDate = new Map<string, Date>();
  for (const r of reviews ?? []) {
    const d = new Date(r.created_at);
    const existing = lastReviewDate.get(r.faculty_slug);
    if (!existing || d > existing) lastReviewDate.set(r.faculty_slug, d);
  }

  const facultyList = faculties ?? [];
  const facultiesWithReviews = new Set(lastReviewDate.keys());

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                             lastModified: new Date(),   changeFrequency: "daily",   priority: 1    },
    { url: `${BASE_URL}/final`,                  lastModified: SITE_LAUNCH,  changeFrequency: "weekly",  priority: 0.9  },
    { url: `${BASE_URL}/inter`,                  lastModified: SITE_LAUNCH,  changeFrequency: "weekly",  priority: 0.9  },
    { url: `${BASE_URL}/foundation`,             lastModified: SITE_LAUNCH,  changeFrequency: "weekly",  priority: 0.9  },
    { url: `${BASE_URL}/compare`,                lastModified: SITE_LAUNCH,  changeFrequency: "weekly",  priority: 0.75 },
    { url: `${BASE_URL}/guide`,                  lastModified: GUIDE_LAUNCH, changeFrequency: "monthly", priority: 0.85 },
    ...GUIDE_TOPICS.map((t) => ({
      url: `${BASE_URL}/guide/${t.slug}`,
      lastModified: GUIDE_LAUNCH,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${BASE_URL}/about`,                  lastModified: SITE_LAUNCH,  changeFrequency: "monthly", priority: 0.6  },
    { url: `${BASE_URL}/add-faculty`,            lastModified: SITE_LAUNCH,  changeFrequency: "monthly", priority: 0.5  },
    { url: `${BASE_URL}/guidelines`,             lastModified: SITE_LAUNCH,  changeFrequency: "monthly", priority: 0.4  },
    { url: `${BASE_URL}/community-guidelines`,   lastModified: SITE_LAUNCH,  changeFrequency: "monthly", priority: 0.4  },
    { url: `${BASE_URL}/privacy`,                lastModified: SITE_LAUNCH,  changeFrequency: "monthly", priority: 0.3  },
    { url: `${BASE_URL}/terms`,                  lastModified: SITE_LAUNCH,  changeFrequency: "monthly", priority: 0.3  },
  ];

  // ── Faculty pages — lastModified from actual review dates ─────────────────
  const facultyPages: MetadataRoute.Sitemap = facultyList.map((f) => ({
    url: `${BASE_URL}/faculty/${f.slug}`,
    lastModified: lastReviewDate.get(f.slug) ?? SITE_LAUNCH,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // ── Subject pages ─────────────────────────────────────────────────────────
  // Build subject key → latest review date across all faculties in that subject
  const subjectLastReview = new Map<string, Date>();
  for (const f of facultyList) {
    const key = `${f.level.toLowerCase()}-${f.subject.toLowerCase()}`;
    const d = lastReviewDate.get(f.slug);
    if (d) {
      const existing = subjectLastReview.get(key);
      if (!existing || d > existing) subjectLastReview.set(key, d);
    }
  }

  const uniqueSubjects = [
    ...new Map(facultyList.map((f) => [`${f.level}-${f.subject}`, f])).values(),
  ];

  const subjectPages: MetadataRoute.Sitemap = uniqueSubjects.map((f) => {
    const key = `${f.level.toLowerCase()}-${f.subject.toLowerCase()}`;
    return {
      url: `${BASE_URL}/${f.level.toLowerCase()}/${f.subject.toLowerCase()}`,
      lastModified: subjectLastReview.get(key) ?? SITE_LAUNCH,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    };
  });

  // ── Compare pages — same subject/level, both faculties have reviews ────────
  const comparePages: MetadataRoute.Sitemap = [];
  for (let i = 0; i < facultyList.length; i++) {
    for (let j = i + 1; j < facultyList.length; j++) {
      const f1 = facultyList[i];
      const f2 = facultyList[j];
      if (
        f1.level === f2.level &&
        f1.subject === f2.subject &&
        facultiesWithReviews.has(f1.slug) &&
        facultiesWithReviews.has(f2.slug)
      ) {
        const d1 = lastReviewDate.get(f1.slug)!;
        const d2 = lastReviewDate.get(f2.slug)!;
        const [s1, s2] = [f1.slug, f2.slug].sort();
        comparePages.push({
          url: `${BASE_URL}/compare/${s1}/${s2}`,
          lastModified: d1 > d2 ? d1 : d2,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        });
      }
    }
  }

  return [...staticPages, ...facultyPages, ...subjectPages, ...comparePages];
}
