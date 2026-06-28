import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://careviews.in";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/final`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/inter`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/foundation`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const { data: faculties } = await supabase
    .from("faculties")
    .select("slug")
    .eq("active", true);

  const { data: subjects } = await supabase
    .from("faculties")
    .select("level, subject")
    .eq("active", true);

  const uniqueSubjects = [
    ...new Map(
      (subjects ?? []).map((item) => [
        `${item.level}-${item.subject}`,
        item,
      ])
    ).values(),
  ];

  const subjectPages = uniqueSubjects.map((item) => ({
    url: `${baseUrl}/${item.level.toLowerCase()}/${item.subject.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  const facultyPages =
    faculties?.map((faculty) => ({
      url: `${baseUrl}/faculty/${faculty.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })) ?? [];

  return [...staticPages, ...facultyPages, ...subjectPages];
}