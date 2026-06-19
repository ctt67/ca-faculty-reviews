"use client";
import { useState } from "react";
export default function ReviewForm({
    faculty,
}: {
    faculty: any;
}) {

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

    const [formData, setFormData] = useState({
        attempt: "",
        student_type: "",
        course_type: "",
        teacher_style: "",
        best_for: [] as string[],
        would_recommend: "",
        pros: "",
        cons: "",
        review_text: "",
    });

    const [ratings, setRatings] = useState<
        Record<string, number>
    >({});

    const [ratingReasons, setRatingReasons] = useState<
        Record<string, string>
    >({});



    return (<main className="min-h-screen bg-slate-100">


        <section className="bg-slate-900 text-white">

            <div className="max-w-6xl mx-auto px-6 py-16">

                <h1 className="text-5xl font-extrabold">
                    Write a Review
                </h1>

                <p className="mt-4 text-slate-300">
                    Help fellow CA students make better decisions.
                </p>

            </div>

        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">

            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6">

                <div className="text-sm text-slate-500">
                    Reviewing
                </div>

                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                    {faculty.faculty_name}
                </h2>

                <p className="text-slate-500 mt-2">
                    Share your experience with this faculty.
                </p>

                <div className="flex gap-2 mt-4 flex-wrap">

                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {faculty.level}
                    </span>

                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                        {faculty.subject}
                    </span>

                </div>

            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 mt-8">

                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    Your Background
                </h2>

                <div className="grid md:grid-cols-3 gap-5">

                    <div>

                        <label className="block mb-2 text-sm font-semibold text-slate-700">
                            Attempt
                        </label>

                        <select
                            value={formData.attempt}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    attempt: e.target.value
                                })
                            }
                            className="w-full border border-slate-200 rounded-xl p-3.5 text-slate-900 bg-white"
                        >
                            <option value="">
                                Select Attempt
                            </option>
                            <option value="First Attempt">First Attempt</option>
                            <option value="Second Attempt">Second Attempt</option>
                            <option value="Third Attempt+">Third Attempt+</option>
                        </select>

                    </div>

                    <div>

                        <label className="block mb-2 text-sm font-semibold text-slate-700">
                            Student Type
                        </label>

                        <select
                            value={formData.student_type}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    student_type: e.target.value
                                })
                            }
                            className="w-full border border-slate-200 rounded-xl p-3.5 text-slate-900 bg-white"
                        >
                            <option value="">
                                Select Student Type
                            </option>
                            <option value="Full Time Student">Full Time Student</option>
                            <option value="Working Professional">Working Professional</option>
                            <option value="Self Study">Self Study</option>
                        </select>

                    </div>

                    <div>

                        <label className="block mb-2 text-sm font-semibold text-slate-700">
                            Course Type
                        </label>

                        <select
                            value={formData.course_type}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    course_type: e.target.value
                                })
                            }
                            className="w-full border border-slate-200 rounded-xl p-3.5 text-slate-900 bg-white"
                        >
                            <option value="">
                                Select Course Type
                            </option>
                            <option value="Regular">Regular</option>
                            <option value="Fast Track">Fast Track</option>
                        </select>

                    </div>

                </div>

            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 mt-8">

                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    Faculty Fit
                </h2>

                <div className="space-y-6">

                    <div>

                        <label className="block mb-2 text-sm font-semibold text-slate-700">
                            Teaching Style
                        </label>

                        <select
                            value={formData.teacher_style}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    teacher_style: e.target.value,
                                })
                            }
                            className="w-full border border-slate-200 rounded-xl p-3.5 text-slate-900 bg-white"
                        >
                            <option value="">
                                Select Teaching Style
                            </option>

                            <option value="Conceptual">
                                Conceptual
                            </option>

                            <option value="Exam Focused">
                                Exam Focused
                            </option>

                            <option value="Balanced">
                                Balanced
                            </option>

                            <option value="Fast Revision">
                                Fast Revision
                            </option>

                        </select>

                    </div>

                    <div>

                        <label className="block mb-4 text-sm font-semibold text-slate-700">
                            Best For
                        </label>

                        <div className="flex flex-wrap gap-3">

                            {[
                                "First Attempt",
                                "Multiple Attempts",
                                "Working Professionals",
                                "Rankers",
                                "Concept Building",
                                "Fast Revision",
                                "Last Day Revision",
                            ].map((option) => (

                                <label
                                    key={option}
                                    className="px-4 py-2 border border-slate-200 rounded-full cursor-pointer hover:bg-slate-50 transition text-slate-900 font-medium"
                                >

                                    <input
                                        type="checkbox"
                                        className="mr-2"
                                        checked={formData.best_for.includes(option)}
                                        onChange={(e) => {

                                            if (e.target.checked) {

                                                setFormData({
                                                    ...formData,
                                                    best_for: [
                                                        ...formData.best_for,
                                                        option,
                                                    ],
                                                });

                                            } else {

                                                setFormData({
                                                    ...formData,
                                                    best_for:
                                                        formData.best_for.filter(
                                                            (item) =>
                                                                item !== option
                                                        ),
                                                });

                                            }

                                        }}
                                    />

                                    {option}

                                </label>

                            ))}

                        </div>



                    </div>

                </div>

            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 mt-8">

                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Ratings
                </h2>

                <p className="text-slate-500 mb-8">
                    Rate each aspect and optionally explain your rating.
                </p>

                <div className="space-y-8">

                    {ratingFields.map((field) => (

                        <div
                            key={field.key}
                            className="border border-slate-100 rounded-2xl p-5"
                        >

                            <label className="block text-sm font-semibold text-slate-900 mb-3">
                                {field.label}
                            </label>

                            <select
                                value={ratings[field.key] ?? ""}
                                onChange={(e) =>
                                    setRatings({
                                        ...ratings,
                                        [field.key]: Number(e.target.value),
                                    })
                                }
                                className="w-full border border-slate-200 rounded-xl p-3 text-slate-900 bg-white"
                            >
                                <option value="">
                                    Select Rating
                                </option>

                                <option value="5">
                                    Excellent
                                </option>

                                <option value="4">
                                    Good
                                </option>

                                <option value="3">
                                    Average
                                </option>

                                <option value="2">
                                    Poor
                                </option>

                                <option value="1">
                                    Very Poor
                                </option>

                            </select>

                            <textarea
                                rows={3}
                                value={
                                    ratingReasons[field.key] ?? ""
                                }
                                onChange={(e) =>
                                    setRatingReasons({
                                        ...ratingReasons,
                                        [field.key]:
                                            e.target.value,
                                    })
                                }
                                placeholder="Why? (Optional)"
                                className="mt-4 w-full border border-slate-200 rounded-xl p-3 text-slate-900 placeholder:text-slate-400"
                            />

                        </div>

                    ))}

                </div>

            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 mt-8">

                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Detailed Review
                </h2>

                <p className="text-slate-500 mb-8">
                    Tell future students about your experience.
                </p>

                <div className="space-y-6">

                    <div>

                        <label className="block mb-3 text-sm font-semibold text-slate-700">
                            Would You Recommend This Faculty?
                        </label>

                        <div className="flex gap-4">

                            <label className="border border-slate-200 rounded-xl px-5 py-3 cursor-pointer text-slate-900">
                                <input
                                    type="radio"
                                    name="recommend"
                                    className="mr-2"
                                    checked={
                                        formData.would_recommend === "Yes"
                                    }
                                    onChange={() =>
                                        setFormData({
                                            ...formData,
                                            would_recommend: "Yes",
                                        })
                                    }
                                />
                                Yes
                            </label>

                            <label className="border border-slate-200 rounded-xl px-5 py-3 cursor-pointer text-slate-900">
                                <input
                                    type="radio"
                                    name="recommend"
                                    className="mr-2"
                                    checked={
                                        formData.would_recommend === "No"
                                    }
                                    onChange={() =>
                                        setFormData({
                                            ...formData,
                                            would_recommend: "No",
                                        })
                                    }
                                />
                                No
                            </label>

                        </div>

                    </div>

                    <div>

                        <label className="block mb-2 text-sm font-semibold text-slate-700">
                            Pros
                        </label>

                        <textarea
                            rows={4}
                            value={formData.pros}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    pros: e.target.value,
                                })
                            }
                            placeholder="What did the faculty do well?"
                            className="w-full border border-slate-200 rounded-xl p-3 text-slate-900 placeholder:text-slate-400"
                        />

                    </div>

                    <div>

                        <label className="block mb-2 text-sm font-semibold text-slate-700">
                            Cons
                        </label>

                        <textarea
                            rows={4}
                            value={formData.cons}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    cons: e.target.value,
                                })
                            }
                            placeholder="What could have been improved?"
                            className="w-full border border-slate-200 rounded-xl p-3 text-slate-900 placeholder:text-slate-400"
                        />

                    </div>

                    <div>

                        <label className="block mb-2 text-sm font-semibold text-slate-700">
                            Overall Review
                        </label>

                        <textarea
                            rows={8}
                            value={formData.review_text}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    review_text: e.target.value,
                                })
                            }
                            placeholder="Describe your overall experience with this faculty..."
                            className="w-full border border-slate-200 rounded-xl p-3 text-slate-900 placeholder:text-slate-400"
                        />

                    </div>

                </div>

            </div>


            <div className="mt-8 mb-16">

                <button
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-blue-700 transition"
                >
                    Submit Review
                </button>

            </div>



        </section>

    </main>


    );
}