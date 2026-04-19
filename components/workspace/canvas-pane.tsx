"use client";

import type { InitialArtifact } from "./workspace";
import { CanvasHeader } from "./canvas-header";
import { CanvasPlaceholder } from "./canvas-placeholder";

type Props = {
  artifact: InitialArtifact;
  streaming: boolean;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
};

export function CanvasPane({ artifact, streaming, fullscreen, onToggleFullscreen }: Props) {
  return (
    <section
      className={`relative mt-3 flex flex-col overflow-hidden border border-black/5 bg-white ${
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
      />
      {artifact ? (
        <iframe
          key={artifact.version}
          title={artifact.title ?? "artifact"}
          srcDoc={artifact.html}
          sandbox="allow-scripts allow-same-origin"
          className="flex-1 w-full bg-white"
        />
      ) : (
        <CanvasPlaceholder streaming={streaming} />
      )}
    </section>
  );
}
