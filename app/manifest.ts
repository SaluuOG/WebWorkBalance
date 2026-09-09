import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WebWorkBalance",
    short_name: "WWB",
    description: "Lokale Website-Chancen finden, prüfen und als Leads verwalten.",
    start_url: "/",
    display: "standalone",
    background_color: "#080b0f",
    theme_color: "#080b0f",
    lang: "de",
    orientation: "any",
    icons: [
      { src: "/wwb-icon-v10-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/wwb-icon-v10-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
