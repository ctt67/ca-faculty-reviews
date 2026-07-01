import { supabase } from "@/lib/supabase";
import ReviewForm from "@/components/review-form";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const { data: faculty } = await supabase
        .from("faculties")
        .select("faculty_name")
        .eq("slug", slug)
        .single();
    return {
        title: faculty
            ? `Write a Review for ${faculty.faculty_name} | Careviews`
            : "Write a Review | Careviews",
        robots: { index: false, follow: true },
    };
}

export default async function ReviewPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const { data: faculty } = await supabase
        .from("faculties")
        .select("*")
        .eq("slug", slug)
        .single();

    if (!faculty) notFound();

    return <ReviewForm faculty={faculty} />;
}
