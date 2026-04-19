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
  needsApiKey?: boolean;
  selectedModelId?: string | null;
  customModels?: { id: string; label: string }[];
};

export function ChatPane({
  messages,
  status,
  error,
  sendMessage,
  stop,
  clearError,
  needsApiKey = false,
  selectedModelId = null,
  customModels = [],
}: Props) {
  const showThinking = status === "submitted" || status === "streaming";

  return (
    <aside className="relative mr-3 mt-3 mb-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-black/5 bg-[#F5F0E8]">
      {messages.length === 0 && !showThinking ? (
        <EmptyChat />
      ) : (
        <MessageList
          messages={messages}
          showThinking={showThinking}
          onIntakeSubmit={(text) => sendMessage({ text, metadata: { intent: "intake" } })}
        />
      )}
      {error && <ErrorBanner error={error} onDismiss={clearError} />}
      <Composer
        status={status}
        sendMessage={sendMessage}
        stop={stop}
        needsApiKey={needsApiKey}
        selectedModelId={selectedModelId}
        customModels={customModels}
      />
    </aside>
  );
}
