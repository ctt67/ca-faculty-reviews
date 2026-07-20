import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { sanitizeFields } from "@/lib/sanitize";
import { moderateReviewText } from "@/lib/moderate";

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SALT             = process.env.IP_HASH_SALT ?? "careviews-ip-salt-v1";

function hashIp(ip: string): string {
  return createHash("sha256").update(SALT + ip).digest("hex");
}

export async function POST(req: NextRequest) {
  // 1. Auth
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Server-side metadata (can't be spoofed by client)
  const rawIp  = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
              ?? req.headers.get("x-real-ip")
              ?? "unknown";
  const ipHash  = hashIp(rawIp);
  const country = req.headers.get("x-vercel-ip-country") ?? null;

  // 3. Rate limit — 10 reviews per IP per 24h
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: allowed, error: rpcError } = await anonClient.rpc("check_review_rate_limit", {
    p_ip_hash: ipHash,
    p_limit: 10,
  });

  if (rpcError) {
    console.error("rate_limit rpc error", rpcError);
    // Non-fatal — allow through rather than block on infra failure
  } else if (allowed === false) {
    return NextResponse.json(
      { error: "rate_limited", message: "You've submitted too many reviews today. Please try again tomorrow." },
      { status: 429 }
    );
  }

  // 4. Validate
  let body: { reviewData?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let reviewData = body.reviewData;
  if (!reviewData?.faculty_slug) {
    return NextResponse.json({ error: "Missing faculty_slug" }, { status: 400 });
  }

  // 5. Sanitize + moderate text fields
  reviewData = sanitizeFields(reviewData, ["pros", "cons", "review_text"]);

  const { ok: contentOk } = moderateReviewText(
    reviewData.pros as string,
    reviewData.cons as string,
    reviewData.review_text as string | null,
  );
  if (!contentOk) {
    return NextResponse.json(
      { error: "content_flagged", message: "Your review contains language that isn't allowed. Please revise and resubmit." },
      { status: 422 },
    );
  }

  // 6. Insert — user_id and server metadata are set here, never from client
  const row = {
    ...reviewData,
    user_id: user.id,
    ip_hash:  ipHash,
    country,
    approved: false,
  };
  let { error } = await userClient.from("reviews").insert([row]);

  // A review must never be lost to a missing attribution column
  // (reviews.session_id requires a one-time DDL run).
  if (error && error.code === "PGRST204" && "session_id" in row) {
    const withoutSession = { ...row } as Record<string, unknown>;
    delete withoutSession.session_id;
    ({ error } = await userClient.from("reviews").insert([withoutSession]));
  }

  if (error) {
    if (error.code === "23505" || error.message?.includes("unique_user_faculty_review")) {
      return NextResponse.json({ error: "already_reviewed" }, { status: 409 });
    }
    console.error("review insert error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
