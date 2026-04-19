import Link from "next/link";
import { HomeHeader } from "./home-header";

export function GuestLanding() {
  return (
    <div className="min-h-screen flex flex-col bg-[#E8E0D0] text-[#1a1a1a]">
      <HomeHeader />
      <main className="flex-1 grid place-items-center px-6">
        <div className="max-w-xl text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#D9623A]">
            Open-source · AI design canvas
          </p>
          <h1 className="font-serif text-6xl leading-[1.02] tracking-tight mt-4">
            Prompt it. Shape it. Ship it.
          </h1>
          <p className="mt-5 text-[15px] text-black/60">
            Describe a screen. OpenDesign researches references, synthesises a concept, and renders an editable artifact you can refine by chat, comment, or drag.
          </p>
          <div className="mt-8 flex justify-center gap-2">
            <Link href="/signup" className="rounded-full bg-[#1a1a1a] px-5 py-2.5 text-sm text-[#F5F0E8]">
              Start free
            </Link>
            <Link href="/login" className="rounded-full bg-[#F5F0E8] px-5 py-2.5 text-sm">
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
