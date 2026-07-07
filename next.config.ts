import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control",  value: "on" },
  { key: "X-Frame-Options",         value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options",  value: "nosniff" },
  { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
];

// Slug cleanup 2026-07-07 — old faculty URLs 301 to renamed slugs
const RENAMED_SLUGS: Array<[string, string]> = [
  ["ca-cryril-varghese-costing",        "cyril-varghese-inter-costing"],
  ["ca-vivek-gaba-idt",                 "vivek-gaba-inter-idt"],
  ["ca-praveen-kathod-afm",             "praveen-kathod-afm"],
  ["ca-akruti-dalmia-auditing",         "akruti-dalmia-inter-auditing"],
  ["ca-arjit-sethi-sm",                 "arjit-sethi-inter-sm"],
  ["ca-nitin-goel-fr",                  "nitin-goel-fr"],
  ["arpita-tulsiyam-idt",               "arpita-tulsyan-idt"],
  ["aakash-kandoi-advanced-accounting", "aakash-kandoi-inter-accounts"],
  ["amit-mahajan-idt",                  "amit-mahajan-inter-idt"],
  ["jasmeet-singh-dt",                  "jasmeet-singh-inter-dt"],
  ["jasmeet-singh-idt",                 "jasmeet-singh-inter-idt"],
  ["anusree-agrawal-dt",                "anusree-agrawal-inter-dt"],
  ["manish-mahajan-accounts",           "manish-mahajan-foundation-accounts"],
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return RENAMED_SLUGS.flatMap(([from, to]) => [
      { source: `/faculty/${from}`, destination: `/faculty/${to}`, permanent: true },
      { source: `/review/${from}`,  destination: `/review/${to}`,  permanent: true },
    ]);
  },
};

export default nextConfig;
