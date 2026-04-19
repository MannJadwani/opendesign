import { z } from "zod";

// Slider spec emitted alongside an artifact in the tool sidecar. Each control
// binds a CSS property (or custom property) on a data-cd-id block to a numeric
// slider, letting the user tune a dimension without a roundtrip to Claude.
export const controlSchema = z.object({
  id: z.string(),
  label: z.string(),
  target: z
    .string()
    .describe("data-cd-id of the block this control writes to."),
  min: z.number(),
  max: z.number(),
  step: z.number().default(1),
  unit: z.string().optional().describe("px | rem | % | deg | none"),
  current: z.number(),
  styleProp: z
    .string()
    .optional()
    .describe(
      "Camel-case CSS property to write on the target (e.g. paddingTop, borderRadius, fontSize). Mutually exclusive with cssVar.",
    ),
  cssVar: z
    .string()
    .optional()
    .describe(
      "CSS custom property NAME without leading -- (e.g. 'accent-h'). Written on the target's inline style. Mutually exclusive with styleProp.",
    ),
});

export type ArtifactControl = z.infer<typeof controlSchema>;

export function isControl(value: unknown): value is ArtifactControl {
  const r = controlSchema.safeParse(value);
  return r.success;
}

export function coerceControls(raw: unknown): ArtifactControl[] {
  if (!Array.isArray(raw)) return [];
  const out: ArtifactControl[] = [];
  for (const c of raw) {
    const parsed = controlSchema.safeParse(c);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}
