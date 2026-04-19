"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { TopBar } from "./top-bar";
import { ChatPane } from "./chat-pane";
import { CanvasPane } from "./canvas-pane";
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
}: Props) {
  const [fullscreen, setFullscreen] = useState(false);
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
      />
      <main
        className="cd-animate-cols grid flex-1 overflow-hidden"
        style={{
          gridTemplateColumns: fullscreen ? "0px 1fr" : "420px 1fr",
        }}
      >
        <div className="flex min-h-0 min-w-0 overflow-hidden">
          <ChatPane
            messages={chat.messages}
            status={chat.status}
            error={chat.error}
            sendMessage={chat.sendMessage}
            stop={chat.stop}
            clearError={chat.clearError}
          />
        </div>
        <CanvasPane
          projectId={projectId}
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
      </main>
    </div>
  );
}
