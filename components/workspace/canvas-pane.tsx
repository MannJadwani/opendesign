"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { ArtifactVariant, InitialArtifact } from "./workspace";
import { CanvasHeader, type DeviceMode } from "./canvas-header";
import { CanvasPlaceholder } from "./canvas-placeholder";
import { VariantStrip } from "./variant-strip";
import { DeckStrip } from "./deck-strip";
import { EditBar } from "./edit-bar";
import { Inspector, type InspectorSelection } from "./inspector";
import { injectEditorScript } from "@/lib/workspace/editor-inject";
import {
  saveEditedArtifact,
  createComment,
  resolveComment,
  deleteComment,
  listCommentsForArtifact,
  type CommentRow,
} from "@/lib/actions";
import { useMoveableOverlay } from "@/lib/workspace/use-moveable";
import { CommentOverlay } from "./comment-overlay";
import { ControlsPanel } from "./controls-panel";

type Props = {
  projectId: string;
  outputType: string;
  artifact: InitialArtifact;
  variants: ArtifactVariant[];
  activeIndex: number;
  onSelectVariant: (i: number) => void;
  onArtifactSaved: (id: string, html: string, version: number) => void;
  streaming: boolean;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  onApplyComment: (comment: CommentRow) => void;
  onRegenerateFromControls: (summary: string) => void;
  onExplore: () => void;
  onContinueWithVariant: (i: number) => void;
};

