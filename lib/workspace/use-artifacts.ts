"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type { UIMessage } from "ai";
import type { UseChatHelpers } from "@ai-sdk/react";
import {
  extractEmitArtifacts,
  type EmitArtifact,
} from "@/lib/workspace/artifact";
import { getArtifactIdsForVersion } from "@/lib/actions";
import type { ArtifactControl } from "@/lib/workspace/controls";

export type ArtifactVariant = {
  id: string | null;
  html: string;
  title?: string;
  version: number;
  variant: number;
  controls: ArtifactControl[];
};

type Absorbed = { msgId: string; key: string };

type State = {
  variants: ArtifactVariant[];
  activeIndex: number;
  absorbed: Absorbed | null;
  lastTurnId: string | null;
};

type Action =
  | { type: "SEED_ABSORBED"; msgId: string; key: string }
  | { type: "ABSORB"; msgId: string; emits: EmitArtifact[] }
  | {
      type: "HYDRATE_IDS";
      version: number;
      byVariant: Map<number, string>;
    }
  | {
      type: "SAVE_COMPLETE";
      saved: ArtifactVariant;
      sealMsgId: string | null;
      sealKey: string | null;
    }
  | { type: "SELECT_VARIANT"; index: number };

function emitsKey(list: EmitArtifact[]): string {
  return list.map((e) => `${e.html.length}:${e.html.slice(0, 64)}`).join("|");
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SEED_ABSORBED": {
      // One-shot on mount so a replayed DB assistant message doesn't get
      // re-absorbed on first render and clobber DB-loaded variants.
      if (state.absorbed) return state;
      return {
        ...state,
        absorbed: { msgId: action.msgId, key: action.key },
        lastTurnId: action.msgId,
      };
    }
    case "ABSORB": {
      const key = emitsKey(action.emits);
      if (
        state.absorbed?.msgId === action.msgId &&
        state.absorbed.key === key
      ) {
        return state;
      }
      const newTurn = state.lastTurnId !== action.msgId;
      const currentVersion = state.variants[0]?.version ?? 0;
      const nextVersion = newTurn ? currentVersion + 1 : currentVersion || 1;
      const variants: ArtifactVariant[] = action.emits.map((e, i) => ({
        id: null,
        html: e.html,
        title: e.title,
        version: nextVersion,
        variant: i,
        controls: e.controls,
      }));
      return {
        variants,
        activeIndex: newTurn ? 0 : state.activeIndex,
        absorbed: { msgId: action.msgId, key },
        lastTurnId: action.msgId,
      };
    }
    case "HYDRATE_IDS": {
      let changed = false;
      const variants = state.variants.map((v) => {
        if (v.id != null || v.version !== action.version) return v;
        const id = action.byVariant.get(v.variant);
        if (!id) return v;
        changed = true;
        return { ...v, id };
      });
      return changed ? { ...state, variants } : state;
    }
    case "SAVE_COMPLETE": {
      return {
        ...state,
        variants: [action.saved],
        activeIndex: 0,
        absorbed:
          action.sealMsgId && action.sealKey
            ? { msgId: action.sealMsgId, key: action.sealKey }
            : state.absorbed,
        lastTurnId: action.sealMsgId ?? state.lastTurnId,
      };
    }
    case "SELECT_VARIANT":
      return { ...state, activeIndex: action.index };
    default:
      return state;
  }
}

type HookArgs = {
  projectId: string;
  initialMessages: UIMessage[];
  initialArtifacts: ArtifactVariant[];
  chatMessages: UIMessage[];
  status: UseChatHelpers<UIMessage>["status"];
};

// Single owner of the artifact state machine. Consolidates:
//   - initial DB hydration
//   - stream-time absorption of emit_artifact tool calls
//   - id hydration after the stream settles
//   - inline-edit save completion
// Exposes a minimal surface so the rest of the UI never touches the refs
// that previously coordinated these flows from the Workspace render body.
export function useArtifacts({
  projectId,
  initialMessages,
  initialArtifacts,
  chatMessages,
  status,
}: HookArgs) {
  const [state, dispatch] = useReducer(reducer, null, () => ({
    variants: initialArtifacts,
    activeIndex: 0,
    absorbed: null,
    lastTurnId: null,
  }));

  // Seed absorbed pointer to the last assistant emit in history so the stream
  // effect below skips already-persisted content on first mount.
  const seededRef = useRef(false);
  if (!seededRef.current) {
    seededRef.current = true;
    for (let i = initialMessages.length - 1; i >= 0; i--) {
      const m = initialMessages[i];
      if (m.role !== "assistant") continue;
      const emits = extractEmitArtifacts(m);
      if (emits.length === 0) continue;
      dispatch({
        type: "SEED_ABSORBED",
        msgId: m.id,
        key: emitsKey(emits),
      });
      break;
    }
  }

  const last = chatMessages[chatMessages.length - 1];
  const lastId = last?.id;
  const lastRole = last?.role;
  const lastParts = last?.parts;

  useEffect(() => {
    if (!last || lastRole !== "assistant") return;
    const emits = extractEmitArtifacts(last);
    if (emits.length === 0) return;
    dispatch({ type: "ABSORB", msgId: last.id, emits });
    // `lastParts` changes whenever the assistant streams in new parts — that's
    // the signal to rescan. We intentionally leave `last` out of deps and read
    // it fresh inside, since its identity is tied to lastId/lastParts anyway.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastId, lastRole, lastParts]);

  useEffect(() => {
    if (status !== "ready") return;
    const needs = state.variants.some((v) => v.id == null);
    if (!needs) return;
    const version = state.variants[0]?.version;
    if (!version) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await getArtifactIdsForVersion(projectId, version);
        if (cancelled) return;
        const byVariant = new Map(rows.map((r) => [r.variant, r.id]));
        dispatch({ type: "HYDRATE_IDS", version, byVariant });
      } catch {
        // swallow — commenting stays disabled until next page load
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, state.variants, projectId]);

  const selectVariant = useCallback((i: number) => {
    dispatch({ type: "SELECT_VARIANT", index: i });
  }, []);

  const applySave = useCallback(
    (args: {
      id: string;
      html: string;
      version: number;
      title?: string;
      controls: ArtifactControl[];
      currentAssistantMessage: UIMessage | null;
    }) => {
      const saved: ArtifactVariant = {
        id: args.id,
        html: args.html,
        title: args.title,
        version: args.version,
        variant: 0,
        controls: args.controls,
      };
      let sealMsgId: string | null = null;
      let sealKey: string | null = null;
      if (
        args.currentAssistantMessage &&
        args.currentAssistantMessage.role === "assistant"
      ) {
        sealMsgId = args.currentAssistantMessage.id;
        sealKey = emitsKey(extractEmitArtifacts(args.currentAssistantMessage));
      }
      dispatch({
        type: "SAVE_COMPLETE",
        saved,
        sealMsgId,
        sealKey,
      });
    },
    [],
  );

  const artifact = useMemo(
    () => state.variants[state.activeIndex] ?? null,
    [state.variants, state.activeIndex],
  );

  return {
    variants: state.variants,
    activeIndex: state.activeIndex,
    artifact,
    selectVariant,
    applySave,
  };
}
