"use client";

import { useState } from "react";

export default function DetailedComparisonAccordion({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between bg-white rounded-xl shadow-sm px-6 py-4 hover:bg-parchment/60 transition text-left"
      >
        <div>
          <p className="font-semibold text-ink text-sm">Detailed Comparison</p>
          <p className="text-ink/40 text-xs mt-0.5">Full numeric breakdown across all metrics</p>
        </div>
        <span className="text-ink/35 text-sm ml-4 shrink-0">{open ? "▲" : "▼"}</span>
      </button>

      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
