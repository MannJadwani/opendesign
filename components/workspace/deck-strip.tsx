"use client";

import { useEffect } from "react";
import type { ArtifactVariant } from "./workspace";
import { injectEditorScript } from "@/lib/workspace/editor-inject";

type Props = {
  slides: ArtifactVariant[];
  activeIndex: number;
  onSelect: (i: number) => void;
  disableKeys?: boolean;
  onContinueWith?: (i: number) => void;
  canContinue?: boolean;
};

export function DeckStrip({
  slides,
  activeIndex,
  onSelect,
  disableKeys,
  onContinueWith,
  canContinue = false,
}: Props) {
  useEffect(() => {
    if (disableKeys) return;
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName ?? "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        onSelect(Math.min(slides.length - 1, activeIndex + 1));
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        onSelect(Math.max(0, activeIndex - 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, slides.length, onSelect, disableKeys]);

  return (
    <div className="cd-enter-fade flex items-center gap-2 overflow-x-auto border-b border-black/5 bg-[#F5F0E8]/80 px-3 py-2">
      <span className="shrink-0 text-[11px] uppercase tracking-wide text-[#9A9389]">
        Slides · {activeIndex + 1} / {slides.length}
      </span>
      <button
        type="button"
        onClick={() => onSelect(Math.max(0, activeIndex - 1))}
        disabled={activeIndex === 0}
        className="shrink-0 rounded-md border border-black/10 bg-white px-1.5 py-0.5 text-[11px] text-[#3D3831] hover:border-black/20 disabled:opacity-40"
        aria-label="Previous slide"
      >
        ←
      </button>
      <button
        type="button"
        onClick={() => onSelect(Math.min(slides.length - 1, activeIndex + 1))}
        disabled={activeIndex >= slides.length - 1}
        className="shrink-0 rounded-md border border-black/10 bg-white px-1.5 py-0.5 text-[11px] text-[#3D3831] hover:border-black/20 disabled:opacity-40"
        aria-label="Next slide"
      >
        →
      </button>
      <div className="mx-1 h-5 w-px bg-black/10" />
      {onContinueWith && (
        <button
          type="button"
          onClick={() => onContinueWith(activeIndex)}
          disabled={!canContinue}
          title="Iterate only on this slide"
          className="shrink-0 rounded-md border border-[#D9623A] bg-[#D9623A] px-2 py-1 text-[11px] font-medium text-white hover:bg-[#C0462A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Edit this slide →
        </button>
      )}
      {slides.map((s, i) => {
        const active = i === activeIndex;
        const label = s.title?.trim() || `Slide ${i + 1}`;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            aria-pressed={active}
            title={label}
            className={`group relative block aspect-[16/9] h-[68px] shrink-0 overflow-hidden rounded-md border-2 bg-white transition-[border-color,box-shadow] ${
              active
                ? "border-[#1F1B16] shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
                : "border-black/10 hover:border-[#D9623A]/60"
            }`}
          >
            <div className="pointer-events-none absolute left-0 top-0 h-[540px] w-[960px] origin-top-left scale-[0.125]">
              <iframe
                title={`${label} preview`}
                srcDoc={injectEditorScript(s.html)}
                sandbox="allow-scripts allow-same-origin"
                className="h-full w-full border-0 bg-white"
              />
            </div>
            <div className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[9px] font-medium text-white">
              {i + 1}
            </div>
          </button>
        );
      })}
    </div>
  );
}
