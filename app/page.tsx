import { createProject, deleteProject, getSessionUser, listProjectsWithPreview } from "@/lib/actions";
import { GuestLanding } from "@/components/home/guest-landing";
import { HomeHeader } from "@/components/home/home-header";
import { ProjectGrid } from "@/components/home/project-grid";

export default async function Home() {
  const user = await getSessionUser();

  if (!user) return <GuestLanding />;

  const projects = await listProjectsWithPreview();

  return (
    <div className="min-h-screen flex flex-col bg-[#E8E0D0] text-[#1a1a1a]">
      <HomeHeader userEmail={user.email} />
      <main className="flex-1 px-10 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#D9623A]">Workspace</p>
              <h1 className="font-serif text-5xl leading-[1.05] tracking-tight mt-2">
                Your projects
              </h1>
            </div>
            <form action={async () => { "use server"; await createProject(); }}>
              <button className="rounded-full bg-[#1a1a1a] px-4 py-2 text-sm text-[#F5F0E8]">
                + New project
              </button>
            </form>
          </div>
          <ProjectGrid
            projects={projects}
            onDelete={async (id: string) => { "use server"; await deleteProject(id); }}
          />
        </div>
      </main>
    </div>
  );
}
