"use client";

import { supabase } from "./supabase";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("cv_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("cv_session_id", id);
  }
  return id;
}

// First-touch entry capture: document.referrer and landing path are only
// meaningful on the first document load of a browser session — client-side
// navigation never updates them. Snapshot them once per session so every
// later event (and the review row itself) can carry true acquisition source.
function captureEntry() {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem("cv_entry_captured")) return;
  sessionStorage.setItem("cv_entry_captured", "1");
  sessionStorage.setItem("cv_entry_ref", document.referrer || "");
  sessionStorage.setItem("cv_entry_path", window.location.pathname);
}

function getUtm(): { source: string | null; medium: string | null; campaign: string | null } {
  if (typeof window === "undefined") return { source: null, medium: null, campaign: null };
  const params = new URLSearchParams(window.location.search);
  for (const k of ["source", "medium", "campaign"]) {
    const v = params.get(`utm_${k}`);
    if (v) sessionStorage.setItem(`cv_utm_${k}`, v);
  }
  return {
    source: sessionStorage.getItem("cv_utm_source"),
    medium: sessionStorage.getItem("cv_utm_medium"),
    campaign: sessionStorage.getItem("cv_utm_campaign"),
  };
}

// First-touch attribution for this browser session: session-persisted UTM
// params plus the external referrer and path the visitor entered on.
export function getFirstTouch(): {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  entry_referrer: string | null;
  entry_path: string | null;
} {
  if (typeof window === "undefined") {
    return { utm_source: null, utm_medium: null, utm_campaign: null, entry_referrer: null, entry_path: null };
  }
  captureEntry();
  const utm = getUtm();
  return {
    utm_source: utm.source,
    utm_medium: utm.medium,
    utm_campaign: utm.campaign,
    entry_referrer: sessionStorage.getItem("cv_entry_ref") || null,
    entry_path: sessionStorage.getItem("cv_entry_path") || null,
  };
}

export function track(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  captureEntry();

  const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";

  const utm = getUtm();
  const entryRef = sessionStorage.getItem("cv_entry_ref");
  const mergedProps: Record<string, unknown> = { ...(properties ?? {}) };
  if (utm.medium)   mergedProps.utm_medium   = utm.medium;
  if (utm.campaign) mergedProps.utm_campaign = utm.campaign;
  if (entryRef)     mergedProps.entry_referrer = entryRef;

  supabase.auth.getSession().then(({ data: { session } }) => {
    supabase.from("analytics_events").insert([{
      event_name: eventName,
      properties: Object.keys(mergedProps).length > 0 ? mergedProps : null,
      session_id: getSessionId(),
      user_id: session?.user?.id ?? null,
      path: window.location.pathname,
      referrer: document.referrer || null,
      utm_source: utm.source,
      device_type: deviceType,
    }]).then(({ error }) => {
      if (error) console.error("track failed:", eventName, error);
    });
  });
}

// Fires once per browser session, on whatever page the visitor lands on.
// Makes campaign sessions visible even when the visitor bounces without
// reaching a page that fires its own event.
export function trackSession() {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem("cv_ss_fired")) return;
  sessionStorage.setItem("cv_ss_fired", "1");
  track("session_start", { landing: window.location.pathname });
}
