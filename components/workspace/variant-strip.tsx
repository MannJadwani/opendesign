"use client";

import type { ArtifactVariant } from "./workspace";
import { injectEditorScript } from "@/lib/workspace/editor-inject";

type Props = {
  variants: ArtifactVariant[];
  activeIndex: number;
  onSelect: (i: number) => void;
  compareIndex: number | null;
  onToggleCompare: (i: number) => void;
};

// Scaled live-iframe thumbnails. Each thumb renders the variant's HTML at 25%
// via CSS transform so what you see is literally the artifact. The iframe is
// pointer-events:none so clicks land on the wrapper button.
export function VariantStrip({
  variants,
  activeIndex,
  onSelect,
  compareIndex,
  onToggleCompare,
}: Props) {
  return (
    <div className="cd-enter-fade flex items-center gap-2 overflow-x-auto border-b border-black/5 bg-[#F5F0E8]/80 px-3 py-2">
      <span className="shrink-0 text-[11px] uppercase tracking-wide text-[#9A9389]">
        Variants · {variants.length}
      </span>
      {variants.map((v, i) => {
        const active = i === activeIndex;
        const compared = compareIndex === i;
        const label = v.title?.trim() || `Variant ${i + 1}`;
        return (
          <div key={i} className="shrink-0">
            <button
              type="button"
              onClick={() => onSelect(i)}
              onDoubleClick={() => onToggleCompare(i)}
              aria-pressed={active}
              title={`${label}${active ? " (active)" : ""}${compared ? " (compare)" : ""} — double-click to compare`}
              className={`group relative block h-[92px] w-[148px] overflow-hidden rounded-lg border-2 bg-white transition-[border-color,box-shadow] ${
                active
                  ? "border-[#1F1B16] shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
                  : compared
                    ? "border-[#D9623A]"
                    : "border-black/10 hover:border-[#D9623A]/60"
              }`}
            >
              <div className="pointer-events-none absolute left-0 top-0 h-[368px] w-[592px] origin-top-left scale-[0.25]">
                <iframe
                  title={`${label} preview`}
                  srcDoc={injectEditorScript(v.html)}
                  sandbox="allow-scripts allow-same-origin"
                  className="h-full w-full border-0 bg-white"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/60 via-black/30 to-transparent px-1.5 py-1 text-[10px] font-medium text-white">
                <span className="truncate">{label}</span>
                {compared && (
                  <span className="rounded bg-[#D9623A] px-1 text-[9px] uppercase tracking-wide">
                    vs
                  </span>
                )}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
