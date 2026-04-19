import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#E8E0D0] text-[#1a1a1a]">
      <header className="px-10 py-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-[#1a1a1a] text-[11px] font-semibold text-[#E8E0D0]">
            O
          </span>
          <span className="text-[15px]">
            Open<span className="font-serif italic text-[#D9623A]">Design</span>
          </span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        {children}
      </main>
    </div>
  );
}
