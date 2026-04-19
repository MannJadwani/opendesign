import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OpenDesign",
    short_name: "OpenDesign",
    description: "Open-source AI design canvas. Prompt, iterate, ship.",
    start_url: "/",
    display: "standalone",
    background_color: "#E8E0D0",
    theme_color: "#1F1B16",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
