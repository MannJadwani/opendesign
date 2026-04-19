"use client";

import { useEffect, useRef, useState, useTransition } from "react";

type Props = {
  projectId: string;
  initialSlug: string | null;
  createAction: (projectId: string) => Promise<{ slug: string }>;
  revokeAction: (projectId: string) => Promise<void>;
};

export function SharePopover({
  projectId,
  initialSlug,
  createAction,
  revokeAction,
}: Props) {
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState<string | null>(initialSlug);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!popRef.current) return;
      if (!popRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const url =
    slug && typeof window !== "undefined"
      ? `${window.location.origin}/s/${slug}`
      : slug
      ? `/s/${slug}`
      : null;

  function createLink() {
    startTransition(async () => {
      const res = await createAction(projectId);
      setSlug(res.slug);
    });
  }

  function revoke() {
    startTransition(async () => {
      await revokeAction(projectId);
      setSlug(null);
      setCopied(false);
    });
  }

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative" ref={popRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-black/10 bg-white px-3.5 py-1.5 text-[13px] font-medium hover:bg-[#FAF6EF]"
      >
        Share
      </button>
      {open && (
        <div className="cd-enter-pop absolute right-0 top-full z-30 mt-2 w-[320px] origin-top-right rounded-xl border border-black/10 bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          <p className="text-[12px] font-medium text-[#1F1B16]">Share link</p>
          <p className="mt-0.5 text-[11px] text-[#6B655D]">
            Anyone with the link can view the latest artifact. Read-only.
          </p>

          {slug ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <input
                  readOnly
                  value={url ?? ""}
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1 rounded-md border border-black/10 bg-[#F5F0E8] px-2 py-1.5 text-[11px] text-[#3D3831] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copy}
                  className="rounded-md bg-[#1F1B16] px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-black"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <a
                  href={url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#D9623A] hover:underline"
                >
                  Open link
                </a>
                <button
                  type="button"
                  onClick={revoke}
                  disabled={pending}
                  className="text-[11px] text-[#C0462A] hover:text-[#7A2A13] disabled:opacity-50"
                >
                  {pending ? "…" : "Revoke"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={createLink}
              disabled={pending}
              className="mt-3 w-full rounded-md bg-[#D9623A] px-3 py-2 text-[12px] font-medium text-white hover:bg-[#C0462A] disabled:opacity-50"
            >
              {pending ? "Creating…" : "Create share link"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
