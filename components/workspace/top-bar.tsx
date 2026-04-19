"use client";

import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { Brand } from "@/components/brand";
import { IconHome } from "@/components/icons";
import { SharePopover } from "./share-popover";

type Props = {
  projectId: string;
  projectTitle: string;
  userEmail?: string | null;
  initialShareSlug: string | null;
  createShareAction: (projectId: string) => Promise<{ slug: string }>;
  revokeShareAction: (projectId: string) => Promise<void>;
};

export function TopBar({
  projectId,
  projectTitle,
  userEmail,
  initialShareSlug,
  createShareAction,
  revokeShareAction,
}: Props) {
  return (
    <header className="flex items-center justify-between bg-[#E8E0D0] px-3 py-2">
      <div className="flex items-center gap-2">
        <Brand variant="serif" />
        <span className="mx-1 h-5 w-px bg-black/10" />
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B655D] hover:bg-black/5 hover:text-[#1F1B16]"
          title="Home"
        >
          <IconHome />
        </Link>
        <span className="ml-2 truncate text-[13px] text-[#6B655D]">{projectTitle}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <SharePopover
          projectId={projectId}
          initialSlug={initialShareSlug}
          createAction={createShareAction}
          revokeAction={revokeShareAction}
        />
        <button className="rounded-lg bg-[#1F1B16] px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-black">
          Export
        </button>
        {userEmail ? <SignOutButton /> : null}
      </div>
    </header>
  );
}
