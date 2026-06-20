"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "cagargrohan953@gmail.com";

export default function AdminClient() {

    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);

    useEffect(() => {

        const load = async () => {

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (
                !user ||
                user.email?.toLowerCase() !==
                ADMIN_EMAIL.toLowerCase()
            ) {

                setAuthorized(false);
                setLoading(false);

                return;

            }

            setAuthorized(true);

            const { data } = await supabase
                .from("reviews")
                .select("*")
                .eq("approved", false)
                .order("created_at", {
                    ascending: false,
                });

            setReviews(data ?? []);

            setLoading(false);

        };

        load();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            () => {

                load();

            }
        );

        return () => {

            subscription.unsubscribe();

        };

    }, []);
    const approveReview = async (
        reviewId: number
    ) => {

        await supabase
            .from("reviews")
            .update({
                approved: true,
            })
            .eq("id", reviewId);

        setReviews(
            reviews.filter(
                (r) => r.id !== reviewId
            )
        );

    };

    const rejectReview = async (
        reviewId: number
    ) => {

        await supabase
            .from("reviews")
            .delete()
            .eq("id", reviewId);

        setReviews(
            reviews.filter(
                (r) => r.id !== reviewId
            )
        );

    };

    if (loading) {
        return (
            <main className="p-10">
                Loading...
            </main>
        );
    }

    if (!authorized) {

        return (

            <main className="min-h-screen bg-slate-100">

                <section className="bg-slate-900 text-white">

                    <div className="max-w-5xl mx-auto px-6 py-16">

                        <h1 className="text-5xl font-extrabold">
                            Access Denied
                        </h1>

                        <p className="mt-4 text-slate-300">
                            This page is only available to administrators.
                        </p>

                    </div>

                </section>

            </main>

        );

    }

    return (

        <main className="min-h-screen bg-slate-100">

            <section className="bg-slate-900 text-white">

                <div className="max-w-5xl mx-auto px-6 py-16">

                    <h1 className="text-5xl font-extrabold">
                        Pending Reviews
                    </h1>

                    <p className="mt-4 text-slate-300">
                        Review and moderate submitted faculty reviews.
                    </p>

                </div>

            </section>

            <section className="max-w-5xl mx-auto px-6 py-12">

                {reviews.length === 0 ? (

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-12 text-center">

                        <h2 className="text-2xl font-bold text-slate-900">
                            No Pending Reviews
                        </h2>

                        <p className="text-slate-500 mt-3">
                            Everything has been reviewed.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-6">

                        {reviews.map((review) => (

                            <div
                                key={review.id}
                                className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6"
                            >

                                <div className="flex items-start justify-between gap-4">

                                    <div>

                                        <div className="text-sm text-slate-500">
                                            Faculty
                                        </div>

                                        <div className="text-xl font-bold text-slate-900">
                                            {review.faculty_slug}
                                        </div>

                                    </div>

                                    <div className="text-sm text-slate-500">
                                        {new Date(
                                            review.created_at
                                        ).toLocaleString()}
                                    </div>

                                </div>

                                <div className="mt-6">

                                    <div className="text-sm font-semibold text-slate-700 mb-2">
                                        Review
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-4 text-slate-800">
                                        {review.review_text || "No review text provided."}
                                    </div>

                                </div>

                                <div className="mt-6 flex gap-3">

                                    <button
                                        onClick={() =>
                                            approveReview(review.id)
                                        }
                                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-medium transition"
                                    >
                                        Approve
                                    </button>

                                    <button
                                        onClick={() =>
                                            rejectReview(review.id)
                                        }
                                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl font-medium transition"
                                    >
                                        Reject
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>

        </main>

    );

}