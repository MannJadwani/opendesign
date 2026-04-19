export default function Loading() {
  return (
    <div className="min-h-screen bg-[#E8E0D0] text-[#1F1B16]">
      <header className="flex items-center justify-between border-b border-black/5 px-6 py-3">
        <div className="h-5 w-28 rounded bg-black/5" />
        <div className="h-7 w-16 rounded-full bg-black/5" />
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="h-9 w-40 animate-pulse rounded bg-black/5" />
        <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-black/5" />
        <div className="mt-10 space-y-8">
          <section>
            <div className="h-5 w-24 animate-pulse rounded bg-black/5" />
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-black/5" />
              ))}
            </div>
          </section>
          <section>
            <div className="h-5 w-40 animate-pulse rounded bg-black/5" />
            <div className="mt-3 h-10 animate-pulse rounded-lg bg-black/5" />
          </section>
        </div>
      </main>
    </div>
  );
}
