import { ToolLoopAgent, stepCountIs } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { SYSTEM_PROMPT } from "./system";
import { designTools } from "./tools";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  appName: "OpenDesign",
});

export const designAgent = new ToolLoopAgent({
  id: "opendesign",
  model: openrouter.chat("google/gemini-3-flash-preview"),
  instructions: SYSTEM_PROMPT,
  tools: designTools,
  stopWhen: stepCountIs(14),
});
