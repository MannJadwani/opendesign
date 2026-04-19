export function ProjectThumb({ html }: { html: string | null }) {
  if (!html) {
    return <div className="aspect-[4/3] rounded-xl bg-[#EDE4D3]" />;
  }
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-white border border-black/5">
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: "1440px", height: "1080px", transform: "scale(0.25)" }}
      >
        <iframe
          title="preview"
          srcDoc={html}
          sandbox="allow-scripts"
          loading="lazy"
          scrolling="no"
          className="h-full w-full bg-white pointer-events-none"
          tabIndex={-1}
        />
      </div>
      <div className="absolute inset-0" />
    </div>
  );
}
