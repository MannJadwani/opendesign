"use client";

import { useState } from "react";

type Option = { label: string; value?: string };

type Question = {
  id: string;
  title: string;
  subtitle?: string;
  multi?: boolean;
  options: Option[];
  allowOther?: boolean;
};

type IntakeInput = {
  intro?: string;
  questions?: Question[];
};

type Props = {
  input: IntakeInput;
  submitted: boolean;
  onSubmit: (text: string) => void;
};

export function IntakeForm({ input, submitted, onSubmit }: Props) {
  const questions = Array.isArray(input.questions) ? input.questions : [];
  const [picks, setPicks] = useState<Record<string, Set<string>>>({});
  const [otherText, setOtherText] = useState<Record<string, string>>({});
  const [freeForm, setFreeForm] = useState("");
  const [done, setDone] = useState(submitted);

  function togglePick(qid: string, val: string, multi: boolean) {
    setPicks((prev) => {
      const next = { ...prev };
      const cur = new Set(next[qid] ?? []);
      if (cur.has(val)) cur.delete(val);
      else {
        if (!multi) cur.clear();
        cur.add(val);
      }
      next[qid] = cur;
      return next;
    });
  }

  function submit() {
    const lines: string[] = [];
    if (input.intro) lines.push(`Here are my answers.`);
    for (const q of questions) {
      const vals = Array.from(picks[q.id] ?? []);
      const other = otherText[q.id]?.trim();
      const parts: string[] = [];
      if (vals.length) parts.push(vals.join(", "));
      if (other) parts.push(`Other: ${other}`);
      if (parts.length === 0) continue;
      lines.push(`- **${q.title}** — ${parts.join(" · ")}`);
    }
    const extra = freeForm.trim();
    if (extra) lines.push(`- **Notes** — ${extra}`);
    if (lines.length === 0) {
      onSubmit("Decide for me on everything. Just make something great.");
    } else {
      onSubmit(lines.join("\n"));
    }
    setDone(true);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#D9623A]/20 bg-white/80 p-4">
      {input.intro && (
        <p className="text-[13px] leading-relaxed text-[#3D3831]">
          {input.intro}
        </p>
      )}
      <div className="space-y-5">
        {questions.map((q) => {
          const multi = !!q.multi;
          const selected = picks[q.id] ?? new Set<string>();
          return (
            <div key={q.id} className="space-y-2">
              <div>
                <p className="text-[13px] font-semibold text-[#1F1B16]">
                  {q.title}
                </p>
                {q.subtitle && (
                  <p className="mt-0.5 text-[11px] text-[#6B655D]">{q.subtitle}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {q.options.map((opt) => {
                  const v = opt.value ?? opt.label;
                  const active = selected.has(v);
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => !done && togglePick(q.id, v, multi)}
                      disabled={done}
                      className={`rounded-full border px-2.5 py-1 text-[12px] transition-colors ${
                        active
                          ? "border-[#D9623A] bg-[#FDEFE8] text-[#C0462A]"
                          : "border-black/10 bg-white text-[#3D3831] hover:border-black/20"
                      } ${done ? "opacity-60" : ""}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
                {q.allowOther !== false && (
                  <input
                    value={otherText[q.id] ?? ""}
                    onChange={(e) =>
                      setOtherText((p) => ({ ...p, [q.id]: e.target.value }))
                    }
                    disabled={done}
                    placeholder="Other…"
                    className="w-28 rounded-full border border-black/10 bg-white px-2.5 py-1 text-[12px] placeholder:text-[#9A9389] focus:border-[#D9623A] focus:outline-none disabled:opacity-60"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#6B655D]">
          Anything else?
        </p>
        <textarea
          value={freeForm}
          onChange={(e) => setFreeForm(e.target.value)}
          disabled={done}
          rows={2}
          placeholder="References, constraints, must-haves…"
          className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-[12px] placeholder:text-[#9A9389] focus:border-[#D9623A] focus:outline-none disabled:opacity-60"
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        {done ? (
          <span className="text-[12px] text-[#6B655D]">Answers sent ✓</span>
        ) : (
          <button
            type="button"
            onClick={submit}
            className="cd-hover-lift rounded-lg bg-[#D9623A] px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-[#C0462A]"
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  );
}
