import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

const SALT = process.env.IP_HASH_SALT ?? "careviews-ip-salt-v1";

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const ipHash = createHash("sha256").update(SALT + ip).digest("hex");
  const country = request.headers.get("x-vercel-ip-country") ?? null;

  return NextResponse.json({ ip_hash: ipHash, country });
}
