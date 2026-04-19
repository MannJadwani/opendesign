import Link from "next/link";
import { DeleteProjectButton } from "@/components/delete-project-button";
import { ProjectThumb } from "./project-thumb";

type Project = {
  id: string;
  title: string;
  outputType: string;
  preview: string | null;
};

type Props = {
  project: Project;
  onDelete: (id: string) => Promise<void>;
};

export function ProjectCard({ project, onDelete }: Props) {
  return (
    <div className="group relative rounded-2xl bg-[#F5F0E8] p-4 hover:bg-white transition-colors border border-black/5">
      <Link
        href={`/p/${project.id}`}
        className="absolute inset-0 rounded-2xl z-0"
        aria-label={project.title}
      />
      <div className="relative z-10 pointer-events-none">
        <ProjectThumb html={project.preview} />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-medium">{project.title}</span>
          <span className="text-[10px] uppercase tracking-widest text-black/45">
            {project.outputType}
          </span>
        </div>
      </div>
      <div className="absolute top-2 right-2 z-20 opacity-0 transition-opacity group-hover:opacity-100">
        <DeleteProjectButton
          projectId={project.id}
          projectTitle={project.title}
          action={onDelete}
        />
      </div>
    </div>
  );
}
