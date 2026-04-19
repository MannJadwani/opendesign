"use client";

import { useState, useTransition } from "react";
import type { BrandTokens } from "@/lib/ai/scrapers/brand-ingest";
import {
  ingestBrandAction,
  setBrandApplyAction,
  clearBrandAction,
} from "@/lib/actions";

type Props = {
  projectId: string;
  initialTokens: BrandTokens | null;
  initialApply: boolean;
};

export function BrandEditor({
  projectId,
  initialTokens,
  initialApply,
}: Props) {
  const [tokens, setTokens] = useState<BrandTokens | null>(initialTokens);
  const [apply, setApply] = useState(initialApply);
  const [kind, setKind] = useState<"site" | "image">("site");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ingesting, startIngest] = useTransition();
  const [toggling, startToggle] = useTransition();
  const [clearing, startClear] = useTransition();

  function onIngest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = url.trim();
    if (!trimmed) return;
    startIngest(async () => {
      try {
        const res = await ingestBrandAction(projectId, { kind, url: trimmed });
        setTokens(res.tokens);
        setApply(true);
        setUrl("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "ingest failed");
      }
    });
  }

  function onToggleApply(next: boolean) {
    setApply(next);
    startToggle(async () => {
      try {
        await setBrandApplyAction(projectId, next);
      } catch {
        setApply(!next);
      }
    });
  }

  function onClear() {
    startClear(async () => {
      try {
        await clearBrandAction(projectId);
        setTokens(null);
        setApply(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "clear failed");
      }
    });
  }

  return (
    <div className="mt-8 space-y-6">
      <form onSubmit={onIngest} className="space-y-3">
        <div className="flex gap-1 rounded-md border border-black/10 bg-white p-0.5 text-[12px]">
          <button
            type="button"
            onClick={() => setKind("site")}
            className={`flex-1 rounded px-3 py-1.5 font-medium transition-colors ${
              kind === "site"
                ? "bg-[#1F1B16] text-white"
                : "text-[#3D3831] hover:bg-[#FAF6EF]"
            }`}
          >
            Site URL
          </button>
          <button
            type="button"
            onClick={() => setKind("image")}
            className={`flex-1 rounded px-3 py-1.5 font-medium transition-colors ${
              kind === "image"
                ? "bg-[#1F1B16] text-white"
                : "text-[#3D3831] hover:bg-[#FAF6EF]"
            }`}
          >
            Image URL
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="url"
            required
            placeholder={
              kind === "site" ? "https://linear.app" : "https://…/hero.png"
            }
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 rounded-md border border-black/10 bg-white px-3 py-2 text-[13px] outline-none focus:border-[#D9623A]"
          />
          <button
            type="submit"
            disabled={ingesting || !url.trim()}
            className="rounded-md bg-[#D9623A] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#C0462A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {ingesting ? "Reading…" : "Ingest"}
          </button>
        </div>
        {error && (
          <p className="text-[12px] text-[#D9623A]">{error}</p>
        )}
      </form>

      {tokens ? (
        <section className="rounded-lg border border-black/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Extracted brand</h2>
            <div className="flex items-center gap-3 text-[12px]">
              <label className="flex cursor-pointer items-center gap-2 text-[#3D3831]">
                <input
                  type="checkbox"
                  checked={apply}
                  disabled={toggling}
                  onChange={(e) => onToggleApply(e.target.checked)}
                />
                Apply to generations
              </label>
              <button
                type="button"
                onClick={onClear}
                disabled={clearing}
                className="rounded border border-black/10 px-2 py-1 text-[11px] text-[#6B655D] hover:bg-[#FAF6EF] disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-[120px_1fr] gap-x-4 gap-y-3 text-[13px]">
            <dt className="text-[#6B655D]">Palette</dt>
            <dd>
              <div className="flex flex-wrap gap-1.5">
                {tokens.palette.length === 0 ? (
                  <span className="text-[#9A9389]">none</span>
                ) : (
                  tokens.palette.map((c) => (
                    <div
                      key={c}
                      className="flex items-center gap-1.5 rounded border border-black/10 bg-[#FAF6EF] px-1.5 py-0.5"
                    >
                      <span
                        className="block h-4 w-4 rounded-sm border border-black/10"
                        style={{ background: c }}
                      />
                      <span className="font-mono text-[11px]">{c}</span>
                    </div>
                  ))
                )}
              </div>
            </dd>

            <dt className="text-[#6B655D]">Typography</dt>
            <dd>{tokens.typography}</dd>

            <dt className="text-[#6B655D]">Layout</dt>
            <dd>{tokens.layout}</dd>

            <dt className="text-[#6B655D]">Mood</dt>
            <dd>{tokens.mood}</dd>

            {tokens.summary && (
              <>
                <dt className="text-[#6B655D]">Summary</dt>
                <dd className="text-[#3D3831]">{tokens.summary}</dd>
              </>
            )}

            {tokens.themeColor && (
              <>
                <dt className="text-[#6B655D]">Theme color</dt>
                <dd className="font-mono text-[12px]">{tokens.themeColor}</dd>
              </>
            )}

            {tokens.sourceUrl && (
              <>
                <dt className="text-[#6B655D]">Source site</dt>
                <dd className="truncate">
                  <a
                    href={tokens.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#D9623A] hover:underline"
                  >
                    {tokens.sourceUrl}
                  </a>
                </dd>
              </>
            )}

            {tokens.sourceImageUrl && (
              <>
                <dt className="text-[#6B655D]">Source image</dt>
                <dd>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tokens.sourceImageUrl}
                    alt="brand source"
                    className="max-h-48 rounded border border-black/10"
                  />
                </dd>
              </>
            )}
          </dl>
        </section>
      ) : (
        <p className="text-[13px] text-[#9A9389]">
          No brand pinned yet. Paste a site URL (e.g. a company landing page) or a direct image URL above.
        </p>
      )}
    </div>
  );
}
