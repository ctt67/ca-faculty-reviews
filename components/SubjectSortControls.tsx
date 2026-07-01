"use client";

import { useRouter } from "next/navigation";

const SORTS = [
  { value: "most_reviewed",  label: "Most Reviewed" },
  { value: "highest_rated",  label: "Highest Rated" },
  { value: "recent",         label: "Recently Reviewed" },
  { value: "az",             label: "A → Z" },
  { value: "za",             label: "Z → A" },
];

export default function SubjectSortControls({
  level,
  subject,
  current,
}: {
  level: string;
  subject: string;
  current: string;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {SORTS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => router.push(`/${level}/${subject}?sort=${value}`)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
            current === value
              ? "bg-white text-navy border-white"
              : "border-white/20 text-white/60 hover:bg-white/10"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
