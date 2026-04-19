import { ProjectCard } from "./project-card";

type Project = {
  id: string;
  title: string;
  outputType: string;
  preview: string | null;
};

type Props = {
  projects: Project[];
  onDelete: (id: string) => Promise<void>;
};

export function ProjectGrid({ projects, onDelete }: Props) {
  if (projects.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-black/15 bg-[#F5F0E8] p-10 text-center">
        <p className="font-serif text-2xl">Nothing here yet.</p>
        <p className="mt-1 text-sm text-black/55">
          Start a new project to kick off generation.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((p, i) => (
        <div
          key={p.id}
          className="cd-enter-fade"
          style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
        >
          <ProjectCard project={p} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
}
