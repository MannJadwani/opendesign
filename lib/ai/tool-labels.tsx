import type { ReactNode } from "react";
import {
  IconSearch,
  IconGrid,
  IconImage,
  IconEye,
  IconSpark,
  IconPalette,
  IconLayout,
  IconDot,
} from "@/components/icons";

export type ToolMeta = { label: string; running: string; icon: ReactNode };

export const TOOL_META: Record<string, ToolMeta> = {
  ask_intake_questions: { label: "Asked intake questions", running: "Drafting intake", icon: <IconSpark /> },
  search_pinterest: { label: "Browsing references", running: "Scanning Pinterest", icon: <IconSearch /> },
  search_components: { label: "Finding patterns", running: "Looking up components", icon: <IconGrid /> },
  fetch_image: { label: "Peeking at image", running: "Loading image", icon: <IconImage /> },
  interpret_image: { label: "Reading the image", running: "Interpreting visuals", icon: <IconEye /> },
  synthesize_concept: { label: "Locking direction", running: "Synthesising concept", icon: <IconSpark /> },
  apply_design_system: { label: "Applying brand", running: "Applying design system", icon: <IconPalette /> },
  emit_artifact: { label: "Rendering artifact", running: "Drafting artifact", icon: <IconLayout /> },
};

export function getToolMeta(name: string): ToolMeta {
  return TOOL_META[name] ?? { label: name, running: name, icon: <IconDot /> };
}
