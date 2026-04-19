"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProjectCard } from "./project-card";

type Project = {
  id: string;
  title: string;
  outputType: string;
  preview: string | null;
};

type SystemCard = {
  id: string;
  name: string;
  palette: string[];
  mood: string | null;
};

type Tab = "recent" | "yours" | "examples" | "systems";

type Props = {
  projects: Project[];
  systems: SystemCard[];
  onDelete: (id: string) => Promise<void>;
};

export function ProjectsPanel({ projects, systems, onDelete }: Props) {
  const [tab, setTab] = useState<Tab>("recent");
  const [q, setQ] = useState("");

  const filteredProjects = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return projects;
    return projects.filter((p) => p.title.toLowerCase().includes(ql));
  }, [projects, q]);

  const filteredSystems = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return systems;
    return systems.filter((s) => s.name.toLowerCase().includes(ql));
  }, [systems, q]);

  return (
    <section className="flex flex-1 flex-col px-8 py-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <PanelTab active={tab === "recent"} onClick={() => setTab("recent")}>Recent</PanelTab>
          <PanelTab active={tab === "yours"} onClick={() => setTab("yours")}>Your designs</PanelTab>
          <PanelTab active={tab === "examples"} onClick={() => setTab("examples")}>Examples</PanelTab>
          <PanelTab active={tab === "systems"} onClick={() => setTab("systems")}>Design systems</PanelTab>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="w-[220px] rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-[13px] focus:border-[#D9623A] focus:outline-none"
        />
      </div>

      <div className="mt-6">
        {tab === "recent" || tab === "yours" ? (
          <ProjectsGrid projects={filteredProjects} onDelete={onDelete} />
        ) : tab === "examples" ? (
          <EmptyState title="Examples coming soon" hint="Curated prompts and starter projects will show up here." />
        ) : (
          <SystemsGrid systems={filteredSystems} />
        )}
      </div>
    </section>
  );
}

function PanelTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[13px] transition-colors ${
        active
          ? "bg-white font-medium text-[#1a1a1a] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          : "text-black/55 hover:text-[#1a1a1a]"
      }`}
    >
      {children}
    </button>
  );
}

function ProjectsGrid({
  projects,
  onDelete,
}: {
  projects: Project[];
  onDelete: (id: string) => Promise<void>;
}) {
  if (projects.length === 0) {
    return <EmptyState title="Nothing here yet." hint="Start a new project from the left." />;
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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

function SystemsGrid({ systems }: { systems: SystemCard[] }) {
  if (systems.length === 0) {
    return (
      <EmptyState
        title="No design systems yet"
        hint={
          <>
            <Link href="/systems" className="underline">Create one</Link> to lock palette, type, and mood across projects.
          </>
        }
      />
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {systems.map((s) => (
        <Link
          key={s.id}
          href={`/systems/${s.id}`}
          className="group rounded-2xl border border-black/5 bg-[#F5F0E8] p-4 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
        >
          <div className="flex aspect-[4/3] flex-col gap-2 rounded-xl bg-white p-3">
            <div className="flex gap-1.5">
              {s.palette.slice(0, 6).map((c, i) => (
                <div
                  key={`${c}-${i}`}
                  className="h-8 flex-1 rounded-md border border-black/5"
                  style={{ background: c }}
                />
              ))}
            </div>
            {s.mood && (
              <p className="mt-auto text-[11px] italic text-black/55">{s.mood}</p>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-medium">{s.name}</span>
            <span className="text-[10px] uppercase tracking-widest text-black/45">System</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 bg-[#F5F0E8] p-10 text-center">
      <p className="font-serif text-2xl">{title}</p>
      <p className="mt-1 text-sm text-black/55">{hint}</p>
    </div>
  );
}
