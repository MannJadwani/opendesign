import { tool } from "ai";
import { z } from "zod";
import { controlSchema } from "@/lib/workspace/controls";
import { searchPinterest as pinterestSearch } from "./scrapers/pinterest";
import { searchDdgImages } from "./scrapers/ddg-images";
import { fetchImageMeta } from "./scrapers/fetch-image";
import { interpretImageUrl } from "./scrapers/interpret-image";
import { searchComponentsIndex } from "./components-index";
import { cacheKey, getCached, setCached } from "./cache";
import type { Pin } from "./scrapers/pinterest";
import type { FetchedImage } from "./scrapers/fetch-image";
import type { ImageInterpretation } from "./scrapers/interpret-image";

export const searchPinterest = tool({
  description:
    "Research visual references on Pinterest (falls back to DuckDuckGo Images). Use sparingly; prefer 1–2 focused queries. Returns pin summaries (title, dominant color, image url, source link).",
  inputSchema: z.object({
    query: z.string().describe("Natural-language visual query. Be specific."),
    limit: z.number().int().min(1).max(12).default(6),
  }),
  execute: async ({ query, limit }) => {
    const key = cacheKey("search_pinterest", { query, limit });
    const hit = await getCached<{ query: string; pins: Pin[]; source: string }>(key);
    if (hit) return { ...hit, cached: true };

    let pins: Pin[] = [];
    let source = "ddg";
    try {
      pins = await searchDdgImages(query, limit);
    } catch (e) {
      console.warn("[search_pinterest] ddg failed", e);
    }
    if (pins.length === 0) {
      try {
        pins = await pinterestSearch(query, limit);
        source = "pinterest";
      } catch (e) {
        console.warn("[search_pinterest] pinterest failed", e);
      }
    }

    const result = { query, pins, source };
    if (pins.length > 0) await setCached(key, result);
    return { ...result, cached: false };
  },
});

export const searchComponents = tool({
  description:
    "Search a curated local index of UI patterns (hero, nav, pricing, footer, faq, cta, mobile-hero, gallery, testimonial, features, social-proof). Returns 0-5 named patterns with taste tags, notes, and a skeletal HTML snippet. Does NOT hit the network.",
  inputSchema: z.object({
    pattern: z
      .string()
      .describe("Pattern name — e.g. 'hero', 'nav', 'pricing', 'footer', 'mobile-hero'."),
    vibe: z
      .string()
      .optional()
      .describe("Optional taste tag — 'editorial', 'brutalist', 'saas', 'terminal', 'minimal', etc."),
  }),
  execute: async ({ pattern, vibe }) => {
    const hits = searchComponentsIndex(pattern, vibe);
    return { pattern, vibe: vibe ?? null, count: hits.length, hits };
  },
});

export const fetchImage = tool({
  description:
    "Fetch an image URL and return its metadata (dimensions, aspect ratio, content type, byte size). Use before interpret_image to confirm the image is reachable and reasonable.",
  inputSchema: z.object({ url: z.string().url() }),
  execute: async ({ url }): Promise<FetchedImage | { url: string; error: string }> => {
    const key = cacheKey("fetch_image", { url });
    const hit = await getCached<FetchedImage>(key);
    if (hit) return hit;
    try {
      const meta = await fetchImageMeta(url);
      await setCached(key, meta);
      return meta;
    } catch (e) {
      return { url, error: e instanceof Error ? e.message : String(e) };
    }
  },
});

