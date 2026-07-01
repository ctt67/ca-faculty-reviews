import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

  // Dev mode: no secret configured → skip verification
  if (!secret) return NextResponse.json({ ok: true });

  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
    });

    const data = await res.json();

    if (!data.success) {
      return NextResponse.json({ error: "CAPTCHA failed", codes: data["error-codes"] }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("captcha verify error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
