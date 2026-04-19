import { NextResponse } from "next/server";
import {
  createAgentUIStreamResponse,
  type InferAgentUIMessage,
} from "ai";
import { and, desc, eq } from "drizzle-orm";
import { designAgent } from "@/lib/ai/agent";
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

  return createAgentUIStreamResponse({
    agent: designAgent,
    uiMessages: messages,
    onStepFinish: async ({ toolCalls, toolResults }) => {
      const emit = toolCalls?.find(
        (c) => c.toolName === "emit_artifact" && !c.dynamic,
      );
      if (!emit) return;
      const result = toolResults?.find(
        (r) => r.toolCallId === emit.toolCallId,
      );
      if (result && "error" in (result as Record<string, unknown>)) return;
      const input = emit.input as {
        title: string;
        html: string;
        controls?: unknown;
      };
      const [latest] = await db
        .select({ version: schema.artifact.version })
        .from(schema.artifact)
        .where(eq(schema.artifact.projectId, projectId))
        .orderBy(desc(schema.artifact.version))
        .limit(1);
      await db.insert(schema.artifact).values({
        id: rid("art"),
        projectId,
        version: (latest?.version ?? 0) + 1,
        html: input.html,
        sidecar: { title: input.title, controls: input.controls ?? [] },
      });
      if (project.title === "Untitled" && input.title) {
        await db
          .update(schema.project)
          .set({ title: input.title, updatedAt: new Date() })
          .where(eq(schema.project.id, projectId));
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
