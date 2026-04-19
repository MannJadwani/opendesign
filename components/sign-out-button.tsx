"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await signOut();
        router.push("/");
        router.refresh();
      }}
      className="rounded-full bg-[#F5F0E8] px-3 py-1.5 text-sm hover:bg-white"
    >
      Sign out
    </button>
  );
}
