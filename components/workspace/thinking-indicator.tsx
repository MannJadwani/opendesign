export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 text-[13px] text-[#6B655D]">
      <span className="flex gap-1">
        <Dot delay="0ms" />
        <Dot delay="160ms" />
        <Dot delay="320ms" />
      </span>
      <span className="italic" style={{ fontFamily: "var(--font-serif)" }}>
        thinking
      </span>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-[#D9623A]"
      style={{ animation: "od-pulse 1.1s ease-in-out infinite", animationDelay: delay }}
    />
  );
}
