import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDesignSystem } from "@/lib/actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const system = await getDesignSystem(id);
  return {
    title: system ? `${system.name} · Design system` : "Design system",
    robots: { index: false, follow: false },
  };
}
import { SystemEditor } from "@/components/systems/system-editor";
import { Brand } from "@/components/brand";

export default async function SystemEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const system = await getDesignSystem(id);
  if (!system) notFound();

  return (
    <div className="min-h-screen bg-[#E8E0D0] text-[#1F1B16]">
      <header className="flex items-center justify-between border-b border-black/5 px-6 py-3">
        <div className="flex items-center gap-2">
          <Brand variant="serif" />
          <span className="mx-2 h-5 w-px bg-black/10" />
          <Link
            href="/systems"
            className="text-[12px] text-[#6B655D] hover:text-[#1F1B16]"
          >
            ← Systems
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-10">
        <SystemEditor
          id={system.id}
          initialName={system.name}
          initialTokens={system.tokens}
        />
      </main>
    </div>
  );
}