export const interpretImage = tool({
  description:
    "Vision interpretation of an image URL. Returns summary, palette (hex), typography, layout posture, mood, and which parts of a new design could borrow from it.",
  inputSchema: z.object({
    url: z.string().url(),
    focus: z
      .enum(["layout", "typography", "color", "overall"])
      .default("overall"),
  }),
  execute: async ({ url, focus }) => {
    const key = cacheKey("interpret_image", { url, focus });
    const hit = await getCached<ImageInterpretation & { url: string; focus: string }>(key);
    if (hit) return hit;
    try {
      const notes = await interpretImageUrl(url, focus);
      const result = { url, focus, ...notes };
      await setCached(key, result);
      return result;
    } catch (e) {
      return {
        url,
        focus,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  },
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

export const askIntakeQuestions = tool({
  description:
    "Ask the user 3-6 short, decisive intake questions before generating. Use ONLY on the FIRST turn when the user's brief is vague (1-6 words, abstract concept with no clear scope). Each question offers 3-6 preset pill answers plus an Other free-text slot. Stop after calling this tool — do NOT emit_artifact in the same turn. The UI renders the questions inline; the user replies with picks, then you generate.",
  inputSchema: z.object({
    intro: z
      .string()
      .max(160)
      .describe(
        "One short sentence framing why you need answers. Shown above the form.",
      ),
    questions: z
      .array(
        z.object({
          id: z.string().describe("slug-id like 'surface' or 'user'"),
          title: z.string().describe("Question headline."),
          subtitle: z.string().optional().describe("Optional one-line hint."),
          multi: z
            .boolean()
            .default(false)
            .describe("Allow multiple selections."),
          options: z
            .array(
              z.object({
                label: z.string(),
                value: z.string().optional(),
              }),
            )
            .min(2)
            .max(8)
            .describe("Pill-style options. Always include 'Decide for me'."),
          allowOther: z.boolean().default(true),
        }),
      )
      .min(3)
      .max(6),
  }),
  execute: async ({ intro, questions }) => ({
    ok: true,
    intro,
    count: questions.length,
  }),
});

export const applyDesignSystem = tool({
  description:
    "Load a saved design system by id and return its tokens (colors, type, spacing, radius). Call only when the user has referenced a specific saved system. If not found, returns applied:false.",
  inputSchema: z.object({ designSystemId: z.string() }),
  execute: async ({ designSystemId }) => {
    const { db, schema } = await import("@/lib/db");
    const { eq } = await import("drizzle-orm");
    const [row] = await db
      .select()
      .from(schema.designSystem)
      .where(eq(schema.designSystem.id, designSystemId))
      .limit(1);
    if (!row) return { designSystemId, applied: false, reason: "not_found" };
    return {
      designSystemId,
      applied: true,
      name: row.name,
      tokens: row.tokens,
    };
  },
});

export const emitArtifact = tool({
  description:
    "Emit a final self-contained HTML artifact. Use <data-cd-id> attributes on major blocks. Must be complete HTML including <html>/<body>. No external scripts. TailwindCDN OK via <script src='https://cdn.tailwindcss.com'></script>. Call ONCE per turn unless the user explicitly asked for multiple options / variants / takes — in that case call 2–3 times back-to-back with genuinely different directions (different layout, palette, or vibe — not cosmetic tweaks). Each call is an independent variant at the same version.",
  inputSchema: z.object({
    title: z.string(),
    html: z
      .string()
      .describe("Full HTML document as a single string."),
    controls: z
      .array(controlSchema)
      .optional()
      .describe(
        "Optional sliders bound to a CSS property or custom property on a data-cd-id block. Use for dimensions the user will plausibly tune (hero padding, radius, font scale, accent hue). 0–6 controls total.",
      ),
  }),
  execute: async ({ title, html, controls }) => ({
    ok: true,
    title,
    bytes: html.length,
    controls: controls?.length ?? 0,
  }),
});

export const designTools = {
  ask_intake_questions: askIntakeQuestions,
  search_pinterest: searchPinterest,
  search_components: searchComponents,
  fetch_image: fetchImage,
  interpret_image: interpretImage,
  synthesize_concept: synthesizeConcept,
  apply_design_system: applyDesignSystem,
  emit_artifact: emitArtifact,
} as const;

export type DesignTools = typeof designTools;
