import { tool } from "ai";
import { z } from "zod";

// P1 stubs. Replace with real Apify MCP + image pipeline in P1.5.

export const searchPinterest = tool({
  description:
    "Research visual references on Pinterest. Use sparingly; prefer 1–2 focused queries. Returns pin summaries (title, dominant colors, tags, image url).",
  inputSchema: z.object({
    query: z.string().describe("Natural-language visual query. Be specific."),
    limit: z.number().int().min(1).max(12).default(6),
  }),
  execute: async ({ query, limit }) => {
    return {
      query,
      pins: Array.from({ length: Math.min(limit, 3) }).map((_, i) => ({
        id: `stub_${i}`,
        title: `${query} — reference ${i + 1}`,
        colors: ["#1F1B16", "#D9623A", "#F5F0E8"],
        tags: ["editorial", "minimal"],
        image: "https://placehold.co/600x800/png",
      })),
      note: "stub — wire Apify MCP in P1.5",
    };
  },
});

export const searchComponents = tool({
  description:
    "Find UI component/pattern references (hero, nav, card, pricing, etc.). Returns curated HTML/CSS patterns.",
  inputSchema: z.object({
    pattern: z.string().describe("Component pattern name."),
    vibe: z.string().optional(),
  }),
  execute: async ({ pattern, vibe }) => ({
    pattern,
    vibe: vibe ?? null,
    hits: [{ name: `${pattern} — classic`, notes: "stub" }],
  }),
});

export const fetchImage = tool({
  description: "Fetch an image URL's metadata (dimensions, palette).",
  inputSchema: z.object({ url: z.string().url() }),
  execute: async ({ url }) => ({
    url,
    width: 0,
    height: 0,
    palette: ["#1F1B16"],
    note: "stub",
  }),
});

export const interpretImage = tool({
  description:
    "Vision interpretation of an image. Returns semantic notes usable in synthesis.",
  inputSchema: z.object({
    url: z.string().url(),
    focus: z
      .enum(["layout", "typography", "color", "overall"])
      .default("overall"),
  }),
  execute: async ({ url, focus }) => ({
    url,
    focus,
    notes: "stub interpretation",
  }),
});

export const synthesizeConcept = tool({
  description:
    "Lock in a single unique concept before emitting HTML. Captures palette, typography, layout posture. Call once, late.",
  inputSchema: z.object({
    name: z.string(),
    palette: z.array(z.string()).min(2).max(8),
    typography: z.object({
      display: z.string(),
      body: z.string(),
    }),
    layout: z.string(),
    rationale: z.string(),
  }),
  execute: async (concept) => ({ ok: true, concept }),
});

export const applyDesignSystem = tool({
  description:
    "Apply a saved design system's tokens to the in-progress concept.",
  inputSchema: z.object({ designSystemId: z.string() }),
  execute: async ({ designSystemId }) => ({
    designSystemId,
    applied: false,
    note: "stub",
  }),
});

export const emitArtifact = tool({
  description:
    "TERMINAL. Emit the final self-contained HTML artifact. Use <data-cd-id> attributes on major blocks. Must be complete HTML including <html>/<body>. No external scripts. TailwindCDN OK via <script src='https://cdn.tailwindcss.com'></script>.",
  inputSchema: z.object({
    title: z.string(),
    html: z
      .string()
      .describe("Full HTML document as a single string."),
    controls: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
          kind: z.enum(["slider", "toggle", "swatch"]),
          target: z.string(),
        }),
      )
      .optional(),
  }),
  execute: async ({ title, html, controls }) => ({
    ok: true,
    title,
    bytes: html.length,
    controls: controls?.length ?? 0,
  }),
});

export const designTools = {
  search_pinterest: searchPinterest,
  search_components: searchComponents,
  fetch_image: fetchImage,
  interpret_image: interpretImage,
  synthesize_concept: synthesizeConcept,
  apply_design_system: applyDesignSystem,
  emit_artifact: emitArtifact,
} as const;

export type DesignTools = typeof designTools;
