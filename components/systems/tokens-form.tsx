"use client";

import { useState, type ChangeEvent } from "react";
import type { BrandTokens } from "@/lib/ai/scrapers/brand-ingest";

type Props = {
  initial: BrandTokens;
  onChange: (next: BrandTokens) => void;
  disabled?: boolean;
};

// Shared form over BrandTokens. Consumers wire submit/save buttons
// themselves and pass in `onChange` for controlled state.
export function TokensForm({ initial, onChange, disabled }: Props) {
  const [tokens, setTokens] = useState<BrandTokens>(initial);
  const [newColor, setNewColor] = useState("");

  function patch(partial: Partial<BrandTokens>) {
    const next = { ...tokens, ...partial };
    setTokens(next);
    onChange(next);
  }

  function addColor() {
    const c = newColor.trim();
    if (!c) return;
    const hex = c.startsWith("#") ? c : `#${c}`;
    if (!/^#[0-9a-f]{3,8}$/i.test(hex)) return;
    if (tokens.palette.some((p) => p.toLowerCase() === hex.toLowerCase())) {
      setNewColor("");
      return;
    }
    patch({ palette: [...tokens.palette, hex] });
    setNewColor("");
  }

  function removeColor(i: number) {
    patch({ palette: tokens.palette.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-5 text-[13px]">
      <Field label="Palette">
        <div className="flex flex-wrap gap-1.5">
          {tokens.palette.map((c, i) => (
            <div
              key={`${c}-${i}`}
              className="flex items-center gap-1.5 rounded border border-black/10 bg-[#FAF6EF] px-1.5 py-0.5"
            >
              <span
                className="block h-4 w-4 rounded-sm border border-black/10"
                style={{ background: c }}
              />
              <span className="font-mono text-[11px]">{c}</span>
              <button
                type="button"
                onClick={() => removeColor(i)}
                disabled={disabled}
                className="text-[10px] text-[#9A9389] hover:text-[#D9623A] disabled:opacity-50"
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addColor();
              }
            }}
            placeholder="#1F1B16"
            disabled={disabled}
            className="w-32 rounded-md border border-black/10 bg-white px-2 py-1 font-mono text-[12px] outline-none focus:border-[#D9623A] disabled:opacity-50"
          />
          <button
            type="button"
            onClick={addColor}
            disabled={disabled || !newColor.trim()}
            className="rounded-md border border-black/10 bg-white px-2 py-1 text-[11px] font-medium hover:bg-[#FAF6EF] disabled:opacity-50"
          >
            Add color
          </button>
        </div>
      </Field>

      <TextField
        label="Typography"
        value={tokens.typography}
        disabled={disabled}
        placeholder="e.g. display serif: Fraunces; body sans: Inter"
        onChange={(v) => patch({ typography: v })}
      />

      <TextField
        label="Layout posture"
        value={tokens.layout}
        disabled={disabled}
        placeholder="editorial / brutalist / catalog / showroom / minimal"
        onChange={(v) => patch({ layout: v })}
      />

      <TextField
        label="Mood"
        value={tokens.mood}
        disabled={disabled}
        placeholder="one-line aesthetic tag"
        onChange={(v) => patch({ mood: v })}
      />

      <TextAreaField
        label="Summary"
        value={tokens.summary ?? ""}
        disabled={disabled}
        placeholder="2–3 sentences framing the brand voice"
        onChange={(v) => patch({ summary: v || undefined })}
      />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[#6B655D]">
        {label}
      </label>
      {children}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <Field label={label}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-[13px] outline-none focus:border-[#D9623A] disabled:opacity-50"
      />
    </Field>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <Field label={label}>
      <textarea
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
        className="w-full resize-none rounded-md border border-black/10 bg-white px-3 py-2 text-[13px] outline-none focus:border-[#D9623A] disabled:opacity-50"
      />
    </Field>
  );
}
