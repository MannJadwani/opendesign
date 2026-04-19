"use client";

import { useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { extractEmitArtifact } from "@/lib/workspace/artifact";
import { TopBar } from "./top-bar";
import { ChatPane } from "./chat-pane";
import { CanvasPane } from "./canvas-pane";

export type InitialArtifact = { html: string; title?: string; version: number } | null;

type Props = {
  projectId: string;
  projectTitle: string;
  userEmail?: string | null;
  initialMessages: UIMessage[];
  initialArtifact: InitialArtifact;
  initialShareSlug: string | null;
  createShareAction: (projectId: string) => Promise<{ slug: string }>;
  revokeShareAction: (projectId: string) => Promise<void>;
};

export function Workspace({
  projectId,
  projectTitle,
  userEmail,
  initialMessages,
  initialArtifact,
  initialShareSlug,
  createShareAction,
  revokeShareAction,
}: Props) {
  const [artifact, setArtifact] = useState<InitialArtifact>(initialArtifact);
  const [fullscreen, setFullscreen] = useState(false);

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
    onFinish: ({ message }) => {
      const emit = extractEmitArtifact(message as UIMessage);
      if (emit) {
        setArtifact({
          html: emit.html,
          title: emit.title,
          version: (artifact?.version ?? 0) + 1,
        });
      }
    },
  });

  // Stream-time scan so canvas updates mid-stream when emit tool input completes.
  const latest = chat.messages[chat.messages.length - 1];
  const streamingEmit = latest ? extractEmitArtifact(latest) : null;
  if (streamingEmit && (!artifact || streamingEmit.html !== artifact.html)) {
    setArtifact({
      html: streamingEmit.html,
      title: streamingEmit.title,
      version: (artifact?.version ?? 0) + 1,
    });
  }

  return (
    <div className="flex h-screen flex-col bg-[#E8E0D0] text-[#1F1B16]">
      <TopBar
        projectId={projectId}
        projectTitle={projectTitle}
        userEmail={userEmail}
        initialShareSlug={initialShareSlug}
        createShareAction={createShareAction}
        revokeShareAction={revokeShareAction}
      />
      <main
        className={`grid flex-1 overflow-hidden ${
          fullscreen ? "grid-cols-1" : "grid-cols-[420px_1fr]"
        }`}
      >
        {!fullscreen && (
          <ChatPane
            messages={chat.messages}
            status={chat.status}
            error={chat.error}
            sendMessage={chat.sendMessage}
            stop={chat.stop}
            clearError={chat.clearError}
          />
        )}
        <CanvasPane
          artifact={artifact}
          streaming={chat.status === "streaming"}
          fullscreen={fullscreen}
          onToggleFullscreen={() => setFullscreen((v) => !v)}
        />
      </main>
    </div>
  );
}
