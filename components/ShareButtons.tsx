"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { BASE_URL } from "@/lib/config";
import { track } from "@/lib/track";

export default function ShareButtons({
  facultySlug,
  facultyName,
}: {
  facultySlug: string;
  facultyName: string;
}) {
  const [copied, setCopied] = useState(false);
  const pageUrl = `${BASE_URL}/faculty/${facultySlug}`;

  const waText = `Check out ${facultyName} on Careviews — student reviews and ratings.\n${pageUrl}?utm_source=whatsapp`;
  const tgUrl  = `https://t.me/share/url?url=${encodeURIComponent(`${pageUrl}?utm_source=telegram`)}&text=${encodeURIComponent(`Check out ${facultyName} on Careviews`)}`;
  const waUrl  = `https://wa.me/?text=${encodeURIComponent(waText)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    track("share_clicked", { share_source: "copy_link_faculty_page", faculty_slug: facultySlug });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-white/40 text-xs flex items-center gap-1.5 mr-0.5">
        <Share2 size={12} /> Share
      </span>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("share_clicked", { share_source: "whatsapp_faculty_page", faculty_slug: facultySlug })}
        className="text-xs px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-semibold hover:opacity-90 transition"
      >
        WhatsApp
      </a>
      <a
        href={tgUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("share_clicked", { share_source: "telegram_faculty_page", faculty_slug: facultySlug })}
        className="text-xs px-3 py-1.5 rounded-lg bg-[#2CA5E0] text-white font-semibold hover:opacity-90 transition"
      >
        Telegram
      </a>
      <button
        onClick={handleCopy}
        className="text-xs px-3 py-1.5 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition flex items-center gap-1"
      >
        {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy Link</>}
      </button>
    </div>
  );
}
