import { supabase } from "@/lib/supabase";
import ReviewForm from "@/components/review-form";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Write a Review | CA Reviews",
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
            <main className="min-h-screen bg-slate-100 flex items-center justify-center">
                <h1 className="text-3xl font-bold text-slate-900">
                    Faculty not found
                </h1>
            </main>
        );
    }



    return (<main className="min-h-screen bg-slate-100">


        <ReviewForm faculty={faculty} />

    </main>


    );

}