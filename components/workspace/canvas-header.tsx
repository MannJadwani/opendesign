import { IconChat, IconEdit, IconExpand, IconMonitor, IconPhone, IconShrink } from "@/components/icons";

export type DeviceMode = "desktop" | "mobile";

type Props = {
  title?: string;
  version?: number;
  streaming: boolean;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  hasArtifact: boolean;
  device: DeviceMode;
  onDeviceChange: (d: DeviceMode) => void;
  editMode: boolean;
  onToggleEdit: () => void;
  canEdit: boolean;
  commentMode: boolean;
  onToggleComment: () => void;
  canComment: boolean;
  onExplore: () => void;
  canExplore: boolean;
};

export function CanvasHeader({
  title,
  version,
  streaming,
  fullscreen,
  onToggleFullscreen,
  hasArtifact,
  device,
  onDeviceChange,
  editMode,
  onToggleEdit,
  canEdit,
  commentMode,
  onToggleComment,
  canComment,
  onExplore,
  canExplore,
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
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onExplore}
          disabled={!canExplore}
          title={canExplore ? "Ask OpenDesign for 3 alternative directions" : "Available once an artifact is rendered"}
          className="flex items-center gap-1.5 rounded-md border border-black/10 bg-white px-2 py-1 text-[11px] font-medium text-[#3D3831] hover:bg-[#FAF6EF] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span aria-hidden>✦</span>
          <span>Explore</span>
        </button>
        <button
          type="button"
          onClick={onToggleEdit}
          disabled={!canEdit}
          title={canEdit ? (editMode ? "Exit edit mode" : "Edit content inline") : "Available once an artifact is rendered"}
          aria-pressed={editMode}
          className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            editMode
              ? "border-[#D9623A] bg-[#D9623A] text-white hover:bg-[#C0462A]"
              : "border-black/10 bg-white text-[#3D3831] hover:bg-[#FAF6EF]"
          }`}
        >
          <IconEdit />
          <span>{editMode ? "Editing" : "Edit"}</span>
        </button>
        <button
          type="button"
          onClick={onToggleComment}
          disabled={!canComment}
          title={canComment ? (commentMode ? "Exit comment mode" : "Pin a comment on the canvas") : "Available once the artifact is saved"}
          aria-pressed={commentMode}
          className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            commentMode
              ? "border-[#D9623A] bg-[#D9623A] text-white hover:bg-[#C0462A]"
              : "border-black/10 bg-white text-[#3D3831] hover:bg-[#FAF6EF]"
          }`}
        >
          <IconChat />
          <span>{commentMode ? "Commenting" : "Comment"}</span>
        </button>
        <div className="flex items-center rounded-md border border-black/10 bg-white p-0.5">
          <button
            type="button"
            onClick={() => onDeviceChange("desktop")}
            aria-pressed={device === "desktop"}
            title="Desktop preview"
            className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
              device === "desktop"
                ? "bg-[#1F1B16] text-white"
                : "text-[#3D3831] hover:bg-[#FAF6EF]"
            }`}
          >
            <IconMonitor />
            <span>Web</span>
          </button>
          <button
            type="button"
            onClick={() => onDeviceChange("mobile")}
            aria-pressed={device === "mobile"}
            title="Mobile preview"
            className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
              device === "mobile"
                ? "bg-[#1F1B16] text-white"
                : "text-[#3D3831] hover:bg-[#FAF6EF]"
            }`}
          >
            <IconPhone />
            <span>Mobile</span>
          </button>
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
    </div>
  );
}
