import { NextResponse } from "next/server";
import {
  createAgentUIStreamResponse,
  type InferAgentUIMessage,
} from "ai";
import { and, desc, eq } from "drizzle-orm";
import { designAgent, buildDesignAgent } from "@/lib/ai/agent";
import { SYSTEM_PROMPT, WIREFRAME_PROMPT, SLIDES_PROMPT } from "@/lib/ai/system";
import {
  brandTokensToPromptSection,
  type BrandTokens,
} from "@/lib/ai/scrapers/brand-ingest";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/actions";
import { rid } from "@/lib/util/id";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  const user = await requireUser();
  type AgentMessage = InferAgentUIMessage<typeof designAgent>;
  const body = (await req.json()) as {
    projectId: string;
    messages: AgentMessage[];
  };
  const { projectId, messages } = body;

  const [project] = await db
    .select()
    .from(schema.project)
    .where(
      and(
        eq(schema.project.id, projectId),
        eq(schema.project.userId, user.id),
      ),
    )
    .limit(1);
  if (!project) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const last = messages[messages.length - 1];
  if (last?.role === "user") {
    await db.insert(schema.message).values({
      id: rid("msg"),
      projectId,
      role: "user",
      content: last,
    });
  }

  let turnVersion: number | null = null;
  let turnVariant = 0;
  let firstVariantTitle: string | null = null;

  // Resolve design-system tokens if the project is linked to one. Brand
  // tokens (per-project, ad-hoc) override a saved system when both are set.
  let systemTokens: BrandTokens | null = null;
  if (!(project.brandApply && project.brandTokens) && project.designSystemId) {
    const [ds] = await db
      .select({ tokens: schema.designSystem.tokens })
      .from(schema.designSystem)
      .where(eq(schema.designSystem.id, project.designSystemId))
      .limit(1);
    if (ds?.tokens) systemTokens = ds.tokens as BrandTokens;
  }
  const injected =
    project.brandApply && project.brandTokens
      ? (project.brandTokens as BrandTokens)
      : systemTokens;

  const wireframe = project.fidelity === "wireframe";
  const slides = project.outputType === "slides";
  const needsCustomAgent = !!injected || wireframe || slides;
  const agent = needsCustomAgent
    ? buildDesignAgent({
        instructions:
          SYSTEM_PROMPT +
          (injected ? "\n" + brandTokensToPromptSection(injected) : "") +
          (slides ? SLIDES_PROMPT : "") +
          (wireframe ? WIREFRAME_PROMPT : ""),
      })
    : designAgent;

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
    onStepFinish: async ({ toolCalls, toolResults }) => {
      const emits = (toolCalls ?? []).filter(
        (c) => c.toolName === "emit_artifact" && !c.dynamic,
      );
      for (const emit of emits) {
        const result = toolResults?.find(
          (r) => r.toolCallId === emit.toolCallId,
        );
        if (result && "error" in (result as Record<string, unknown>)) continue;
        const input = emit.input as {
          title: string;
          html: string;
          controls?: unknown;
        };
        if (turnVersion === null) {
          const [latest] = await db
            .select({ version: schema.artifact.version })
            .from(schema.artifact)
            .where(eq(schema.artifact.projectId, projectId))
            .orderBy(desc(schema.artifact.version))
            .limit(1);
          turnVersion = (latest?.version ?? 0) + 1;
          firstVariantTitle = input.title;
        }
        await db.insert(schema.artifact).values({
          id: rid("art"),
          projectId,
          version: turnVersion,
          variant: turnVariant,
          html: input.html,
          sidecar: { title: input.title, controls: input.controls ?? [] },
        });
        turnVariant += 1;
      }
      if (
        project.title === "Untitled" &&
        firstVariantTitle &&
        turnVariant > 0
      ) {
        await db
          .update(schema.project)
          .set({ title: firstVariantTitle, updatedAt: new Date() })
          .where(eq(schema.project.id, projectId));
        firstVariantTitle = null;
      }
    },
    originalMessages: messages,
    onFinish: async ({ messages: finalMessages }) => {
      const assistant = [...finalMessages]
        .reverse()
        .find((m) => m.role === "assistant");
      if (!assistant) return;
      await db.insert(schema.message).values({
        id: rid("msg"),
        projectId,
        role: "assistant",
        content: assistant,
      });
      await db
        .update(schema.project)
        .set({ updatedAt: new Date() })
        .where(eq(schema.project.id, projectId));
    },
    onError: (err) => {
      console.error("[chat] stream error", err);
      return err instanceof Error ? err.message : "Stream error";
    },
  });
}
