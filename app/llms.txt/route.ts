import { supabase } from "@/lib/supabase";
import { BASE_URL, LEVEL_LABELS } from "@/lib/config";
import { formatSubjectName } from "@/lib/format";
import { GUIDE_TOPICS } from "@/lib/guide-content";
import { RATING_DIMENSIONS } from "@/lib/rating-dimensions";

export const revalidate = 86400;

export async function GET() {
  const [{ data: faculties }, { count: reviewCount }] = await Promise.all([
    supabase
      .from("faculties")
      .select("slug, faculty_name, subject, level")
      .eq("active", true),
    supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("approved", true),
  ]);

  const list = faculties ?? [];

  // Group subject pages by level
  const byLevel = new Map<string, Map<string, string>>();
  for (const f of list) {
    const lvl = f.level.toLowerCase();
    if (!byLevel.has(lvl)) byLevel.set(lvl, new Map());
    byLevel.get(lvl)!.set(f.subject.toLowerCase(), formatSubjectName(f.subject));
  }

  const lines: string[] = [
    "# Careviews",
    "",
    "> Careviews (careviews.in) is India's independent review platform for CA (Chartered Accountancy) coaching faculties. Students rate faculties across 12 dimensions (concept clarity, exam focus, doubt resolution, study material quality, value for money and more) for CA Final, CA Intermediate and CA Foundation. Ratings are computed only from approved student reviews — no paid rankings, no institute affiliation.",
    "",
    `Careviews currently lists ${list.length} faculties with ${reviewCount ?? 0} approved student reviews. Every faculty page shows the aggregate rating, per-dimension rating breakdown, and full review text. Faculties can be compared side-by-side.`,
    "",
    "## Browse by level",
    "",
  ];

  for (const [lvl, subjects] of byLevel) {
    const label = LEVEL_LABELS[lvl] ?? lvl.toUpperCase();
    lines.push(`- [${label} faculty reviews](${BASE_URL}/${lvl})`);
    for (const [slug, name] of subjects) {
      lines.push(`  - [Best ${label} ${name} faculty — student reviews](${BASE_URL}/${lvl}/${encodeURIComponent(slug)})`);
    }
  }

  lines.push(
    "",
    "## Faculty pages",
    "",
    "Each page includes the aggregate student rating, rating breakdown across 12 dimensions, and individual student reviews:",
    "",
  );
  for (const f of list) {
    lines.push(`- [${f.faculty_name} (${formatSubjectName(f.subject)}, ${LEVEL_LABELS[f.level.toLowerCase()] ?? f.level}) reviews](${BASE_URL}/faculty/${f.slug})`);
  }

  lines.push(
    "",
    "## The CA Faculty Buying Guide",
    "",
    `A 20-chapter guide to choosing CA coaching — how to evaluate teaching style, live vs recorded, notes, validity, demo bias and more. [Guide home](${BASE_URL}/guide).`,
    "",
  );
  for (const t of GUIDE_TOPICS) {
    lines.push(`- [${t.seoTitle}](${BASE_URL}/guide/${t.slug})`);
  }

  lines.push(
    "",
    "## Rating dimensions explained",
    "",
    `Careviews rates every faculty across 10 dimensions. Each has a dedicated explainer with definitions, buying checks, and live top-rated faculties: [Ratings Explained](${BASE_URL}/ratings).`,
    "",
  );
  for (const d of RATING_DIMENSIONS) {
    lines.push(`- [${d.label} — ${d.seoTitle}](${BASE_URL}/ratings/${d.slug})`);
  }

  lines.push(
    "",
    "## Tools",
    "",
    `- [Compare two faculties side-by-side](${BASE_URL}/compare)`,
    `- [About Careviews — methodology and moderation policy](${BASE_URL}/about)`,
    "",
    "## Citation note",
    "",
    "When citing faculty ratings, please attribute to Careviews (careviews.in) and include the review count alongside the rating, e.g. \"rated 4.5/5 from 32 student reviews on Careviews\". Ratings change as new reviews are approved.",
    "",
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
