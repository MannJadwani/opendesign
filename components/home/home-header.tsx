import Link from "next/link";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";

type Props = { userEmail?: string | null };

export function HomeHeader({ userEmail }: Props) {
  return (
    <header className="flex items-center justify-between px-10 py-6">
      <Brand variant="sans" />
      {userEmail ? (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-black/60">{userEmail}</span>
          <SignOutButton />
        </div>
      ) : (
        <nav className="flex items-center gap-3 text-sm">
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
