"use client";

import { useState, type FormEvent } from "react";
import type { UIMessage } from "ai";
import type { UseChatHelpers } from "@ai-sdk/react";

type Props = {
  status: UseChatHelpers<UIMessage>["status"];
  sendMessage: UseChatHelpers<UIMessage>["sendMessage"];
  stop: UseChatHelpers<UIMessage>["stop"];
};

export function Composer({ status, sendMessage, stop }: Props) {
  const [text, setText] = useState("");
  const busy = status === "streaming" || status === "submitted";

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t || busy) return;
    sendMessage({ text: t });
    setText("");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="m-4 rounded-2xl border border-black/10 bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe what you want to create..."
        rows={2}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
          }
        }}
        className="w-full resize-none bg-transparent py-1 text-[15px] placeholder:text-[#9A9389] focus:outline-none"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-[#F5F0E8] px-2.5 py-1 text-[11px] font-medium text-[#3D3831]">
          Gemini 3 Flash
        </span>
        {busy ? (
          <button
            type="button"
            onClick={() => stop()}
            className="rounded-lg bg-[#6B655D] px-3.5 py-1.5 text-[13px] font-medium text-white"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!text.trim()}
            className="rounded-lg bg-[#D9623A] px-3.5 py-1.5 text-[13px] font-medium text-white disabled:opacity-50"
          >
            Send
          </button>
        )}
      </div>
    </form>
  );
}
