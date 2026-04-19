"use client";

import type { RefObject } from "react";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { Brand } from "@/components/brand";
import { IconHome } from "@/components/icons";
import { SharePopover } from "./share-popover";
import { ExportMenu } from "./export-menu";
import type { InitialArtifact } from "./workspace";

type Props = {
  projectId: string;
  projectTitle: string;
  userEmail?: string | null;
  initialShareSlug: string | null;
  createShareAction: (projectId: string) => Promise<{ slug: string }>;
  revokeShareAction: (projectId: string) => Promise<void>;
  artifact: InitialArtifact;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  brandApply: boolean;
};

export function TopBar({
  projectId,
  projectTitle,
  userEmail,
  initialShareSlug,
  createShareAction,
  revokeShareAction,
  artifact,
  iframeRef,
  brandApply,
}: Props) {
  return (
    <header className="flex items-center justify-between gap-2 bg-[#E8E0D0] px-2 py-2 sm:px-3">
      <div className="flex min-w-0 items-center gap-2">
        <div className="hidden sm:block">
          <Brand variant="serif" />
        </div>
        <span className="mx-1 hidden h-5 w-px bg-black/10 sm:block" />
        <Link
          href="/"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6B655D] hover:bg-black/5 hover:text-[#1F1B16]"
          title="Home"
        >
          <IconHome />
        </Link>
        <span className="ml-1 min-w-0 truncate text-[13px] text-[#6B655D] sm:ml-2">{projectTitle}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Link
          href={`/p/${projectId}/brand`}
          title={brandApply ? "Brand applied — tap to edit" : "Pin a brand to this project"}
          className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
            brandApply
              ? "border-[#D9623A] bg-[#D9623A]/10 text-[#D9623A] hover:bg-[#D9623A]/15"
              : "border-black/10 bg-white text-[#3D3831] hover:bg-[#FAF6EF]"
          }`}
        >
          <span
            aria-hidden
            className={`h-2 w-2 rounded-full ${
              brandApply ? "bg-[#D9623A]" : "bg-[#C7BFB2]"
            }`}
          />
          Brand
        </Link>
        <SharePopover
          projectId={projectId}
          initialSlug={initialShareSlug}
          createAction={createShareAction}
          revokeAction={revokeShareAction}
        />
        <ExportMenu artifact={artifact} iframeRef={iframeRef} />
        {userEmail ? <SignOutButton /> : null}
      </div>
    </header>
  );
}
