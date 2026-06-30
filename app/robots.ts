import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/", "/admin/", "/test/", "/review"],
            },
        ],
        sitemap: "https://careviews.in/sitemap.xml",
        host: "https://careviews.in",
    };
}