import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const RETAIN_DAYS = 90;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - RETAIN_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { error, count } = await supabase
    .from("analytics_events")
    .delete({ count: "exact" })
    .lt("created_at", cutoff);

  if (error) {
    console.error("cleanup-analytics error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`cleanup-analytics: deleted ${count} rows older than ${RETAIN_DAYS} days`);
  return NextResponse.json({ ok: true, deleted: count, cutoff });
}
