import type { UIMessage } from "ai";
import { ToolPart } from "./tool-part";
import { Markdown } from "./markdown";

export function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`cd-enter-fade ${isUser ? "flex justify-end" : ""}`}>
      <div
        className={
          isUser
            ? "max-w-[85%] rounded-2xl rounded-br-md bg-[#1F1B16] px-3.5 py-2 text-[14px] text-[#F5F0E8]"
            : "max-w-[95%] space-y-2 text-[14px] leading-relaxed text-[#1F1B16]"
        }
      >
        {(message.parts ?? []).map((part, i) => (
          <Part key={i} part={part as Record<string, unknown>} isUser={isUser} />
        ))}
      </div>
    </div>
  );
}

function Part({ part, isUser }: { part: Record<string, unknown>; isUser: boolean }) {
  const type = part.type as string;
  if (type === "text") {
    const text = (part.text as string) ?? "";
    if (isUser) return <p className="whitespace-pre-wrap">{text}</p>;
    return <Markdown text={text} />;
  }
  if (type === "file") {
    const mediaType = (part.mediaType as string | undefined) ?? "";
    const url = (part.url as string | undefined) ?? "";
    const filename = part.filename as string | undefined;
    if (mediaType.startsWith("image/") && url) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={filename ?? "attachment"}
          className="max-h-56 rounded-lg border border-black/10 object-cover"
        />
      );
    }
    return (
      <p className="rounded-lg border border-black/10 bg-white/50 px-2 py-1 text-[12px] text-[#3D3831]">
        📎 {filename ?? mediaType}
      </p>
    );
  }
  if (type === "reasoning") {
    const text = (part.text as string) ?? "";
    if (!text) return null;
    return (
      <p className="rounded-lg border border-dashed border-black/10 bg-white/50 px-3 py-2 text-[12px] italic text-[#6B655D]">
        {text}
      </p>
    );
  }
  if (type?.startsWith("tool-")) {
    return <ToolPart part={part} />;
  }
  return null;
}
