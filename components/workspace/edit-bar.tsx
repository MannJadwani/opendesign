"use client";

type Props = {
  dirty: boolean;
  saving: boolean;
  error: string | null;
  onSave: () => void;
  onDiscard: () => void;
  onExit: () => void;
};

export function EditBar({ dirty, saving, error, onSave, onDiscard, onExit }: Props) {
  return (
    <div className="cd-enter-slide-down flex items-center justify-between gap-2 border-b border-black/5 bg-[#FFF4EC] px-3 py-1.5">
      <div className="flex items-center gap-2 text-[11px] text-[#7A2A13]">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D9623A]" />
        <span className="font-medium">Edit mode</span>
        <span className="text-[#B3725A]">
          {dirty
            ? "Unsaved changes · click any outlined block to edit"
            : "Click any outlined block to edit"}
        </span>
        {error && <span className="ml-2 text-[#C0462A]">· {error}</span>}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onDiscard}
          disabled={saving || !dirty}
          className="rounded-md border border-black/10 bg-white px-2 py-1 text-[11px] font-medium text-[#3D3831] hover:bg-[#FAF6EF] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !dirty}
          className="rounded-md bg-[#D9623A] px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#C0462A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save as new version"}
        </button>
        <button
          type="button"
          onClick={onExit}
          className="rounded-md px-2 py-1 text-[11px] font-medium text-[#6B655D] hover:bg-black/5"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
