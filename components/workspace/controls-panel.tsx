"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { ArtifactControl } from "@/lib/workspace/controls";

type Props = {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  controls: ArtifactControl[];
  onRegenerate: (summary: string) => void;
};

// Renders Claude-emitted sliders grouped by target block. Each slider drives
// the iframe via the existing editor-inject bridge (set-style-anchor / set-var).
// Live preview is instant; pushing the tuned values back to Claude is opt-in
// via the Regenerate button so every micro-tweak doesn't fire a model turn.
export function ControlsPanel({ iframeRef, controls, onRegenerate }: Props) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(controls.map((c) => [c.id, c.current])),
  );

  // Reset local state when the controls identity changes (new artifact).
  const controlsKey = controls.map((c) => c.id).join("|");
  useEffect(() => {
    setValues(Object.fromEntries(controls.map((c) => [c.id, c.current])));
  }, [controlsKey, controls]);

  // Push every live-preview value to the iframe once it's ready so reopened
  // projects show the current slider positions instead of the emit defaults.
  const syncedRef = useRef<string | null>(null);
  useEffect(() => {
    if (syncedRef.current === controlsKey) return;
    const frame = iframeRef.current;
    if (!frame?.contentWindow) return;
    syncedRef.current = controlsKey;
    for (const c of controls) post(frame, c, values[c.id] ?? c.current);
    // We intentionally exclude `values` — the loop above seeds initial values,
    // live edits are pushed from `onChange` instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlsKey, iframeRef]);

  if (controls.length === 0) return null;

  const grouped = groupByTarget(controls);

  function setAndPush(c: ArtifactControl, n: number) {
    setValues((prev) => ({ ...prev, [c.id]: n }));
    const frame = iframeRef.current;
    if (frame) post(frame, c, n);
  }

  function regenerate() {
    const lines = controls.map((c) => {
      const v = values[c.id] ?? c.current;
      const unit = c.unit && c.unit !== "none" ? c.unit : "";
      return `- ${c.label} (${c.target}): ${v}${unit}`;
    });
    onRegenerate(
      `Regenerate the artifact with these tuned values — keep the rest of the design intact:\n${lines.join("\n")}`,
    );
  }

  const dirty = controls.some((c) => (values[c.id] ?? c.current) !== c.current);

  return (
    <aside className="cd-enter-slide-right flex w-[260px] flex-col border-l border-black/5 bg-[#FAF6EF] text-[12px] text-[#3D3831]">
      <div className="flex items-center justify-between border-b border-black/5 px-3 py-2">
        <div>
          <p className="font-medium text-[#1F1B16]">Controls</p>
          <p className="text-[10px] uppercase tracking-wide text-[#9A9389]">
            {controls.length} slider{controls.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          onClick={regenerate}
          disabled={!dirty}
          className="rounded-md bg-[#D9623A] px-2 py-1 text-[10px] font-medium text-white hover:bg-[#C0462A] disabled:cursor-not-allowed disabled:opacity-50"
          title="Ask Claude to regenerate using these values"
        >
          Regenerate
        </button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
        {Object.entries(grouped).map(([target, group]) => (
          <div key={target}>
            <p className="mb-1.5 text-[10px] uppercase tracking-wide text-[#9A9389]">
              {target}
            </p>
            <div className="space-y-2.5">
              {group.map((c) => (
                <Slider
                  key={c.id}
                  control={c}
                  value={values[c.id] ?? c.current}
                  onChange={(n) => setAndPush(c, n)}
                  onReset={() => setAndPush(c, c.current)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function Slider({
  control,
  value,
  onChange,
  onReset,
}: {
  control: ArtifactControl;
  value: number;
  onChange: (n: number) => void;
  onReset: () => void;
}) {
  const unit = control.unit && control.unit !== "none" ? control.unit : "";
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#1F1B16]">
          {control.label}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="tabular-nums text-[11px] text-[#6B655D]">
            {formatNumber(value)}
            {unit}
          </span>
          {value !== control.current && (
            <button
              type="button"
              onClick={onReset}
              className="rounded px-1 text-[10px] text-[#9A9389] hover:text-[#D9623A]"
              title="Reset to emit default"
            >
              ↺
            </button>
          )}
        </span>
      </div>
      <input
        type="range"
        min={control.min}
        max={control.max}
        step={control.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full accent-[#D9623A]"
      />
    </div>
  );
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2).replace(/\.?0+$/, "");
}

function groupByTarget(
  controls: ArtifactControl[],
): Record<string, ArtifactControl[]> {
  const out: Record<string, ArtifactControl[]> = {};
  for (const c of controls) {
    (out[c.target] ??= []).push(c);
  }
  return out;
}

function post(
  frame: HTMLIFrameElement,
  control: ArtifactControl,
  n: number,
) {
  const unit = control.unit && control.unit !== "none" ? control.unit : "";
  const value = `${n}${unit}`;
  const win = frame.contentWindow;
  if (!win) return;
  if (control.cssVar) {
    win.postMessage(
      {
        source: "cd-editor-host",
        type: "set-var",
        anchor: control.target,
        varName: control.cssVar,
        value,
      },
      "*",
    );
  } else if (control.styleProp) {
    win.postMessage(
      {
        source: "cd-editor-host",
        type: "set-style-anchor",
        anchor: control.target,
        prop: control.styleProp,
        value,
      },
      "*",
    );
  }
}
