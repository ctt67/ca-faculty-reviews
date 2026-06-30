"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { track } from "@/lib/track";

export default function TrackedLink({
  href,
  event,
  properties,
  className,
  children,
}: {
  href: string;
  event: string;
  properties?: Record<string, unknown>;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={() => track(event, properties)}>
      {children}
    </Link>
  );
}
