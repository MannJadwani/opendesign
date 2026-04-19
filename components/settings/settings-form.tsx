"use client";

import { useState, useTransition } from "react";
import {
  addCustomModelAction,
  clearOpenRouterKeyAction,
  removeCustomModelAction,
  setOpenRouterKeyAction,
  setSelectedModelAction,
  type CustomModel,
  type UserSettings,
} from "@/lib/actions";
import type { ModelOption } from "@/lib/ai/models";

type Props = {
  initial: UserSettings;
  presets: ModelOption[];
  defaultModelId: string;
};

export function SettingsForm({ initial, presets, defaultModelId }: Props) {
  const [selected, setSelected] = useState(initial.selectedModelId ?? "");
  const [customs, setCustoms] = useState<CustomModel[]>(initial.customModels);
  const [newId, setNewId] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [keyPreview, setKeyPreview] = useState<string | null>(
    initial.openRouterKeyPreview,
  );
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const effectiveId = selected || defaultModelId;

  function pick(id: string) {
    setSelected(id);
    startTransition(async () => {
      await setSelectedModelAction(id || null);
      setStatus("Model saved.");
    });
  }

  function addCustom() {
    const id = newId.trim();
    if (!id) return;
    const label = newLabel.trim() || id;
    startTransition(async () => {
      try {
        await addCustomModelAction({ id, label });
        setCustoms((prev) =>
          prev.some((m) => m.id === id) ? prev : [...prev, { id, label }],
        );
        setNewId("");
        setNewLabel("");
        setStatus(`Added ${label}.`);
      } catch (e) {
        setStatus(e instanceof Error ? e.message : "Failed to add.");
      }
    });
  }

  function removeCustom(id: string) {
    startTransition(async () => {
      await removeCustomModelAction(id);
      setCustoms((prev) => prev.filter((m) => m.id !== id));
      if (selected === id) setSelected("");
      setStatus("Removed.");
    });
  }

  function saveKey() {
    if (!initial.hasAppSecret) {
      setStatus("APP_SECRET env var must be set to store keys.");
      return;
    }
    const k = keyInput.trim();
    if (!k) return;
    startTransition(async () => {
      try {
        await setOpenRouterKeyAction(k);
        setKeyPreview(k.slice(0, 6) + "…" + k.slice(-4));
        setKeyInput("");
        setStatus("Key saved (encrypted).");
      } catch (e) {
        setStatus(e instanceof Error ? e.message : "Failed.");
      }
    });
  }

  function clearKey() {
    startTransition(async () => {
      await clearOpenRouterKeyAction();
      setKeyPreview(null);
      setStatus("Key cleared. Falls back to server env var.");
    });
  }

  return (
    <div className="mt-8 space-y-10">
      {/* Model */}
      <section>
        <h2 className="font-serif text-xl">Model</h2>
        <p className="mt-1 text-[12px] text-[#6B655D]">
          Active: <span className="font-medium text-[#1F1B16]">{effectiveId}</span>
          {!selected && (
            <span className="ml-1 text-[11px] text-[#9A9389]">(default)</span>
          )}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {presets.map((p) => (
            <ModelRow
              key={p.id}
              id={p.id}
              label={p.label}
              meta={`${p.vendor}${p.tier ? " · " + p.tier : ""}`}
              selected={selected === p.id}
              onSelect={() => pick(p.id)}
            />
          ))}
        </div>

        {customs.length > 0 && (
          <>
            <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-[#6B655D]">
              Custom
            </p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {customs.map((m) => (
                <ModelRow
                  key={m.id}
                  id={m.id}
                  label={m.label}
                  meta={m.id}
                  selected={selected === m.id}
                  onSelect={() => pick(m.id)}
                  onRemove={() => removeCustom(m.id)}
                />
              ))}
            </div>
          </>
        )}

        <div className="mt-6 rounded-xl border border-dashed border-black/15 bg-[#F5F0E8] p-4">
          <p className="text-[12px] font-medium text-[#3D3831]">
            Add a custom OpenRouter model tag
          </p>
          <p className="mt-1 text-[11px] text-[#6B655D]">
            Paste any slug from openrouter.ai/models — e.g.{" "}
            <code className="rounded bg-white/70 px-1">
              openai/gpt-5
            </code>
            ,{" "}
            <code className="rounded bg-white/70 px-1">
              x-ai/grok-4
            </code>
            ,{" "}
            <code className="rounded bg-white/70 px-1">
              mistralai/magistral-medium
            </code>
            .
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder="vendor/model-name"
              className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-[13px] focus:border-[#D9623A] focus:outline-none"
            />
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Display label (optional)"
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[13px] focus:border-[#D9623A] focus:outline-none sm:w-56"
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={pending || !newId.trim()}
              className="rounded-lg bg-[#1F1B16] px-3 py-2 text-[13px] font-medium text-white hover:bg-black disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </section>

      {/* API key */}
      <section>
        <h2 className="font-serif text-xl">OpenRouter API key</h2>
        <p className="mt-1 text-[12px] text-[#6B655D]">
          Optional. If set, OpenDesign calls the model with your key instead of
          the server&apos;s. Stored AES-256-GCM encrypted.
        </p>

        {!initial.hasAppSecret && (
          <p className="mt-3 rounded-lg border border-[#C0462A]/30 bg-[#FDEFE8]/60 px-3 py-2 text-[12px] text-[#C0462A]">
            APP_SECRET env var is not set on the server — key storage disabled.
            Add <code className="rounded bg-white/70 px-1">APP_SECRET</code> (16+
            chars) to .env.local to enable.
          </p>
        )}

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder={keyPreview ? `Stored: ${keyPreview}` : "sk-or-v1-…"}
            disabled={!initial.hasAppSecret}
            className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-[13px] focus:border-[#D9623A] focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={saveKey}
            disabled={pending || !keyInput.trim() || !initial.hasAppSecret}
            className="rounded-lg bg-[#D9623A] px-3 py-2 text-[13px] font-medium text-white hover:bg-[#C0462A] disabled:opacity-50"
          >
            Save
          </button>
          {keyPreview && (
            <button
              type="button"
              onClick={clearKey}
              disabled={pending}
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[13px] text-[#3D3831] hover:border-black/20 disabled:opacity-50"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {status && (
        <p className="text-[12px] text-[#6B655D]">{status}</p>
      )}
    </div>
  );
}

function ModelRow({
  id,
  label,
  meta,
  selected,
  onSelect,
  onRemove,
}: {
  id: string;
  label: string;
  meta: string;
  selected: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}) {
  return (
    <div
      className={`group flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${
        selected
          ? "border-[#D9623A] bg-[#FDEFE8]/60"
          : "border-black/10 bg-white hover:border-black/20"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex-1 text-left"
      >
        <p className="text-[13px] font-medium text-[#1F1B16]">{label}</p>
        <p className="mt-0.5 font-mono text-[11px] text-[#6B655D]">{meta}</p>
      </button>
      <div className="flex items-center gap-2">
        {selected && (
          <span className="rounded-full bg-[#D9623A] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
            Active
          </span>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md px-1.5 py-0.5 text-[11px] text-[#C0462A] hover:bg-[#FDEFE8]"
            aria-label={`Remove ${id}`}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
