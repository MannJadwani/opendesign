import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { loadSharedArtifact } from "@/lib/share";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadSharedArtifact(slug);
  if (!data) {
    return { title: "Shared artifact", robots: { index: false, follow: false } };
  }
  const title = `${data.title} · v${data.version}`;
  const description = `Shared design from OpenDesign. Read-only preview.`;
  return {
    title,
    description,
    alternates: { canonical: `/s/${slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/s/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SharedArtifactPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadSharedArtifact(slug);
  if (!data) notFound();

  return (
    <div className="flex h-screen flex-col bg-[#E8E0D0] text-[#1F1B16]">
      <header className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2 text-[13px]">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1F1B16] text-[11px] font-bold text-[#F5F0E8]">
              O
            </span>
            <span
              className="text-[15px] leading-none tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Open<span className="italic text-[#D9623A]">Design</span>
            </span>
          </Link>
          <span className="mx-2 h-4 w-px bg-black/10" />
          <span className="font-medium">{data.title}</span>
          <span className="text-[#9A9389]">· v{data.version}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#6B655D]">
          <span>read-only</span>
          <Link
            href="/signup"
            className="rounded-full bg-[#1F1B16] px-3 py-1 text-[11px] font-medium text-white hover:bg-black"
          >
            Make your own
          </Link>
        </div>
      </header>
      <main className="flex-1 px-3 pb-3">
        <div className="h-full overflow-hidden rounded-2xl border border-black/5 bg-white">
          {data.html ? (
            <iframe
              title={data.title}
              srcDoc={data.html}
              sandbox="allow-scripts allow-same-origin"
              className="h-full w-full bg-white"
            />
          ) : (
            <div className="grid h-full place-items-center text-[13px] text-[#6B655D]">
              <p>No artifact yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
