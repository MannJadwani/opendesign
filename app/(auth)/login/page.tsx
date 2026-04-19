"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginForm nextPath="/" />}>
      <LoginWithParams />
    </Suspense>
  );
}

function LoginWithParams() {
  const next = useSearchParams().get("next") ?? "/";
  return <LoginForm nextPath={next} />;
}

function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      console.log("[login] submit", { email });
      const res = await signIn.email({ email, password });
      console.log("[login] result", res);
      if (res?.error) {
        setErr(res.error.message ?? "Sign-in failed");
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      console.error("[login] threw", err);
      setErr(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif text-4xl leading-tight tracking-tight">
        Welcome back.
      </h1>
      <p className="mt-2 text-sm text-black/60">Sign in to your workspace.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-3">
        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
        {err && <p className="text-xs text-[#C0462A]">{err}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-[#1a1a1a] py-2.5 text-sm font-medium text-[#F5F0E8] disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-black/60">
        No account?{" "}
        <Link href="/signup" className="text-[#D9623A] underline-offset-4 hover:underline">
          Create one
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
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-black/50">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="w-full rounded-xl border border-black/10 bg-[#F5F0E8] px-3 py-2 text-sm outline-none focus:border-[#D9623A]/60"
      />
    </label>
  );
}
