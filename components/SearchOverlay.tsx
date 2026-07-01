"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatSubjectName } from "@/lib/format";
import { track } from "@/lib/track";

type Faculty = {
  slug: string;
  faculty_name: string;
  subject: string;
  level: string;
};

const LEVEL_SHORT: Record<string, string> = {
  final: "Final",
  inter: "Inter",
  foundation: "Foundation",
};

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const didClickResult = useRef(false);

  // Load all faculties once on mount
  useEffect(() => {
    supabase
      .from("faculties")
      .select("slug, faculty_name, subject, level")
      .eq("active", true)
      .then(({ data }) => {
        setFaculties(data ?? []);
        setLoadingFaculties(false);
      });

    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Filter results
  const results =
    query.trim().length === 0
      ? []
      : faculties
          .filter((f) =>
            f.faculty_name.toLowerCase().includes(query.toLowerCase()) ||
            f.subject.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 8);

  // Debounced search tracking
  useEffect(() => {
    if (!query.trim()) return;
    const t = setTimeout(() => {
      track("search_performed", { query: query.trim(), results_count: results.length });
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Reset active index when results change
  useEffect(() => setActiveIndex(0), [results.length]);

  const navigate = useCallback(
    (faculty: Faculty, position: number) => {
      didClickResult.current = true;
      track("search_result_clicked", {
        faculty_slug: faculty.slug,
        query: query.trim(),
        position,
      });
      router.push(`/faculty/${faculty.slug}`);
      onClose();
    },
    [query, router, onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      navigate(results[activeIndex], activeIndex);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[100] bg-ink/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search size={17} className="text-ink/40 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search faculties or subjects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm text-ink placeholder:text-ink/35 focus:outline-none bg-transparent"
          />
          <button onClick={onClose} className="text-ink/40 hover:text-ink transition">
            <X size={17} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto">
          {loadingFaculties ? (
            <p className="text-ink/40 text-sm text-center py-8">Loading…</p>
          ) : query.trim() === "" ? (
            <p className="text-ink/35 text-sm text-center py-8">Start typing to search faculties</p>
          ) : results.length === 0 ? (
            <p className="text-ink/40 text-sm text-center py-8">No faculties match &ldquo;{query}&rdquo;</p>
          ) : (
            <ul>
              {results.map((f, i) => (
                <li key={f.slug}>
                  <button
                    className={`w-full text-left px-4 py-3.5 flex items-center justify-between gap-4 transition ${
                      i === activeIndex ? "bg-parchment" : "hover:bg-slate-50"
                    }`}
                    onClick={() => navigate(f, i)}
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{f.faculty_name}</p>
                      <p className="text-xs text-ink/45 mt-0.5">
                        {formatSubjectName(f.subject)}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold bg-navy/8 text-navy px-2 py-0.5 rounded-full">
                      {LEVEL_SHORT[f.level.toLowerCase()] ?? f.level}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        {results.length > 0 && (
          <div className="border-t border-slate-100 px-4 py-2 flex items-center gap-3 text-[10px] text-ink/30">
            <span>↑↓ navigate</span>
            <span>↵ open</span>
            <span>esc close</span>
          </div>
        )}
      </div>
    </div>
  );
}
