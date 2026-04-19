"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { exportHtml, exportPdf, exportPng } from "@/lib/workspace/export";
import type { InitialArtifact } from "./workspace";

type Props = {
  artifact: InitialArtifact;
  iframeRef: RefObject<HTMLIFrameElement | null>;
};

export function ExportMenu({ artifact, iframeRef }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<null | "html" | "png" | "pdf">(null);
  const [error, setError] = useState<string | null>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!popRef.current) return;
      if (!popRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const disabled = !artifact;

  async function run(kind: "html" | "png" | "pdf") {
    if (!artifact) return;
    setError(null);
    setBusy(kind);
    try {
      if (kind === "html") {
        exportHtml(artifact.html, artifact.title);
      } else {
        const frame = iframeRef.current;
        if (!frame) throw new Error("preview not ready");
        if (kind === "png") await exportPng(frame, artifact.title);
        else await exportPdf(frame, artifact.title);
      }
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "export failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="relative" ref={popRef}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        title={disabled ? "Generate an artifact first" : "Export"}
        className="rounded-lg bg-[#1F1B16] px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        Export
      </button>
      {open && (
        <div className="cd-enter-pop absolute right-0 top-full z-30 mt-2 w-[220px] origin-top-right overflow-hidden rounded-xl border border-black/10 bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          <MenuItem
            label="Download HTML"
            sub=".html source"
            busy={busy === "html"}
            disabled={!!busy}
            onClick={() => run("html")}
          />
          <MenuItem
            label="Download PNG"
            sub="full-page image"
            busy={busy === "png"}
            disabled={!!busy}
            onClick={() => run("png")}
          />
          <MenuItem
            label="Download PDF"
            sub="single-page vector"
            busy={busy === "pdf"}
            disabled={!!busy}
            onClick={() => run("pdf")}
          />
          {error && (
            <p className="mt-1 px-2 py-1 text-[11px] text-[#C0462A]">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  label,
  sub,
  onClick,
  busy,
  disabled,
}: {
  label: string;
  sub: string;
  onClick: () => void;
  busy: boolean;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left hover:bg-[#FAF6EF] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span>
        <span className="block text-[12px] font-medium text-[#1F1B16]">{label}</span>
        <span className="block text-[11px] text-[#6B655D]">{sub}</span>
      </span>
      {busy && <span className="text-[11px] text-[#D9623A]">…</span>}
    </button>
  );
}
