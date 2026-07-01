import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { review_id, reason, details, session_token } = await req.json();

    if (!review_id || !reason) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const validReasons = ["fake", "abuse", "wrong_faculty", "spam", "other"];
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    }

    // Basic rate limit: one report per session per review
    const { data: existing } = await supabase
      .from("review_reports")
      .select("id")
      .eq("review_id", review_id)
      .eq("session_token", session_token ?? "")
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true }); // silently accept
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    const { error } = await supabase.from("review_reports").insert({
      review_id,
      reason,
      details: details ?? null,
      session_token: session_token ?? null,
      ip_hash: ip,
    });

    if (error) {
      console.error("report insert error", error);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
