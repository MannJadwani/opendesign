import type { UIMessage } from "ai";
import { coerceControls, type ArtifactControl } from "./controls";

export type EmitArtifact = {
  html: string;
  title?: string;
  controls: ArtifactControl[];
};

export function extractEmitArtifacts(msg: UIMessage): EmitArtifact[] {
  const out: EmitArtifact[] = [];
  const parts = (msg.parts ?? []) as Array<Record<string, unknown>>;
  for (const p of parts) {
    const type = p.type as string | undefined;
    if (!type || !type.startsWith("tool-")) continue;
    const name = (p.toolName as string | undefined) ?? type.replace(/^tool-/, "");
    if (name !== "emit_artifact") continue;
    const input = (p.input ?? p.args) as
      | { html?: string; title?: string; controls?: unknown }
      | undefined;
    if (input?.html) {
      out.push({
        html: input.html,
        title: input.title,
        controls: coerceControls(input.controls),
      });
    }
  }
  return out;
}

export function extractEmitArtifact(msg: UIMessage): EmitArtifact | null {
  const all = extractEmitArtifacts(msg);
  return all[all.length - 1] ?? null;
}
