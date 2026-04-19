"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createProject } from "@/lib/actions";

type Tab = "prototype" | "deck" | "other";
type Fidelity = "wireframe" | "high";

type SystemOpt = { id: string; name: string };

type Props = {
  systems: SystemOpt[];
  needsApiKey?: boolean;
};

export function HomeComposer({ systems, needsApiKey = false }: Props) {
  const [tab, setTab] = useState<Tab>("prototype");
  const [name, setName] = useState("");
  const [fidelity, setFidelity] = useState<Fidelity>("high");
  const [systemId, setSystemId] = useState<string>("");
  const [pending, startTransition] = useTransition();

  const outputType = tab === "deck" ? "slides" : "website";
  const disabled = pending || needsApiKey;

  function submit() {
    if (needsApiKey) return;
    startTransition(async () => {
      await createProject({
        name,
        outputType,
        fidelity,
        designSystemId: systemId || null,
      });
    });
  }

  return (
    <aside className="flex w-full shrink-0 flex-col gap-5 border-b border-black/5 bg-[#F5F0E8] px-4 py-5 sm:px-6 lg:w-[340px] lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-4 text-[13px]">
        <TabButton active={tab === "prototype"} onClick={() => setTab("prototype")}>
          Prototype
        </TabButton>
        <TabButton active={tab === "deck"} onClick={() => setTab("deck")}>
          Slide deck
        </TabButton>
        <TabButton active={tab === "other"} onClick={() => setTab("other")}>
          Other
        </TabButton>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/60 p-4">
        <p className="font-serif text-lg leading-tight">
          {tab === "prototype" && "New prototype"}
          {tab === "deck" && "New slide deck"}
          {tab === "other" && "Something else"}
        </p>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          className="mt-3 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[13px] focus:border-[#D9623A] focus:outline-none"
        />

        {(tab === "prototype" || tab === "deck") && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <FidelityTile
              active={fidelity === "wireframe"}
              onClick={() => setFidelity("wireframe")}
              label="Wireframe"
              variant="wire"
            />
            <FidelityTile
              active={fidelity === "high"}
              onClick={() => setFidelity("high")}
              label="High fidelity"
              variant="hifi"
            />
          </div>
        )}

        {systems.length > 0 && (
          <div className="mt-4">
            <label className="text-[11px] uppercase tracking-[0.18em] text-black/50">
              Design system
            </label>
            <select
              value={systemId}
              onChange={(e) => setSystemId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[13px]"
            >
              <option value="">None</option>
              {systems.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {tab === "other" && (
          <p className="mt-3 text-[12px] text-black/55">
            Blank project. Describe anything in chat — email, wireframe, diagram.
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={disabled}
          title={needsApiKey ? "Add an OpenRouter key in Settings to enable" : undefined}
          className="cd-hover-lift mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#D9623A] px-3 py-2 text-[13px] font-medium text-white hover:bg-[#C0462A] disabled:opacity-50"
        >
          <span>+</span>
          <span>{pending ? "Creating…" : needsApiKey ? "Add API key first" : "Create"}</span>
        </button>
      </div>

      <p className="px-1 text-[11px] leading-relaxed text-black/50">
        Projects are private to your account. Share links are opt-in per project.
      </p>

      <div className="mt-auto rounded-2xl border border-black/5 bg-white/60 p-4">
        <p className="text-[13px] text-[#3D3831]">
          {systems.length === 0
            ? "Create a design system so every new prototype starts on-brand."
            : "Manage palette, type, and mood tokens used across projects."}
        </p>
        <Link
          href="/systems"
          className="mt-3 flex items-center justify-center rounded-lg bg-[#D9623A] px-3 py-2 text-[13px] font-medium text-white hover:bg-[#C0462A]"
        >
          {systems.length === 0 ? "Set up design system" : "Manage design systems"}
        </Link>
      </div>
    </aside>
  );
}

function TabButton({
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
      className={`shrink-0 border-b-2 pb-1 text-[13px] transition-colors ${
        active
          ? "border-[#1a1a1a] font-medium text-[#1a1a1a]"
          : "border-transparent text-black/55 hover:text-[#1a1a1a]"
      }`}
    >
      {children}
    </button>
  );
}

function FidelityTile({
  active,
  onClick,
  label,
  variant,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  variant: "wire" | "hifi";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-stretch gap-2 rounded-xl border p-2 text-left transition-all ${
        active
          ? "border-[#D9623A] bg-[#FDEFE8]/60"
          : "border-black/10 bg-white hover:border-black/20"
      }`}
    >
      <div className="aspect-[4/3] rounded-md border border-black/5 bg-[#F5F0E8] p-1.5">
        {variant === "wire" ? <WireArt /> : <HiFiArt />}
      </div>
      <span className="text-[12px] font-medium">{label}</span>
    </button>
  );
}

function WireArt() {
  return (
    <div className="flex h-full flex-col gap-1">
      <div className="h-1.5 w-1/2 rounded-sm bg-black/25" />
      <div className="h-1 w-full rounded-sm bg-black/15" />
      <div className="h-1 w-4/5 rounded-sm bg-black/15" />
      <div className="mt-auto grid grid-cols-2 gap-1">
        <div className="h-3 rounded-sm bg-black/20" />
        <div className="h-3 rounded-sm bg-black/10" />
      </div>
    </div>
  );
}

function HiFiArt() {
  return (
    <div className="flex h-full flex-col gap-1">
      <div className="flex items-center gap-1">
        <div className="h-1.5 w-1.5 rounded-full bg-[#D9623A]" />
        <div className="h-1 w-6 rounded-sm bg-[#3D3831]/70" />
      </div>
      <div className="h-1.5 w-3/4 rounded-sm bg-[#3D3831]" />
      <div className="mt-auto flex items-center gap-1">
        <div className="h-3 flex-1 rounded-sm bg-[#D9623A]" />
        <div className="h-3 w-3 rounded-sm bg-[#EFE9DC]" />
      </div>
    </div>
  );
}
