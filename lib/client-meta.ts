export const REVIEW_VERSION = "v1";

export function detectBrowser(userAgent: string): string {
  if (/Edg\//.test(userAgent)) return "Edge";
  if (/Chrome\//.test(userAgent) && !/Chromium/.test(userAgent)) return "Chrome";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  if (/Safari\//.test(userAgent) && !/Chrome/.test(userAgent)) return "Safari";
  return "Other";
}

export async function hashUserAgent(userAgent: string): Promise<string | null> {
  if (typeof crypto === "undefined" || !crypto.subtle) return null;
  const data = new TextEncoder().encode(userAgent);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
