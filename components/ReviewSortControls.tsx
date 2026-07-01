"use client";

import { useRouter } from "next/navigation";

const SORTS = [
  { value: "newest",  label: "Newest" },
  { value: "helpful", label: "Most Helpful" },
  { value: "highest", label: "Highest Rated" },
  { value: "lowest",  label: "Lowest Rated" },
  { value: "oldest",  label: "Oldest" },
];

export default function ReviewSortControls({
  slug,
  current,
}: {
  slug: string;
  current: string;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      {SORTS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => router.push(`/faculty/${slug}?sort=${value}`)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
            current === value
              ? "bg-navy text-white border-navy"
              : "border-slate-200 text-ink/60 hover:bg-slate-50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
