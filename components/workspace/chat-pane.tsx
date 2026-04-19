"use client";

import type { UIMessage } from "ai";
import type { UseChatHelpers } from "@ai-sdk/react";
import { MessageList } from "./message-list";
import { EmptyChat } from "./empty-chat";
import { ErrorBanner } from "./error-banner";
import { Composer } from "./composer";

type Props = {
  messages: UIMessage[];
  status: UseChatHelpers<UIMessage>["status"];
  error: Error | undefined;
  sendMessage: UseChatHelpers<UIMessage>["sendMessage"];
  stop: UseChatHelpers<UIMessage>["stop"];
  clearError: UseChatHelpers<UIMessage>["clearError"];
};

export function ChatPane({
  messages,
  status,
  error,
  sendMessage,
  stop,
  clearError,
}: Props) {
  const showThinking =
    (status === "submitted" || status === "streaming") &&
    !isLastAssistantStreaming(messages);

  return (
    <aside className="relative ml-3 mt-3 flex flex-col overflow-hidden rounded-tr-2xl border border-black/5 bg-[#F5F0E8]">
      {messages.length === 0 && !showThinking ? (
        <EmptyChat />
      ) : (
        <MessageList messages={messages} showThinking={showThinking} />
      )}
      {error && <ErrorBanner error={error} onDismiss={clearError} />}
      <Composer status={status} sendMessage={sendMessage} stop={stop} />
    </aside>
  );
}

function isLastAssistantStreaming(messages: UIMessage[]) {
  const last = messages[messages.length - 1];
  if (!last || last.role !== "assistant") return false;
  const parts = (last.parts ?? []) as Array<Record<string, unknown>>;
  return parts.some((p) => {
    const t = p.type as string | undefined;
    return t === "text" || t === "reasoning" || t?.startsWith("tool-");
  });
}
