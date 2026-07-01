import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

const SALT = "cv_vote_ip_2025";

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip + SALT).digest("hex").slice(0, 16);
}

export async function POST(req: NextRequest) {
  try {
    const { review_id, session_token, vote_type, user_agent_hash } = await req.json();

    if (!review_id || !session_token) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const rawIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? req.headers.get("x-real-ip")
      ?? null;
    const ipHash = rawIp ? hashIp(rawIp) : null;

    if (vote_type === null) {
      const { error } = await supabase
        .from("review_votes")
        .delete()
        .eq("review_id", review_id)
        .eq("session_token", session_token);
      if (error) {
        console.error("vote delete error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      if (!["up", "down"].includes(vote_type)) {
        return NextResponse.json({ error: "Invalid vote_type" }, { status: 400 });
      }
      const { error } = await supabase.from("review_votes").upsert(
        {
          review_id,
          session_token,
          vote_type,
          ip_hash: ipHash,
          user_agent_hash: user_agent_hash ?? null,
        },
        { onConflict: "review_id,session_token" }
      );
      if (error) {
        console.error("vote upsert error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("vote route error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
