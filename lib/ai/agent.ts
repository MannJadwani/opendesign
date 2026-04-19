import { ToolLoopAgent, stepCountIs } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { SYSTEM_PROMPT } from "./system";
import { buildDesignTools } from "./tools";
import { DEFAULT_MODEL, type ModelId } from "./models";

export function buildDesignAgent({
  modelId = DEFAULT_MODEL,
  instructions = SYSTEM_PROMPT,
  apiKey,
}: {
  modelId?: ModelId;
  instructions?: string;
  apiKey?: string;
} = {}) {
  const openrouter = createOpenRouter({
    apiKey: apiKey ?? process.env.OPENROUTER_API_KEY!,
    appName: "OpenDesign",
  });
  return new ToolLoopAgent({
    id: "opendesign",
    model: openrouter.chat(modelId),
    instructions,
    tools: buildDesignTools({ apiKey }),
    stopWhen: stepCountIs(14),
  });
}

export const designAgent = buildDesignAgent();
