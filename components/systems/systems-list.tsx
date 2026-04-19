"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createDesignSystemAction,
  deleteDesignSystemAction,
  type DesignSystemRow,
} from "@/lib/actions";

type Props = {
  initial: DesignSystemRow[];
};

export function SystemsList({ initial }: Props) {
  const router = useRouter();
  const [systems, setSystems] = useState(initial);
  const [creating, startCreate] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [name, setName] = useState("");

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    startCreate(async () => {
      try {
        const res = await createDesignSystemAction({
          name: trimmed,
          tokens: {
            palette: [],
            typography: "",
            layout: "",
            mood: "",
          },
        });
        setName("");
        router.push(`/systems/${res.id}`);
      } catch {
        // ignore
      }
    });
  }

  function onDelete(id: string) {
    startDelete(async () => {
      setSystems((prev) => prev.filter((s) => s.id !== id));
      try {
        await deleteDesignSystemAction(id);
      } catch {
        // revert
        router.refresh();
      }
    });
  }

  return (
    <div className="mt-8 space-y-6">
      <form
        onSubmit={onCreate}
        className="flex gap-2 rounded-lg border border-black/10 bg-white p-3"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New system name — e.g. Acme brand, Editorial B&W"
          className="flex-1 rounded-md border border-black/10 bg-white px-3 py-2 text-[13px] outline-none focus:border-[#D9623A]"
        />
        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="rounded-md bg-[#D9623A] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#C0462A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? "Creating…" : "Create"}
        </button>
      </form>

      {systems.length === 0 ? (
        <p className="rounded-lg border border-dashed border-black/15 bg-white/60 px-4 py-6 text-center text-[13px] text-[#9A9389]">
          No systems yet. Create one above — or ingest a brand from the project
          workspace and click &ldquo;Save as design system&rdquo;.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {systems.map((s) => (
            <li
              key={s.id}
              className="group rounded-lg border border-black/10 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/systems/${s.id}`}
                  className="min-w-0 flex-1 hover:underline"
                >
                  <p className="truncate font-medium">{s.name}</p>
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(s.id)}
                  disabled={deleting}
                  className="opacity-0 transition-opacity group-hover:opacity-100 text-[11px] text-[#9A9389] hover:text-[#D9623A] disabled:opacity-30"
                  title="Delete system"
                >
                  Delete
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {s.tokens.palette.length === 0 ? (
                  <span className="text-[11px] text-[#9A9389]">no palette</span>
                ) : (
                  s.tokens.palette.slice(0, 8).map((c, i) => (
                    <span
                      key={`${c}-${i}`}
                      title={c}
                      className="block h-5 w-5 rounded border border-black/10"
                      style={{ background: c }}
                    />
                  ))
                )}
              </div>
              {s.tokens.mood && (
                <p className="mt-2 truncate text-[11px] text-[#6B655D]">
                  {s.tokens.mood}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
