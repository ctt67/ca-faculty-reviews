"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { INSTAGRAM_URL, TELEGRAM_URL, WHATSAPP_URL } from "@/lib/config";

const DISMISSED_KEY = "cv_community_dismissed";

const PLATFORMS = [
  {
    name: "Instagram",
    url: INSTAGRAM_URL,
    color: "#E1306C",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2"/>
        <circle cx="17.5" cy="6.5" r="1.3" fill="currentColor"/>
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    url: WHATSAPP_URL,
    color: "#25D366",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
  {
    name: "Telegram",
    url: TELEGRAM_URL,
    color: "#2CA5E0",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
  },
];

export default function CommunityFloat() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(DISMISSED_KEY)) {
      // Small delay so it doesn't flash on first render
      const t = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-4 z-50 md:hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-navy rounded-2xl shadow-2xl shadow-navy/30 p-4 max-w-[220px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-white text-xs font-semibold leading-tight">
            📢 Help shape Careviews
          </p>
          <button
            onClick={dismiss}
            className="text-white/40 hover:text-white transition ml-2 shrink-0"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>

        {/* Platform links */}
        <div className="flex flex-col gap-1.5">
          {PLATFORMS.map(({ name, url, color, icon }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={dismiss}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/8 hover:bg-white/14 transition text-white text-xs font-medium"
            >
              <span style={{ color }}>{icon}</span>
              {name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