export function CanvasPane({
  projectId,
  outputType,
  artifact,
  variants,
  activeIndex,
  onSelectVariant,
  onArtifactSaved,
  streaming,
  fullscreen,
  onToggleFullscreen,
  iframeRef,
  onApplyComment,
  onRegenerateFromControls,
  onExplore,
  onContinueWithVariant,
}: Props) {
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [editMode, setEditMode] = useState(false);
  const [commentMode, setCommentMode] = useState(false);
  const [compareIndex, setCompareIndex] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const serializePendingRef = useRef<Map<string, (html: string) => void>>(new Map());
  const [selection, setSelection] = useState<InspectorSelection | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [pending, setPending] = useState<{
    xPct: number;
    yPct: number;
    leafId: string | null;
    anchor: string | null;
  } | null>(null);

  // Reset edit state whenever the active artifact changes.
  useEffect(() => {
    setDirty(false);
    setSaveError(null);
    setEditMode(false);
    setCommentMode(false);
    setSelection(null);
    setPending(null);
  }, [artifact?.html, artifact?.version, artifact?.variant]);

  // Load comments whenever the active artifact id changes.
  useEffect(() => {
    if (!artifact?.id) {
      setComments([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await listCommentsForArtifact(projectId, artifact.id!);
        if (!cancelled) setComments(rows);
      } catch {
        if (!cancelled) setComments([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [artifact?.id, projectId]);

  // Listen for edits coming back from the iframe.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const data = e.data as { source?: string; type?: string } | null;
      if (!data || data.source !== "cd-editor") return;
      if (data.type === "ready") {
        iframeRef.current?.contentWindow?.postMessage(
          { source: "cd-editor-host", type: "set-mode", on: editMode },
          "*",
        );
        iframeRef.current?.contentWindow?.postMessage(
          { source: "cd-editor-host", type: "set-comment-mode", on: commentMode },
          "*",
        );
        return;
      }
      if (data.type === "edit" || data.type === "dirty") {
        setDirty(true);
        return;
      }
      if (data.type === "serialized") {
        const d = data as unknown as { requestId: string; html: string };
        const resolve = serializePendingRef.current.get(d.requestId);
        if (resolve) {
          serializePendingRef.current.delete(d.requestId);
          resolve(d.html);
        }
        return;
      }
      if (data.type === "select") {
        const d = data as unknown as InspectorSelection;
        setSelection({ leafId: d.leafId, tag: d.tag, computed: d.computed });
        return;
      }
      if (data.type === "deselect") {
        setSelection(null);
        return;
      }
      if (data.type === "select-update") {
        const d = data as unknown as {
          leafId: string;
          computed: Record<string, string>;
        };
        setSelection((prev) =>
          prev && prev.leafId === d.leafId ? { ...prev, computed: d.computed } : prev,
        );
        return;
      }
      if (data.type === "comment-place") {
        const d = data as unknown as {
          xPct: number;
          yPct: number;
          leafId: string | null;
          anchor: string | null;
        };
        setPending({
          xPct: d.xPct,
          yPct: d.yPct,
          leafId: d.leafId ?? null,
          anchor: d.anchor ?? null,
        });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [editMode, commentMode, iframeRef]);

  // Push edit mode into iframe whenever it flips.
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { source: "cd-editor-host", type: "set-mode", on: editMode },
      "*",
    );
  }, [editMode, iframeRef]);

  // Push comment mode into iframe whenever it flips.
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { source: "cd-editor-host", type: "set-comment-mode", on: commentMode },
      "*",
    );
  }, [commentMode, iframeRef]);

  const srcDoc = useMemo(
    () => (artifact ? injectEditorScript(artifact.html) : ""),
    [artifact?.html, artifact?.version, artifact?.variant],
  );

  const onMoveableCommit = useCallback(
    (computed: Record<string, string>) => {
      setDirty(true);
      setSelection((prev) =>
        prev ? { ...prev, computed: { ...prev.computed, ...computed } } : prev,
      );
    },
    [],
  );

  const moveableRef = useMoveableOverlay({
    iframeRef,
    leafId: selection?.leafId ?? null,
    active: editMode && !!artifact,
    onCommit: onMoveableCommit,
  });

  const onSave = useCallback(async () => {
    if (!artifact) return;
    const frame = iframeRef.current;
    if (!frame?.contentWindow) return;
    setSaveError(null);
    setSaving(true);
    // Destroy moveable overlay first so its handles/styles don't bleed into the
    // serialized HTML.
    moveableRef.current?.destroy();
    moveableRef.current = null;
    try {
      const requestId = Math.random().toString(36).slice(2);
      const nextHtml = await new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => {
          serializePendingRef.current.delete(requestId);
          reject(new Error("serialize timeout"));
        }, 5000);
        serializePendingRef.current.set(requestId, (html) => {
          clearTimeout(timer);
          resolve(html);
        });
        frame.contentWindow!.postMessage(
          { source: "cd-editor-host", type: "serialize", requestId },
          "*",
        );
      });
      const res = await saveEditedArtifact(
        projectId,
        nextHtml,
        artifact.title,
        artifact.controls,
      );
      onArtifactSaved(res.id, nextHtml, res.version);
      setDirty(false);
      setEditMode(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "save failed");
    } finally {
      setSaving(false);
    }
  }, [artifact, iframeRef, moveableRef, onArtifactSaved, projectId]);

  const onCreateComment = useCallback(
    async (body: string) => {
      if (!artifact?.id || !pending) return;
      const row = await createComment(projectId, artifact.id, {
        body,
        xPct: pending.xPct,
        yPct: pending.yPct,
        leafId: pending.leafId,
        anchor: pending.anchor,
      });
      setComments((prev) => [row, ...prev]);
      setPending(null);
    },
    [artifact?.id, pending, projectId],
  );

  const onCancelPending = useCallback(() => setPending(null), []);

  const onResolveComment = useCallback(
    async (id: string, resolved: boolean) => {
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, resolved } : c)));
      try {
        await resolveComment(projectId, id, resolved);
      } catch {
        // revert on failure
        setComments((prev) => prev.map((c) => (c.id === id ? { ...c, resolved: !resolved } : c)));
      }
    },
    [projectId],
  );

  const onDeleteCommentCb = useCallback(
    async (id: string) => {
      const snapshot = comments;
      setComments((prev) => prev.filter((c) => c.id !== id));
      try {
        await deleteComment(projectId, id);
      } catch {
        setComments(snapshot);
      }
    },
    [comments, projectId],
  );

  const onApplyCommentCb = useCallback(
    (c: CommentRow) => {
      onApplyComment(c);
      void onResolveComment(c.id, true);
    },
    [onApplyComment, onResolveComment],
  );

  const onDiscard = useCallback(() => {
    setDirty(false);
    setEditMode(false);
    // Force iframe reload to drop any uncommitted DOM edits.
    const f = iframeRef.current;
    if (f) {
      const s = f.srcdoc;
      f.srcdoc = "";
      requestAnimationFrame(() => {
        if (f) f.srcdoc = s;
      });
    }
  }, [iframeRef]);

  return (
    <section
      className={`relative mt-3 flex min-w-0 flex-1 flex-col overflow-hidden border border-black/5 bg-white ${
        fullscreen ? "mx-3 rounded-t-2xl" : "rounded-tl-2xl"
      }`}
      style={
        artifact
          ? undefined
          : {
              backgroundImage: "radial-gradient(circle, #E4DED3 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }
      }
    >
      <CanvasHeader
        title={artifact?.title}
        version={artifact?.version}
        streaming={streaming}
        fullscreen={fullscreen}
        onToggleFullscreen={onToggleFullscreen}
        hasArtifact={!!artifact}
        device={device}
        onDeviceChange={setDevice}
        editMode={editMode}
        onToggleEdit={() => {
          setEditMode((v) => !v);
          setCommentMode(false);
          setPending(null);
        }}
        canEdit={!!artifact && !streaming}
        commentMode={commentMode}
        onToggleComment={() => {
          setCommentMode((v) => !v);
          setEditMode(false);
          setPending(null);
        }}
        canComment={!!artifact?.id && !streaming}
        onExplore={onExplore}
        canExplore={!!artifact && !streaming}
      />
      {outputType === "slides" && variants.length > 0 ? (
        <DeckStrip
          slides={variants}
          activeIndex={activeIndex}
          onSelect={(i) => {
            onSelectVariant(i);
            setCompareIndex(null);
          }}
          disableKeys={editMode || commentMode}
          onContinueWith={onContinueWithVariant}
          canContinue={!streaming}
        />
      ) : (
        variants.length > 1 && (
          <VariantStrip
            variants={variants}
            activeIndex={activeIndex}
            onSelect={(i) => {
              onSelectVariant(i);
              if (compareIndex === i) setCompareIndex(null);
            }}
            compareIndex={compareIndex}
            onToggleCompare={(i) =>
              setCompareIndex((cur) => (cur === i || i === activeIndex ? null : i))
            }
            onContinueWith={onContinueWithVariant}
            canContinue={!streaming}
          />
        )
      )}
      {editMode && artifact && (
        <EditBar
          dirty={dirty}
          saving={saving}
          error={saveError}
          onSave={onSave}
          onDiscard={onDiscard}
          onExit={() => setEditMode(false)}
        />
      )}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex min-w-0 flex-1 overflow-hidden">
          {artifact ? (
            device === "mobile" ? (
              <div className="flex flex-1 items-start justify-center overflow-auto bg-[#EEE7D9] p-6">
                <div className="cd-enter-pop relative overflow-hidden rounded-[32px] border border-black/10 bg-black p-2 shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
                  <div className="relative">
                    <iframe
                      ref={iframeRef}
                      key={`${artifact.version}-${artifact.variant}`}
                      title={artifact.title ?? "artifact"}
                      srcDoc={srcDoc}
                      sandbox="allow-scripts allow-same-origin"
                      className="block h-[780px] w-[390px] rounded-[24px] bg-white"
                    />
                    <CommentOverlay
                      comments={comments}
                      pending={pending}
                      onCreate={onCreateComment}
                      onCancelPending={onCancelPending}
                      onResolve={onResolveComment}
                      onDelete={onDeleteCommentCb}
                      onApply={onApplyCommentCb}
                    />
                  </div>
                </div>
              </div>
            ) : compareIndex !== null && variants[compareIndex] && !editMode && !commentMode ? (
              <div className="flex min-w-0 flex-1 gap-0 divide-x divide-black/10">
                <div className="relative flex min-w-0 flex-1 flex-col">
                  <div className="border-b border-black/5 bg-[#F5F0E8]/80 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-[#6B655D]">
                    {variants[activeIndex]?.title?.trim() || `Variant ${activeIndex + 1}`}
                  </div>
                  <iframe
                    ref={iframeRef}
                    key={`active-${artifact.version}-${artifact.variant}`}
                    title={artifact.title ?? "artifact"}
                    srcDoc={srcDoc}
                    sandbox="allow-scripts allow-same-origin"
                    className="h-full w-full bg-white"
                  />
                </div>
                <div className="relative flex min-w-0 flex-1 flex-col">
                  <div className="border-b border-black/5 bg-[#F5F0E8]/80 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-[#D9623A]">
                    {variants[compareIndex].title?.trim() || `Variant ${compareIndex + 1}`} · vs
                  </div>
                  <iframe
                    key={`compare-${variants[compareIndex].version}-${variants[compareIndex].variant}`}
                    title={variants[compareIndex].title ?? "compare"}
                    srcDoc={injectEditorScript(variants[compareIndex].html)}
                    sandbox="allow-scripts allow-same-origin"
                    className="h-full w-full bg-white"
                  />
                </div>
              </div>
            ) : outputType === "slides" && !editMode && !commentMode ? (
              <div className="flex min-w-0 flex-1 items-center justify-center overflow-auto bg-[#0D0D0D] p-6">
                <div className="relative aspect-[16/9] w-full max-w-[1280px] overflow-hidden rounded-xl border border-white/5 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
                  <iframe
                    ref={iframeRef}
                    key={`${artifact.version}-${artifact.variant}`}
                    title={artifact.title ?? "slide"}
                    srcDoc={srcDoc}
                    sandbox="allow-scripts allow-same-origin"
                    className="h-full w-full bg-white"
                  />
                  <CommentOverlay
                    comments={comments}
                    pending={pending}
                    onCreate={onCreateComment}
                    onCancelPending={onCancelPending}
                    onResolve={onResolveComment}
                    onDelete={onDeleteCommentCb}
                    onApply={onApplyCommentCb}
                  />
                </div>
              </div>
            ) : (
              <div className="relative min-w-0 flex-1">
                <iframe
                  ref={iframeRef}
                  key={`${artifact.version}-${artifact.variant}`}
                  title={artifact.title ?? "artifact"}
                  srcDoc={srcDoc}
                  sandbox="allow-scripts allow-same-origin"
                  className="h-full w-full bg-white"
                />
                <CommentOverlay
                  comments={comments}
                  pending={pending}
                  onCreate={onCreateComment}
                  onCancelPending={onCancelPending}
                  onResolve={onResolveComment}
                  onDelete={onDeleteCommentCb}
                  onApply={onApplyCommentCb}
                />
              </div>
            )
          ) : (
            <CanvasPlaceholder streaming={streaming} />
          )}
        </div>
        {editMode && artifact && (
          <Inspector
            iframeRef={iframeRef}
            selection={selection}
            onClose={() => {
              setSelection(null);
              iframeRef.current?.contentWindow?.postMessage(
                { source: "cd-editor-host", type: "deselect" },
                "*",
              );
            }}
          />
        )}
      </div>
      {!editMode && artifact && (artifact.controls?.length ?? 0) > 0 && (
        <ControlsPanel
          iframeRef={iframeRef}
          controls={artifact.controls}
          onRegenerate={onRegenerateFromControls}
        />
      )}
    </section>
  );
}
