import {
  deleteProject,
  getSessionUser,
  listDesignSystems,
  listProjectsWithPreview,
} from "@/lib/actions";
import { GuestLanding } from "@/components/home/guest-landing";
import { HomeHeader } from "@/components/home/home-header";
import { HomeComposer } from "@/components/home/home-composer";
import { ProjectsPanel } from "@/components/home/projects-panel";

export default async function Home() {
  const user = await getSessionUser();
  if (!user) return <GuestLanding />;

  const [projects, systems] = await Promise.all([
    listProjectsWithPreview(),
    listDesignSystems(),
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
      <main className="flex flex-1 overflow-hidden">
        <HomeComposer systems={systemOpts} />
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
