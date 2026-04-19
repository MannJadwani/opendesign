import Link from "next/link";
import { listDesignSystems } from "@/lib/actions";
import { SystemsList } from "@/components/systems/systems-list";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";

export default async function SystemsPage() {
  const systems = await listDesignSystems();
  return (
    <div className="min-h-screen bg-[#E8E0D0] text-[#1F1B16]">
      <header className="flex items-center justify-between border-b border-black/5 px-6 py-3">
        <div className="flex items-center gap-2">
          <Brand variant="serif" />
          <span className="mx-2 h-5 w-px bg-black/10" />
          <Link
            href="/"
            className="text-[12px] text-[#6B655D] hover:text-[#1F1B16]"
          >
            ← Projects
          </Link>
        </div>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-serif text-3xl leading-tight">Design systems</h1>
            <p className="mt-2 text-[13px] text-[#6B655D]">
              Reusable brand tokens. Link one to a project and every generation
              will pull from the same palette, type, and mood.
            </p>
          </div>
        </div>
        <SystemsList initial={systems} />
      </main>
    </div>
  );
}
