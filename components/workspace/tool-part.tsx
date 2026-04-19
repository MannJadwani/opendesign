"use client";

import { useState } from "react";
import { getToolMeta } from "@/lib/ai/tool-labels";
import { IconChevronRight } from "@/components/icons";
import { JSONBlock } from "./json-block";

export function ToolPart({ part }: { part: Record<string, unknown> }) {
  const type = part.type as string;
  const name = (part.toolName as string | undefined) ?? type.replace(/^tool-/, "");
  const state = (part.state as string | undefined) ?? "";
  const meta = getToolMeta(name);
  const done = state === "output-available" || state === "output-error";
  const errored = state === "output-error";
  const input = part.input ?? part.args;
  const output = part.output ?? part.result;

  const [open, setOpen] = useState(false);
  const hasBody = input !== undefined || output !== undefined;

  return (
    <div className="rounded-xl border border-black/5 bg-white/70 text-[12px]">
      <button
        type="button"
        onClick={() => hasBody && setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left"
        disabled={!hasBody}
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
            errored
              ? "bg-[#FDEFE8] text-[#C0462A]"
              : done
              ? "bg-[#EFE9DC] text-[#3D3831]"
              : "bg-[#FDEFE8] text-[#D9623A]"
          }`}
        >
          {meta.icon}
        </span>
        <span className="flex-1 font-medium text-[#1F1B16]">
          {done ? meta.label : meta.running}
          {!done && <span className="ml-1 text-[#D9623A]">…</span>}
        </span>
        {errored && <span className="text-[11px] text-[#C0462A]">failed</span>}
        {hasBody && (
          <IconChevronRight
            className={`transition-transform ${open ? "rotate-90" : ""} text-[#9A9389]`}
          />
        )}
      </button>
      {open && hasBody && (
        <div className="space-y-2 border-t border-black/5 px-2.5 py-2">
          {input !== undefined && <JSONBlock label="input" data={input} />}
          {output !== undefined && (
            <JSONBlock label={errored ? "error" : "output"} data={output} />
          )}
        </div>
      )}
    </div>
  );
}
