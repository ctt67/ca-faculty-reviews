"use client";

import { useEffect } from "react";
import { trackSession } from "@/lib/track";

export default function SessionTracker() {
  useEffect(() => {
    trackSession();
  }, []);
  return null;
}
