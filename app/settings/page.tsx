import type { Metadata } from "next";
import Link from "next/link";
import { getUserSettings } from "@/lib/actions";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Choose the OpenRouter model OpenDesign calls, add custom model tags, and store your own API key encrypted at rest.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/settings" },
};
import { MODEL_OPTIONS, DEFAULT_MODEL } from "@/lib/ai/models";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const settings = await getUserSettings();
  return (
    <div className="min-h-screen bg-[#E8E0D0] text-[#1F1B16]">
      <header className="flex items-center justify-between border-b border-black/5 px-6 py-3">
        <div className="flex items-center gap-2">
          <Brand variant="serif" />
          <span className="mx-2 h-5 w-px bg-black/10" />
          <Link
            href="/"
            className="text-[12px] text-[#6B655D] hover:text-[#1F1B16]"
          >
            ← Projects
          </Link>
        </div>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-serif text-3xl leading-tight">Settings</h1>
        <p className="mt-2 text-[13px] text-[#6B655D]">
          Pick the model OpenDesign calls and (optionally) your own OpenRouter
          key. Settings apply to every project you create.
        </p>
        <SettingsForm
          initial={settings}
          presets={MODEL_OPTIONS}
          defaultModelId={DEFAULT_MODEL}
        />
      </main>
    </div>
  );
}
