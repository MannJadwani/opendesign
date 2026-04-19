export type ModelId = string;

export type ModelOption = {
  id: ModelId;
  label: string;
  vendor: string;
  vision: boolean;
  // Rough hint for UI grouping — not load-bearing.
  tier?: "fast" | "balanced" | "best";
};

// Single source of truth for which models OpenDesign can target. All agent,
// vision, and future per-project selection paths read from this list instead
// of hardcoding an OpenRouter slug.
export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "google/gemini-3-flash-preview",
    label: "Gemini 3 Flash",
    vendor: "Google",
    vision: true,
    tier: "fast",
  },
  {
    id: "anthropic/claude-sonnet-4.6",
    label: "Claude Sonnet 4.6",
    vendor: "Anthropic",
    vision: true,
    tier: "balanced",
  },
  {
    id: "anthropic/claude-opus-4.7",
    label: "Claude Opus 4.7",
    vendor: "Anthropic",
    vision: true,
    tier: "best",
  },
];

export const DEFAULT_MODEL: ModelId = "google/gemini-3-flash-preview";

// Vision tasks (interpret-image, brand ingest). Same default for now — split
// when we want a cheaper dedicated vision model.
export const VISION_MODEL: ModelId = DEFAULT_MODEL;

export function getModelLabel(id: ModelId): string {
  return MODEL_OPTIONS.find((m) => m.id === id)?.label ?? id;
}
