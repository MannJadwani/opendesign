import Link from "next/link";

type Props = { variant?: "serif" | "sans" };

export function Brand({ variant = "serif" }: Props) {
  const serif = variant === "serif";
  return (
    <Link href="/" className="flex items-center gap-1.5 px-1.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1F1B16] text-[11px] font-bold text-[#F5F0E8]">
        O
      </span>
      <span
        className={`${serif ? "text-[17px]" : "text-[15px]"} leading-none tracking-tight text-[#1F1B16]`}
        style={serif ? { fontFamily: "var(--font-serif)" } : undefined}
      >
        Open<span className="italic text-[#D9623A]">Design</span>
      </span>
    </Link>
  );
}
