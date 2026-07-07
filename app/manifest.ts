import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Careviews",
    short_name: "Careviews",
    description: "CA faculty reviews by students, for students.",
    start_url: "/",
    display: "standalone",
    background_color: "#1B3055",
    theme_color: "#1B3055",
    icons: [
      {
        src:   "/android-chrome-192x192.png",
        sizes: "192x192",
        type:  "image/png",
      },
      {
        src:   "/android-chrome-512x512.png",
        sizes: "512x512",
        type:  "image/png",
      },
      {
        src:     "/apple-touch-icon.png",
        sizes:   "180x180",
        type:    "image/png",
        purpose: "any",
      },
    ],
  };
}
