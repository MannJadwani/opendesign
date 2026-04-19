"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TokensForm } from "./tokens-form";
import { updateDesignSystemAction } from "@/lib/actions";
import type { BrandTokens } from "@/lib/ai/scrapers/brand-ingest";

type Props = {
  id: string;
  initialName: string;
  initialTokens: BrandTokens;
};

export function SystemEditor({ id, initialName, initialTokens }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [tokens, setTokens] = useState<BrandTokens>(initialTokens);
  const [saving, startSave] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onSave() {
    setError(null);
    startSave(async () => {
      try {
        await updateDesignSystemAction(id, { name, tokens });
        setSavedAt(new Date());
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "save failed");
      }
    });
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 font-serif text-2xl outline-none hover:border-black/10 focus:border-[#D9623A]"
        />
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-md bg-[#D9623A] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#C0462A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      {savedAt && !saving && (
        <p className="mt-1 px-2 text-[11px] text-[#6B655D]">
          Saved {savedAt.toLocaleTimeString()}
        </p>
      )}
      {error && (
        <p className="mt-1 px-2 text-[11px] text-[#D9623A]">{error}</p>
      )}

      <div className="mt-6 rounded-lg border border-black/10 bg-white p-5">
        <TokensForm initial={tokens} onChange={setTokens} disabled={saving} />
      </div>
    </div>
  );
}
