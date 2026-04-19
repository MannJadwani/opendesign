"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUp } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const res = await signUp.email({ name, email, password });
    setBusy(false);
    if (res.error) {
      setErr(res.error.message ?? "Sign-up failed");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif text-4xl leading-tight tracking-tight">
        Start designing.
      </h1>
      <p className="mt-2 text-sm text-black/60">Create an account to spin up projects.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-3">
        <Field label="Name" type="text" value={name} onChange={setName} autoComplete="name" />
        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" minLength={8} />
        {err && <p className="text-xs text-[#C0462A]">{err}</p>}
        <button
          disabled={busy}
          className="w-full rounded-full bg-[#1a1a1a] py-2.5 text-sm font-medium text-[#F5F0E8] disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-black/60">
        Already have an account?{" "}
        <Link href="/login" className="text-[#D9623A] underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  minLength,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-black/50">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        minLength={minLength}
        required
        className="w-full rounded-xl border border-black/10 bg-[#F5F0E8] px-3 py-2 text-sm outline-none focus:border-[#D9623A]/60"
      />
    </label>
  );
}
