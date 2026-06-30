"use client";

import { supabase } from "./supabase";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("cv_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("cv_session_id", id);
  }
  return id;
}

function getUtmSource(): string | null {
  if (typeof window === "undefined") return null;
  const fromUrl = new URLSearchParams(window.location.search).get("utm_source");
  if (fromUrl) {
    sessionStorage.setItem("cv_utm_source", fromUrl);
    return fromUrl;
  }
  return sessionStorage.getItem("cv_utm_source");
}

export function track(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";

  supabase.auth.getSession().then(({ data: { session } }) => {
    supabase.from("analytics_events").insert([{
      event_name: eventName,
      properties: properties ?? null,
      session_id: getSessionId(),
      user_id: session?.user?.id ?? null,
      path: window.location.pathname,
      referrer: document.referrer || null,
      utm_source: getUtmSource(),
      device_type: deviceType,
    }]).then(({ error }) => {
      if (error) console.error("track failed:", eventName, error);
    });
  });
}
