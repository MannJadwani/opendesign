import { IconExpand, IconShrink } from "@/components/icons";

type Props = {
  title?: string;
  version?: number;
  streaming: boolean;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  hasArtifact: boolean;
};

export function CanvasHeader({
  title,
  version,
  streaming,
  fullscreen,
  onToggleFullscreen,
  hasArtifact,
}: Props) {
  return (
    <div className="flex items-center justify-between border-b border-black/5 bg-[#F5F0E8]/80 px-4 py-2">
      <div className="flex items-center gap-2 text-[12px] text-[#6B655D]">
        {hasArtifact ? (
          <>
            <span className="font-medium text-[#1F1B16]">{title ?? "Artifact"}</span>
            <span>·</span>
            <span>v{version}</span>
          </>
        ) : (
          <span className="text-[#9A9389]">No artifact yet</span>
        )}
        {streaming && (
          <span className="flex items-center gap-1 text-[#D9623A]">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#D9623A]" />
            live
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onToggleFullscreen}
        className="flex items-center gap-1.5 rounded-md border border-black/10 bg-white px-2 py-1 text-[11px] font-medium text-[#3D3831] hover:bg-[#FAF6EF]"
        title={fullscreen ? "Exit full screen (Esc)" : "Full screen (⇧⌘F)"}
      >
        {fullscreen ? <IconShrink /> : <IconExpand />}
        <span>{fullscreen ? "Exit" : "Full screen"}</span>
      </button>
    </div>
  );
}
