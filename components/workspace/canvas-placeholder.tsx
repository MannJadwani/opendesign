export function CanvasPlaceholder({ streaming }: { streaming: boolean }) {
  return (
    <div className="relative flex flex-1 items-center justify-center">
      <div className="cd-enter-fade flex flex-col items-center gap-3">
        <h2
          className="text-[34px] italic tracking-tight text-[#1F1B16]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {streaming ? "Synthesising…" : "Creations will appear here"}
        </h2>
        <p className="text-[13px] text-[#6B655D]">
          {streaming
            ? "Researching references and drafting your concept."
            : "Prompt in the left panel to generate an artifact."}
        </p>
      </div>
    </div>
  );
}
