import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { VISION_MODEL } from "../models";

export const imageInterpretationSchema = z.object({
  summary: z.string().describe("2-3 sentence summary of what the image shows, visually."),
  palette: z
    .array(z.string().regex(/^#?[0-9a-fA-F]{3,8}$/))
    .min(2)
    .max(8)
    .describe("Dominant hex colors, most prominent first."),
  typography: z
    .string()
    .describe("Type style observed: serif/sans/display/mono, weight, posture."),
  layout: z
    .string()
    .describe("Layout posture: editorial / brutalist / catalog / showroom / minimal / zine / grid / asymmetric."),
  mood: z
    .string()
    .describe("One-line mood / aesthetic tag — e.g. 'acid-lime on off-black'."),
  usable_for: z
    .array(z.enum(["hero", "nav", "section", "type", "color", "layout"]))
    .describe("Which parts of a new design could borrow from this reference."),
});

export type ImageInterpretation = z.infer<typeof imageInterpretationSchema>;

export async function interpretImageUrl(
  url: string,
  focus: "layout" | "typography" | "color" | "overall" = "overall",
  opts: { apiKey?: string; modelId?: string } = {},
): Promise<ImageInterpretation> {
  const openrouter = createOpenRouter({
    apiKey: opts.apiKey ?? process.env.OPENROUTER_API_KEY!,
    appName: "OpenDesign",
  });
  const visionModel = openrouter.chat(opts.modelId ?? VISION_MODEL);
  const focusPrompt: Record<typeof focus, string> = {
    layout: "Focus on layout posture, grid structure, and proportions.",
    typography: "Focus on typefaces, weights, and typographic rhythm.",
    color: "Focus on palette, contrast, and color relationships.",
    overall: "Read the overall aesthetic holistically.",
  };

  const { object } = await generateObject({
    model: visionModel,
    schema: imageInterpretationSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Interpret this design reference for use as creative input. ${focusPrompt[focus]} Return colors as full hex (e.g. #1F1B16).`,
          },
          { type: "image", image: new URL(url) },
        ],
      },
    ],
  });

  return {
    ...object,
    palette: object.palette.map((c) => (c.startsWith("#") ? c : `#${c}`)),
  };
}
