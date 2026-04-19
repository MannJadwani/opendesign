import type { UIMessage } from "ai";
import { MessageBubble } from "./message-bubble";
import { ThinkingIndicator } from "./thinking-indicator";

type Props = { messages: UIMessage[]; showThinking: boolean };

export function MessageList({ messages, showThinking }: Props) {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      {showThinking && <ThinkingIndicator />}
    </div>
  );
}
