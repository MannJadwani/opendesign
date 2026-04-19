"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { TopBar } from "./top-bar";
import { ChatPane } from "./chat-pane";
import { CanvasPane } from "./canvas-pane";
import { ApiKeyGateBanner } from "@/components/api-key-gate-banner";
import { type CommentRow } from "@/lib/actions";
import {
  useArtifacts,
  type ArtifactVariant,
} from "@/lib/workspace/use-artifacts";

export type { ArtifactVariant };
export type InitialArtifact = ArtifactVariant | null;

type Props = {
  projectId: string;
  projectTitle: string;
  userEmail?: string | null;
  initialMessages: UIMessage[];
  initialArtifacts: ArtifactVariant[];
  initialShareSlug: string | null;
  createShareAction: (projectId: string) => Promise<{ slug: string }>;
  revokeShareAction: (projectId: string) => Promise<void>;
  brandApply: boolean;
  outputType: string;
  needsApiKey?: boolean;
  selectedModelId?: string | null;
  customModels?: { id: string; label: string }[];
};

export function Workspace({
  projectId,
  projectTitle,
  userEmail,
  initialMessages,
  initialArtifacts,
  initialShareSlug,
  createShareAction,
  revokeShareAction,
  brandApply,
  outputType,
  needsApiKey = false,
  selectedModelId = null,
  customModels = [],
}: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const [mobileView, setMobileView] = useState<"chat" | "canvas">("canvas");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && fullscreen) setFullscreen(false);
      if ((e.key === "f" || e.key === "F") && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        setFullscreen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { projectId } }),
    [projectId],
  );

  const chat = useChat({
    id: projectId,
    messages: initialMessages,
    transport,
  });

  const { variants, activeIndex, artifact, selectVariant, applySave } =
    useArtifacts({
      projectId,
      initialMessages,
      initialArtifacts,
      chatMessages: chat.messages,
      status: chat.status,
    });

  return (
    <div className="flex h-screen flex-col bg-[#E8E0D0] text-[#1F1B16]">
      <TopBar
        projectId={projectId}
        projectTitle={projectTitle}
        userEmail={userEmail}
        initialShareSlug={initialShareSlug}
        createShareAction={createShareAction}
        revokeShareAction={revokeShareAction}
        artifact={artifact}
        iframeRef={iframeRef}
        brandApply={brandApply}
      />
      {needsApiKey && <ApiKeyGateBanner variant="workspace" />}
      <div className="flex items-center gap-1 border-b border-black/5 bg-[#E8E0D0] px-3 py-1.5 md:hidden">
        <button
          type="button"
          onClick={() => setMobileView("chat")}
          className={`flex-1 rounded-md px-3 py-1.5 text-[12px] font-medium ${
            mobileView === "chat"
              ? "bg-white text-[#1F1B16] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              : "text-[#6B655D]"
          }`}
        >
          Chat
        </button>
        <button
          type="button"
          onClick={() => setMobileView("canvas")}
          className={`flex-1 rounded-md px-3 py-1.5 text-[12px] font-medium ${
            mobileView === "canvas"
              ? "bg-white text-[#1F1B16] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              : "text-[#6B655D]"
          }`}
        >
          Canvas
        </button>
      </div>
      <main
        className="cd-animate-cols flex flex-1 flex-col overflow-hidden md:grid"
        style={{
          gridTemplateColumns: fullscreen ? "0px 1fr" : "420px 1fr",
        }}
      >
        <div
          className={`min-h-0 min-w-0 overflow-hidden md:flex ${
            mobileView === "chat" ? "flex flex-1" : "hidden"
          }`}
        >
          <ChatPane
            needsApiKey={needsApiKey}
            messages={chat.messages}
            status={chat.status}
            error={chat.error}
            sendMessage={chat.sendMessage}
            stop={chat.stop}
            clearError={chat.clearError}
            selectedModelId={selectedModelId}
            customModels={customModels}
          />
        </div>
        <div
          className={`min-h-0 min-w-0 flex-1 overflow-hidden md:flex ${
            mobileView === "canvas" ? "flex" : "hidden"
          }`}
        >
        <CanvasPane
          projectId={projectId}
          outputType={outputType}
          artifact={artifact}
          variants={variants}
          activeIndex={activeIndex}
          onSelectVariant={selectVariant}
          onArtifactSaved={(id, html, version) => {
            const last = chat.messages[chat.messages.length - 1] ?? null;
            applySave({
              id,
              html,
              version,
              title: artifact?.title,
              controls: artifact?.controls ?? [],
              currentAssistantMessage: last,
            });
          }}
          streaming={chat.status === "streaming"}
          fullscreen={fullscreen}
          onToggleFullscreen={() => setFullscreen((v) => !v)}
          iframeRef={iframeRef}
          onRegenerateFromControls={(summary: string) => {
            chat.sendMessage({ text: summary });
          }}
          onExplore={() => {
            chat.sendMessage({
              text: "Generate 3 genuinely distinct alternative directions for this artifact — different layout, palette, and vibe for each. Not cosmetic tweaks. Emit all 3 as separate artifacts in this turn.",
              metadata: { intent: "explore" },
            });
          }}
          onContinueWithVariant={(i: number) => {
            const picked = variants[i];
            if (!picked) return;
            const label = picked.title?.trim() || `Variant ${i + 1}`;
            const isSlide = outputType === "slides";
            const noun = isSlide ? "slide" : "variant";
            chat.sendMessage({
              text: isSlide
                ? `Locking on ${noun} ${i + 1} ("${label}"). Iterate only on this slide from now on — don't regenerate the full deck. My next instructions will refine this single slide.`
                : `Locking on ${noun} ${i + 1} ("${label}"). Discard the other alternatives. Every further change iterates on this one variant only; emit exactly one artifact per turn from now on.`,
              metadata: { intent: "pick" },
            });
          }}
          onApplyComment={(c: CommentRow) => {
            const anchor = c.anchor
              ? `data-cd-id="${c.anchor}"`
              : c.leafId
                ? `leaf "${c.leafId}"`
                : `position (${Math.round((c.xPct ?? 0) * 100)}%, ${Math.round((c.yPct ?? 0) * 100)}%)`;
            chat.sendMessage({
              text: `I left a comment on the artifact at ${anchor}: "${c.body}". Please update the design to address it.`,
            });
          }}
        />
        </div>
      </main>
    </div>
  );
}
