import type { UIMessage } from "ai";
import { MessageBubble } from "./message-bubble";
import { ThinkingIndicator } from "./thinking-indicator";

type Props = {
  messages: UIMessage[];
  showThinking: boolean;
  onIntakeSubmit: (text: string) => void;
};

export function MessageList({ messages, showThinking, onIntakeSubmit }: Props) {
  const lastIntakeIdx = findLastIntakeIndex(messages);

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
      {messages.map((m, i) => (
        <MessageBubble
          key={m.id}
          message={m}
          intakeState={
            i === lastIntakeIdx
              ? hasUserReplyAfter(messages, i)
                ? "submitted"
                : "active"
              : "stale"
          }
          onIntakeSubmit={onIntakeSubmit}
        />
      ))}
      {showThinking && <ThinkingIndicator />}
    </div>
  );
}

function findLastIntakeIndex(messages: UIMessage[]): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "assistant") continue;
    for (const p of m.parts ?? []) {
      if ((p as { type?: string }).type === "tool-ask_intake_questions") return i;
    }
  }
  return -1;
}

function hasUserReplyAfter(messages: UIMessage[], idx: number): boolean {
  for (let i = idx + 1; i < messages.length; i++) {
    if (messages[i].role === "user") return true;
  }
  return false;
}
