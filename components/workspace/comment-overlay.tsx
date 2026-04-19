"use client";

import { useEffect, useRef, useState } from "react";
import type { CommentRow } from "@/lib/actions";

type PendingPin = {
  xPct: number;
  yPct: number;
  leafId: string | null;
  anchor: string | null;
};

type Props = {
  comments: CommentRow[];
  pending: PendingPin | null;
  onCreate: (body: string) => Promise<void> | void;
  onCancelPending: () => void;
  onResolve: (id: string, resolved: boolean) => void;
  onDelete: (id: string) => void;
  onApply: (comment: CommentRow) => void;
};

export function CommentOverlay({
  comments,
  pending,
  onCreate,
  onCancelPending,
  onResolve,
  onDelete,
  onApply,
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {comments.map((c, i) => {
        if (c.xPct == null || c.yPct == null) return null;
        const open = openId === c.id;
        return (
          <div
            key={c.id}
            style={{ left: `${c.xPct * 100}%`, top: `${c.yPct * 100}%` }}
            className="absolute -translate-x-1/2 -translate-y-full"
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : c.id)}
              className={`pointer-events-auto flex h-6 w-6 items-center justify-center rounded-full rounded-bl-sm border-2 border-white text-[11px] font-semibold text-white shadow-md transition-transform hover:scale-110 ${
                c.resolved ? "bg-[#9A9389]" : "bg-[#D9623A]"
              }`}
              title={c.body}
            >
              {i + 1}
            </button>
            {open && (
              <div className="cd-enter-pop pointer-events-auto absolute left-0 top-full mt-1 w-64 rounded-lg border border-black/10 bg-white p-3 text-[12px] shadow-xl">
                <div className="mb-1.5 flex items-center justify-between text-[10px] text-[#9A9389]">
                  <span>{c.authorName ?? "you"}</span>
                  <span>{formatDate(c.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap text-[13px] text-[#1F1B16]">
                  {c.body}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {!c.resolved && (
                    <button
                      type="button"
                      onClick={() => {
                        onApply(c);
                        setOpenId(null);
                      }}
                      className="rounded-md bg-[#D9623A] px-2 py-1 text-[11px] font-medium text-white hover:bg-[#C0462A]"
                    >
                      Apply
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onResolve(c.id, !c.resolved)}
                    className="rounded-md border border-black/10 bg-white px-2 py-1 text-[11px] text-[#3D3831] hover:bg-[#FAF6EF]"
                  >
                    {c.resolved ? "Reopen" : "Resolve"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(c.id);
                      setOpenId(null);
                    }}
                    className="ml-auto rounded-md px-2 py-1 text-[11px] text-[#C0462A] hover:bg-[#FAF6EF]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {pending && (
        <PendingComposer
          pin={pending}
          onSubmit={onCreate}
          onCancel={onCancelPending}
        />
      )}
    </div>
  );
}

function PendingComposer({
  pin,
  onSubmit,
  onCancel,
}: {
  pin: PendingPin;
  onSubmit: (body: string) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  async function submit() {
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    try {
      await onSubmit(body);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{ left: `${pin.xPct * 100}%`, top: `${pin.yPct * 100}%` }}
      className="pointer-events-auto absolute -translate-x-1/2 -translate-y-full"
    >
      <div className="cd-enter-pop h-6 w-6 rounded-full rounded-bl-sm border-2 border-white bg-[#D9623A] shadow-md" />
      <div className="cd-enter-pop absolute left-0 top-full mt-1 w-64 rounded-lg border border-black/10 bg-white p-2 shadow-xl">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              onCancel();
            }
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
          }}
          rows={3}
          placeholder="Leave a note for OpenDesign…"
          className="w-full resize-none rounded-md border border-black/10 bg-[#FAF6EF] px-2 py-1.5 text-[12px] text-[#1F1B16] focus:border-[#D9623A] focus:outline-none"
        />
        <div className="mt-1.5 flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-2 py-1 text-[11px] text-[#6B655D] hover:bg-[#FAF6EF]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || !text.trim()}
            onClick={submit}
            className="rounded-md bg-[#1F1B16] px-2 py-1 text-[11px] font-medium text-white hover:bg-[#3D3831] disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
