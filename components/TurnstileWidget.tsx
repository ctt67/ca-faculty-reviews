"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render(el: HTMLElement, opts: {
        sitekey: string;
        callback(token: string): void;
        "expired-callback"?(): void;
        theme?: "light" | "dark" | "auto";
      }): string;
      remove(id: string): void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY;

export default function TurnstileWidget({ onSuccess }: { onSuccess: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId  = useRef<string | undefined>(undefined);
  const cb        = useRef(onSuccess);
  cb.current = onSuccess;

  const mount = () => {
    if (!container.current || widgetId.current || !window.turnstile || !SITE_KEY) return;
    widgetId.current = window.turnstile.render(container.current, {
      sitekey: SITE_KEY,
      callback: (token) => cb.current(token),
      "expired-callback": () => { widgetId.current = undefined; },
      theme: "light",
    });
  };

  useEffect(() => {
    if (window.turnstile) mount();
    return () => {
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!SITE_KEY) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onLoad={mount}
      />
      <div ref={container} />
    </>
  );
}
