"use client";

import { useEffect, useState, type RefObject } from "react";

export type InspectorSelection = {
  leafId: string;
  tag: string;
  computed: Record<string, string>;
};

type Props = {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  selection: InspectorSelection | null;
  onClose: () => void;
};

type FieldKey =
  | "width"
  | "height"
  | "paddingTop"
  | "paddingRight"
  | "paddingBottom"
  | "paddingLeft"
  | "marginTop"
  | "marginRight"
  | "marginBottom"
  | "marginLeft";

const FIELDS: { group: string; rows: { label: string; keys: FieldKey[] }[] }[] = [
  {
    group: "Size",
    rows: [{ label: "W / H", keys: ["width", "height"] }],
  },
  {
    group: "Padding",
    rows: [
      { label: "T / R", keys: ["paddingTop", "paddingRight"] },
      { label: "B / L", keys: ["paddingBottom", "paddingLeft"] },
    ],
  },
  {
    group: "Margin",
    rows: [
      { label: "T / R", keys: ["marginTop", "marginRight"] },
      { label: "B / L", keys: ["marginBottom", "marginLeft"] },
    ],
  },
];

export function Inspector({ iframeRef, selection, onClose }: Props) {
  const [local, setLocal] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selection) setLocal(shortenValues(selection.computed));
    else setLocal({});
  }, [selection?.leafId, selection?.computed]);

  if (!selection) {
    return (
      <aside className="cd-enter-slide-right flex w-[240px] flex-col border-l border-black/5 bg-[#FAF6EF] px-3 py-3 text-[12px] text-[#6B655D]">
        <p className="font-medium text-[#1F1B16]">Inspector</p>
        <p className="mt-1 text-[11px]">Click any element in the canvas to edit its size, padding, or margin.</p>
      </aside>
    );
  }

  function push(key: FieldKey, value: string) {
    setLocal((prev) => ({ ...prev, [key]: value }));
    iframeRef.current?.contentWindow?.postMessage(
      {
        source: "cd-editor-host",
        type: "set-style",
        leafId: selection!.leafId,
        prop: key,
        value,
      },
      "*",
    );
  }

  return (
    <aside className="cd-enter-slide-right flex w-[240px] flex-col border-l border-black/5 bg-[#FAF6EF] text-[12px] text-[#3D3831]">
      <div className="flex items-center justify-between border-b border-black/5 px-3 py-2">
        <div>
          <p className="font-medium text-[#1F1B16]">Inspector</p>
          <p className="text-[10px] uppercase tracking-wide text-[#9A9389]">
            {selection.tag}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-1 text-[11px] text-[#6B655D] hover:bg-black/5"
        >
          Clear
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {FIELDS.map((section) => (
          <div key={section.group}>
            <p className="mb-1.5 text-[10px] uppercase tracking-wide text-[#9A9389]">
              {section.group}
            </p>
            <div className="space-y-1.5">
              {section.rows.map((row) => (
                <div key={row.label} className="flex items-center gap-1.5">
                  <span className="w-10 text-[10px] text-[#9A9389]">
                    {row.label}
                  </span>
                  {row.keys.map((k) => (
                    <input
                      key={k}
                      value={local[k] ?? ""}
                      placeholder="auto"
                      onChange={(e) => push(k, e.target.value)}
                      className="w-full rounded-md border border-black/10 bg-white px-2 py-1 text-[11px] focus:border-[#D9623A] focus:outline-none"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function shortenValues(map: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(map)) {
    if (typeof v !== "string") continue;
    out[k] = normalize(v);
  }
  return out;
}

function normalize(v: string): string {
  // Strip trailing "px" if it's a plain number-px value, to make the input feel like a number field.
  const m = v.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (m) return m[1] + "px";
  return v;
}
