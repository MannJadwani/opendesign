export function EmptyChat() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-10">
      <div className="w-full max-w-sm space-y-4">
        <h1
          className="text-[34px] leading-none tracking-tight text-[#1F1B16]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Start with context
        </h1>
        <p className="text-[14px] leading-relaxed text-[#6B655D]">
          Describe the screen you want. OpenDesign researches references and synthesises a unique concept.
        </p>
      </div>
    </div>
  );
}
