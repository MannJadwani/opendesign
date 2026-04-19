"use client";

import { useEffect, useRef, type RefObject } from "react";

type Args = {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  leafId: string | null;
  active: boolean;
  onCommit: (computed: Record<string, string>) => void;
};

// Mounts a moveable instance INSIDE the iframe document so overlay coords line
// up with the target. Dynamic import keeps moveable out of the main bundle.
export function useMoveableOverlay({ iframeRef, leafId, active, onCommit }: Args) {
  const instanceRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    if (!active || !leafId) return;

    let disposed = false;
    let instance: { destroy: () => void } | null = null;

    (async () => {
      const mod = await import("moveable");
      if (disposed) return;
      // Re-read the iframe + doc after the dynamic import resolves. The iframe
      // may have remounted (new artifact version) or srcDoc reloaded while we
      // were awaiting — a stale `doc` can have a null body, which crashes
      // Moveable's mount with "container.__CROACT__ is null".
      const frame = iframeRef.current;
      const doc = frame?.contentDocument;
      const body = doc?.body;
      if (!doc || !body) return;
      const target = doc.querySelector(
        `[data-cd-leaf="${cssEscape(leafId)}"]`,
      ) as HTMLElement | null;
      if (!target || !doc.body.contains(target)) return;
      const Moveable = mod.default;
      const m = new Moveable(body, {
        target,
        draggable: false,
        resizable: true,
        keepRatio: false,
        throttleResize: 0,
        origin: false,
        edge: false,
        renderDirections: ["nw", "n", "ne", "w", "e", "sw", "s", "se"],
      });
      m.on("resize", ({ width, height }: { width: number; height: number }) => {
        target.style.width = `${Math.round(width)}px`;
        target.style.height = `${Math.round(height)}px`;
        m.updateRect();
      });
      m.on("resizeEnd", () => {
        const cs = doc.defaultView!.getComputedStyle(target);
        const computed: Record<string, string> = {
          width: cs.width,
          height: cs.height,
          paddingTop: cs.paddingTop,
          paddingRight: cs.paddingRight,
          paddingBottom: cs.paddingBottom,
          paddingLeft: cs.paddingLeft,
          marginTop: cs.marginTop,
          marginRight: cs.marginRight,
          marginBottom: cs.marginBottom,
          marginLeft: cs.marginLeft,
        };
        onCommit(computed);
      });
      instance = m as unknown as { destroy: () => void };
      instanceRef.current = instance;
    })();

    return () => {
      disposed = true;
      instance?.destroy();
      instanceRef.current = null;
    };
  }, [active, leafId, iframeRef, onCommit]);

  return instanceRef;
}

function cssEscape(s: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(s);
  return s.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);
}
