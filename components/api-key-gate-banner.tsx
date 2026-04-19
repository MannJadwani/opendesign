import Link from "next/link";

type Props = {
  variant?: "home" | "workspace";
};

export function ApiKeyGateBanner({ variant = "home" }: Props) {
  const compact = variant === "workspace";
  return (
    <div
      className={`flex flex-col gap-2 border-b border-[#D9623A]/25 bg-[#FDEFE8] px-4 py-3 text-[13px] text-[#3D3831] sm:flex-row sm:items-center sm:justify-between sm:px-6 ${
        compact ? "" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        <span
          aria-hidden
          className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D9623A] text-[11px] font-semibold text-white"
        >
          !
        </span>
        <p className="leading-snug">
          <span className="font-medium text-[#C0462A]">OpenRouter API key required.</span>{" "}
          Generation is disabled until you add one in Settings.
        </p>
      </div>
      <Link
        href="/settings"
        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#D9623A] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#C0462A]"
      >
        Open Settings →
      </Link>
    </div>
  );
}
