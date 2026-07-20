// Shared traffic-source classification for analytics.
// Turns a (utm_source, referrer) pair into a stable channel key so the
// insights dashboard groups WhatsApp app opens, l.instagram.com redirects,
// android-app:// referrers etc. under one label.

export function hostnameOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

export function isInternalHost(host: string | null): boolean {
  if (!host) return false;
  return host.endsWith("careviews.in") || host === "localhost" || host.endsWith("vercel.app");
}

/**
 * utm_source wins when present; otherwise the referrer is classified.
 * Returns "direct" (no referrer), "internal" (own-site navigation),
 * a known channel key, or the bare hostname for anything unrecognized.
 */
export function classifySource(
  utmSource: string | null | undefined,
  referrer: string | null | undefined
): string {
  if (utmSource) return utmSource.toLowerCase().trim();

  const host = hostnameOf(referrer);
  if (!host) return "direct";
  if (isInternalHost(host)) return "internal";

  if (host.includes("google")) return "google";
  if (host.includes("bing")) return "bing";
  if (host.includes("duckduckgo")) return "duckduckgo";
  if (host.includes("instagram")) return "instagram";
  if (host.includes("whatsapp") || host === "wa.me") return "whatsapp";
  if (host.includes("reddit")) return "reddit";
  if (host.includes("telegram") || host === "t.me") return "telegram";
  if (host === "t.co" || host.includes("twitter") || host === "x.com") return "x";
  if (host.includes("facebook") || host === "fb.me") return "facebook";
  if (host.includes("linkedin")) return "linkedin";
  if (host.includes("youtube") || host === "youtu.be") return "youtube";
  if (host.includes("chatgpt") || host.includes("openai")) return "chatgpt";
  if (host.includes("perplexity")) return "perplexity";

  return host;
}

/** Human label for a channel key (falls back to the key itself). */
const SOURCE_LABELS: Record<string, string> = {
  direct: "Direct / app",
  internal: "On-site",
  google: "Google",
  bing: "Bing",
  duckduckgo: "DuckDuckGo",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  whatsapp_share: "WhatsApp share link",
  reddit: "Reddit",
  telegram: "Telegram",
  x: "X / Twitter",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  ig: "Instagram (ads)",
};

export function sourceLabel(key: string): string {
  return SOURCE_LABELS[key] ?? key;
}
