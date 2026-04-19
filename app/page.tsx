import type { Metadata } from "next";
import {
  deleteProject,
  getApiKeyStatus,
  getSessionUser,
  listDesignSystems,
  listProjectsWithPreview,
} from "@/lib/actions";

export const metadata: Metadata = {
  title: "OpenDesign — Prompt, iterate, ship UI with AI",
  description:
    "Turn plain-language briefs into editable high-fidelity UI, slide decks, and wireframes. Bring any OpenRouter model, pin a design system, refine by chat or drag.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "OpenDesign — Prompt, iterate, ship UI with AI",
    description:
      "Open-source AI design canvas. Prompt, iterate, and export high-fidelity UI, slide decks, and wireframes.",
    url: "/",
  },
};
import { GuestLanding } from "@/components/home/guest-landing";
import { HomeHeader } from "@/components/home/home-header";
import { HomeComposer } from "@/components/home/home-composer";
import { ProjectsPanel } from "@/components/home/projects-panel";
import { ApiKeyGateBanner } from "@/components/api-key-gate-banner";

export default async function Home() {
  const user = await getSessionUser();
  if (!user) return <GuestLanding />;

  const [projects, systems, keyStatus] = await Promise.all([
    listProjectsWithPreview(),
    listDesignSystems(),
    getApiKeyStatus(),
  ]);

  const systemCards = systems.map((s) => ({
    id: s.id,
    name: s.name,
    palette: Array.isArray(s.tokens?.palette) ? (s.tokens.palette as string[]) : [],
    mood: (s.tokens?.mood as string | undefined) ?? null,
  }));

  const systemOpts = systems.map((s) => ({ id: s.id, name: s.name }));

  return (
    <div className="flex min-h-screen flex-col bg-[#E8E0D0] text-[#1a1a1a]">
      <HomeHeader userEmail={user.email} />
      {!keyStatus.hasAnyKey && <ApiKeyGateBanner variant="home" />}
      <main className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <HomeComposer systems={systemOpts} needsApiKey={!keyStatus.hasAnyKey} />
        <ProjectsPanel
          projects={projects.map((p) => ({
            id: p.id,
            title: p.title,
            outputType: p.outputType,
            preview: p.preview,
          }))}
          systems={systemCards}
          onDelete={async (id: string) => {
            "use server";
            await deleteProject(id);
          }}
        />
      </main>
    </div>
  );
}
