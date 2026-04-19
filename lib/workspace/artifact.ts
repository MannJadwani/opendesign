import type { UIMessage } from "ai";

export type EmitArtifact = { html: string; title?: string };

export function extractEmitArtifact(msg: UIMessage): EmitArtifact | null {
  const parts = (msg.parts ?? []) as Array<Record<string, unknown>>;
  for (const p of parts) {
    const type = p.type as string | undefined;
    if (!type || !type.startsWith("tool-")) continue;
    const name = (p.toolName as string | undefined) ?? type.replace(/^tool-/, "");
    if (name !== "emit_artifact") continue;
    const input = (p.input ?? p.args) as { html?: string; title?: string } | undefined;
    if (input?.html) return { html: input.html, title: input.title };
  }
  return null;
}
