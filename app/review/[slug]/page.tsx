import { supabase } from "@/lib/supabase";
import ReviewForm from "@/components/review-form";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Write a Review | CareViews",
        robots: {
            index: false,
            follow: true,
        },
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

    if (!faculty) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <h1 className="font-playfair text-3xl font-bold text-ink">
                    Faculty not found
                </h1>
            </main>
        );
    }



    return <ReviewForm faculty={faculty} />;

}