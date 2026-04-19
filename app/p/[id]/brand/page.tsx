import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject } from "@/lib/actions";
import { BrandEditor } from "@/components/workspace/brand-editor";
import type { BrandTokens } from "@/lib/ai/scrapers/brand-ingest";

export default async function BrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const tokens = (project.brandTokens as BrandTokens | null) ?? null;

  return (
    <div className="min-h-screen bg-[#E8E0D0] text-[#1F1B16]">
      <header className="flex items-center justify-between border-b border-black/5 px-6 py-3">
        <div className="flex items-center gap-3 text-[13px]">
          <Link
            href={`/p/${id}`}
            className="rounded-md border border-black/10 bg-white px-2 py-1 text-[11px] font-medium hover:bg-[#FAF6EF]"
          >
            ← Back to workspace
          </Link>
          <span className="text-[#6B655D]">·</span>
          <span className="text-[#6B655D]">{project.title}</span>
          <span className="text-[#6B655D]">·</span>
          <span className="font-medium">Brand system</span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="font-serif text-3xl leading-tight">Project brand</h1>
        <p className="mt-2 text-[13px] text-[#6B655D]">
          Point at a site or paste an image URL. OpenDesign extracts the
          palette, type vibe, and mood, then pins it to this project so every
          generation pulls from the same brand.
        </p>
        <BrandEditor
          projectId={id}
          initialTokens={tokens}
          initialApply={project.brandApply}
        />
      </main>
    </div>
  );
}
