"use client";

import { useRouter } from "next/navigation";

export default function ReviewFilters({
  slug,
  sort,
  currentAttempt,
  currentCourseType,
  attempts,
  courseTypes,
}: {
  slug: string;
  sort: string;
  currentAttempt: string;
  currentCourseType: string;
  attempts: string[];
  courseTypes: string[];
}) {
  const router = useRouter();

  if (attempts.length <= 1 && courseTypes.length <= 1) return null;

  const go = (attempt: string, courseType: string) => {
    const p = new URLSearchParams();
    if (sort && sort !== "newest") p.set("sort", sort);
    if (attempt)    p.set("attempt", attempt);
    if (courseType) p.set("course_type", courseType);
    const qs = p.toString();
    router.push(`/faculty/${slug}${qs ? `?${qs}` : ""}`);
  };

  const hasActiveFilter = currentAttempt || currentCourseType;

  const selectCls =
    "text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-ink/70 focus:outline-none focus:ring-2 focus:ring-navy cursor-pointer";

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      <span className="text-xs text-ink/40 font-medium mr-1">Filter:</span>

      {attempts.length > 1 && (
        <select
          value={currentAttempt}
          onChange={(e) => go(e.target.value, currentCourseType)}
          className={selectCls}
        >
          <option value="">All Attempts</option>
          {attempts.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      )}

      {courseTypes.length > 1 && (
        <select
          value={currentCourseType}
          onChange={(e) => go(currentAttempt, e.target.value)}
          className={selectCls}
        >
          <option value="">All Courses</option>
          {courseTypes.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}

      {hasActiveFilter && (
        <button
          onClick={() => go("", "")}
          className="text-xs text-ink/40 hover:text-ink/70 underline transition"
        >
          Clear
        </button>
      )}
    </div>
  );
}
