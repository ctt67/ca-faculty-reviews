import { supabase } from "@/lib/supabase";
import ReviewForm from "@/components/review-form";

export default async function ReviewPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const ratingFields = [
        {
            key: "understandability",
            label: "Understandability",
        },
        {
            key: "exam_focus",
            label: "Exam Focus",
        },
        {
            key: "study_material_quality",
            label: "Study Material Quality",
        },
        {
            key: "mock_coverage",
            label: "Mock Coverage",
        },
        {
            key: "doubt_resolution",
            label: "Doubt Resolution",
        },
        {
            key: "value_for_money",
            label: "Value For Money",
        },
        {
            key: "notes_quality",
            label: "Notes Quality",
        },
        {
            key: "revision_support",
            label: "Revision Support",
        },
        {
            key: "coverage_of_questions",
            label: "Coverage Of Questions",
        },
        {
            key: "pace_of_teaching",
            label: "Pace Of Teaching",
        },
        {
            key: "technical_quality",
            label: "Technical Quality",
        },
    ];

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