import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { faculty_name, level, subject, institution, course_url, notes, email } = await req.json();

    if (!faculty_name?.trim()) {
      return NextResponse.json({ error: "Faculty name required" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    const { error } = await supabase.from("faculty_requests").insert({
      faculty_name: faculty_name.trim(),
      level:        level || null,
      subject:      subject || null,
      institution:  institution?.trim() || null,
      course_url:   course_url?.trim() || null,
      notes:        notes?.trim() || null,
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
