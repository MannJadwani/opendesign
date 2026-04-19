"use client";

import { useRef, useState, type ClipboardEvent, type DragEvent, type FormEvent } from "react";
import type { UIMessage } from "ai";
import type { UseChatHelpers } from "@ai-sdk/react";
import { DEFAULT_MODEL, getModelLabel } from "@/lib/ai/models";

type Props = {
  status: UseChatHelpers<UIMessage>["status"];
  sendMessage: UseChatHelpers<UIMessage>["sendMessage"];
  stop: UseChatHelpers<UIMessage>["stop"];
  needsApiKey?: boolean;
};

const MAX_FILE_BYTES = 4_000_000;
const MAX_FILES = 4;

export function Composer({ status, sendMessage, stop, needsApiKey = false }: Props) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [rejectMsg, setRejectMsg] = useState<string | null>(null);
  const pickerRef = useRef<HTMLInputElement>(null);
  const busy = status === "streaming" || status === "submitted";

  function addFiles(incoming: File[]) {
    const filtered: File[] = [];
    for (const f of incoming) {
      if (!f.type.startsWith("image/")) {
        setRejectMsg("Images only.");
        continue;
      }
      if (f.size > MAX_FILE_BYTES) {
        setRejectMsg(`${f.name} is over 4MB.`);
        continue;
      }
      filtered.push(f);
    }
    if (filtered.length === 0) return;
    setRejectMsg(null);
    setFiles((prev) => [...prev, ...filtered].slice(0, MAX_FILES));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if ((!t && files.length === 0) || busy || needsApiKey) return;

    const list = new DataTransfer();
    for (const f of files) list.items.add(f);

    if (t && files.length > 0) {
      sendMessage({ text: t, files: list.files });
    } else if (t) {
      sendMessage({ text: t });
    } else {
      sendMessage({ files: list.files });
    }
    setText("");
    setFiles([]);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (busy) return;
    const dropped = Array.from(e.dataTransfer.files ?? []);
    addFiles(dropped);
  }

  function onPaste(e: ClipboardEvent) {
    const items = Array.from(e.clipboardData?.items ?? []);
    const imgs: File[] = [];
    for (const it of items) {
      if (it.kind === "file") {
        const f = it.getAsFile();
        if (f) imgs.push(f);
      }
    }
    if (imgs.length > 0) {
      e.preventDefault();
      addFiles(imgs);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      onDragOver={(e) => {
        e.preventDefault();
        if (!busy) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={`m-4 rounded-2xl border bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-colors ${
        dragOver ? "border-[#D9623A] bg-[#FDEFE8]/40" : "border-black/10"
      }`}
    >
      {files.length > 0 && (
        <div className="cd-enter-fade mb-2 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <FileChip
              key={`${f.name}-${i}`}
              file={f}
              onRemove={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
            />
          ))}
        </div>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={onPaste}
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
      {rejectMsg && (
        <p className="mt-1 text-[11px] text-[#C0462A]">{rejectMsg}</p>
      )}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => pickerRef.current?.click()}
            disabled={busy || files.length >= MAX_FILES}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-[#F5F0E8] text-[#3D3831] hover:bg-[#EFE9DC] disabled:opacity-50"
            title="Attach image"
            aria-label="Attach image"
          >
            <PaperclipIcon />
          </button>
          <input
            ref={pickerRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              addFiles(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-[#F5F0E8] px-2.5 py-1 text-[11px] font-medium text-[#3D3831]">
            {getModelLabel(DEFAULT_MODEL)}
          </span>
        </div>
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
            disabled={(!text.trim() && files.length === 0) || needsApiKey}
            title={needsApiKey ? "Add an OpenRouter key in Settings to enable" : undefined}
            className="cd-hover-lift rounded-lg bg-[#D9623A] px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-[#C0462A] disabled:opacity-50"
          >
            {needsApiKey ? "Key required" : "Send"}
          </button>
        )}
      </div>
    </form>
  );
}

function FileChip({ file, onRemove }: { file: File; onRemove: () => void }) {
  const url = URL.createObjectURL(file);
  return (
    <div className="cd-enter-pop group relative flex items-center gap-2 rounded-lg border border-black/10 bg-[#F5F0E8] py-1 pl-1 pr-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={file.name}
        className="h-8 w-8 rounded-md object-cover"
        onLoad={() => URL.revokeObjectURL(url)}
      />
      <span className="max-w-[140px] truncate text-[11px] text-[#3D3831]">
        {file.name}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/10 text-[10px] text-[#1F1B16] hover:bg-black/20"
        aria-label={`Remove ${file.name}`}
      >
        ×
      </button>
    </div>
  );
}

function PaperclipIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}
