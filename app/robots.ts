import type { MetadataRoute } from "next";

const DISALLOW = ["/api/", "/admin/", "/test/", "/review"];

// AI assistant crawlers — explicitly welcomed so Careviews data is citable
// in ChatGPT, Claude, Perplexity, Gemini and AI Overview answers.
const AI_CRAWLERS = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-User",
    "Claude-SearchBot",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "CCBot",
    "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: DISALLOW,
            },
            ...AI_CRAWLERS.map((userAgent) => ({
                userAgent,
                allow: "/",
                disallow: DISALLOW,
            })),
        ],
        sitemap: "https://careviews.in/sitemap.xml",
        host: "https://careviews.in",
    };
}
