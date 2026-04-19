import { ToolLoopAgent, stepCountIs } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { SYSTEM_PROMPT } from "./system";
import { designTools } from "./tools";
import { DEFAULT_MODEL, type ModelId } from "./models";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  appName: "OpenDesign",
});

export function buildDesignAgent({
  modelId = DEFAULT_MODEL,
  instructions = SYSTEM_PROMPT,
}: {
  modelId?: ModelId;
  instructions?: string;
} = {}) {
  return new ToolLoopAgent({
    id: "opendesign",
    model: openrouter.chat(modelId),
    instructions,
    tools: designTools,
    stopWhen: stepCountIs(14),
  });
}

export const designAgent = buildDesignAgent();
