import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { sanitizeText } from "@/lib/sanitize";

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SALT              = process.env.IP_HASH_SALT ?? "careviews-ip-salt-v1";
const supabase          = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function hashIp(ip: string) {
  return createHash("sha256").update(SALT + ip).digest("hex").slice(0, 16);
}

export async function POST(req: NextRequest) {
  try {
    const { faculty_name, level, subject, institution, course_url, notes, email } = await req.json();

    const cleanName = sanitizeText(faculty_name ?? "");
    if (!cleanName) {
      return NextResponse.json({ error: "Faculty name required" }, { status: 400 });
    }

    const rawIp  = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const ipHash = hashIp(rawIp);

    const { data: allowed } = await supabase.rpc("check_rate_limit", {
      p_table: "faculty_requests", p_column: "ip_hash",
      p_value: ipHash, p_limit: 5, p_window_hours: 24,
    });
    if (allowed === false) {
      return NextResponse.json({ error: "Too many requests. Try again tomorrow." }, { status: 429 });
    }

    const ip = ipHash;

    const { error } = await supabase.from("faculty_requests").insert({
      faculty_name: cleanName,
      level:        level || null,
      subject:      subject || null,
      institution:  institution ? sanitizeText(institution) || null : null,
      course_url:   course_url?.trim() || null,
      notes:        notes ? sanitizeText(notes) || null : null,
      requester_email: email?.trim() || null,
      ip_hash:      ip,
      status:       "pending",
    });

    if (error) {
      console.error("faculty_request insert error", error);
      return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
