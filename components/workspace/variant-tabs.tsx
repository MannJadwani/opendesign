"use client";

import type { ArtifactVariant } from "./workspace";

type Props = {
  variants: ArtifactVariant[];
  activeIndex: number;
  onSelect: (i: number) => void;
};

export function VariantTabs({ variants, activeIndex, onSelect }: Props) {
  return (
    <div className="cd-enter-fade flex items-center gap-1 border-b border-black/5 bg-[#F5F0E8]/80 px-3 py-1.5">
      <span className="mr-2 text-[11px] uppercase tracking-wide text-[#9A9389]">
        Variants
      </span>
      {variants.map((v, i) => {
        const active = i === activeIndex;
        const label = v.title?.trim() || `Variant ${i + 1}`;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            aria-pressed={active}
            title={label}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
              active
                ? "border-[#1F1B16] bg-[#1F1B16] text-white"
                : "border-black/10 bg-white text-[#3D3831] hover:bg-[#FAF6EF]"
            }`}
          >
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                active ? "bg-[#D9623A]" : "bg-[#C4BDB2]"
              }`}
            />
            <span className="max-w-[180px] truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
