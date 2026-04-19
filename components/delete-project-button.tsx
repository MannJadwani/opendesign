"use client";

import { useState, useTransition } from "react";
import { IconTrash } from "@/components/icons";

type Props = {
  projectId: string;
  projectTitle: string;
  action: (id: string) => Promise<void>;
};

export function DeleteProjectButton({ projectId, projectTitle, action }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function stop(e: React.MouseEvent | React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          setConfirming(true);
        }}
        onPointerDown={stop}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/90 text-[#6B655D] shadow-sm hover:bg-white hover:text-[#C0462A]"
        aria-label={`Delete ${projectTitle}`}
        title="Delete project"
      >
        <IconTrash />
      </button>
    );
  }

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-black/10 bg-white/95 px-1.5 py-1 shadow-sm"
      onPointerDown={stop}
      onClick={stop}
    >
      <span className="px-1.5 text-[11px] font-medium text-[#3D3831]">Delete?</span>
      <button
        type="button"
        disabled={isPending}
        onClick={(e) => {
          stop(e);
          startTransition(async () => {
            await action(projectId);
            setConfirming(false);
          });
        }}
        className="rounded-full bg-[#C0462A] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#A03920] disabled:opacity-60"
      >
        {isPending ? "…" : "Yes"}
      </button>
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          setConfirming(false);
        }}
        className="rounded-full px-2 py-1 text-[11px] text-[#6B655D] hover:text-[#1F1B16]"
      >
        Cancel
      </button>
    </div>
  );
}
