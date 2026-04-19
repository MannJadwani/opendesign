import Link from "next/link";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";

type Props = { userEmail?: string | null };

export function HomeHeader({ userEmail }: Props) {
  return (
    <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-10 sm:py-6">
      <Brand variant="sans" />
      {userEmail ? (
        <div className="flex items-center gap-2 text-sm sm:gap-3">
          <Link
            href="/settings"
            className="rounded-full px-3 py-1.5 text-black/70 hover:bg-black/5 hover:text-black"
          >
            Settings
          </Link>
          <span className="hidden truncate text-black/60 sm:inline">{userEmail}</span>
          <SignOutButton />
        </div>
      ) : (
        <nav className="flex items-center gap-2 text-sm sm:gap-3">
          <Link href="/login" className="px-3 py-1.5 rounded-full hover:bg-black/5">
            Sign in
          </Link>
          <Link href="/signup" className="px-3 py-1.5 rounded-full bg-[#1a1a1a] text-[#F5F0E8]">
            Get started
          </Link>
        </nav>
      )}
    </header>
  );
}
