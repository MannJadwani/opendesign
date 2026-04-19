export default function Loading() {
  return (
    <div className="flex h-screen flex-col bg-[#E8E0D0] text-[#1F1B16]">
      <header className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="h-6 w-24 animate-pulse rounded bg-black/5" />
          <div className="h-6 w-40 animate-pulse rounded bg-black/5" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-7 w-16 animate-pulse rounded-md bg-black/5" />
          <div className="h-7 w-16 animate-pulse rounded-md bg-black/5" />
          <div className="h-7 w-16 animate-pulse rounded-md bg-black/5" />
        </div>
      </header>
      <main className="grid flex-1 gap-3 overflow-hidden px-3 pb-3 md:grid-cols-[420px_1fr]">
        <div className="hidden animate-pulse rounded-2xl bg-[#F5F0E8] md:block" />
        <div className="animate-pulse rounded-2xl bg-white" />
      </main>
    </div>
  );
}
