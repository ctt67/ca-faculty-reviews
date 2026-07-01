import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sanitizeText } from "@/lib/sanitize";
import { moderateReviewText } from "@/lib/moderate";

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const VALID_RATING_KEYS = [
  "understandability", "exam_focus", "study_material_quality", "mock_coverage",
  "coverage_of_questions", "doubt_resolution", "revision_support", "notes_quality",
  "pace_of_teaching", "time_efficiency", "value_for_money", "expectation_match",
] as const;

export async function PATCH(req: NextRequest) {
  const auth = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${auth}` } },
  });

  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { review_id, pros, cons, review_text, would_recommend, ...rest } = body;

  if (!review_id) return NextResponse.json({ error: "Missing review_id" }, { status: 400 });

  // Verify ownership — only the author can edit
  const { data: existing } = await userSupabase
    .from("reviews")
    .select("id")
    .eq("id", review_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  const cleanPros  = sanitizeText(pros         ?? "");
  const cleanCons  = sanitizeText(cons         ?? "");
  const cleanText  = sanitizeText(review_text  ?? "");

  const { ok } = moderateReviewText(cleanPros, cleanCons, cleanText);
  if (!ok) {
    return NextResponse.json({ error: "Review contains inappropriate content." }, { status: 422 });
  }

  const ratings: Record<string, number | null> = {};
  for (const key of VALID_RATING_KEYS) {
    if (rest[key] != null) {
      const val = Number(rest[key]);
      if (val >= 1 && val <= 5) ratings[key] = val;
    }
  }

  const { error } = await userSupabase
    .from("reviews")
    .update({
      pros:             cleanPros  || null,
      cons:             cleanCons  || null,
      review_text:      cleanText  || null,
      would_recommend:  would_recommend ?? null,
      ...ratings,
      approved:         false,
      updated_at:       new Date().toISOString(),
    })
    .eq("id", review_id)
    .eq("user_id", user.id);

  if (error) {
    console.error("edit-review error", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
