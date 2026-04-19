"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";

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

  async function onGoogle() {
    setErr(null);
    setBusy(true);
    try {
      await signIn.social({ provider: "google", callbackURL: "/" });
    } catch (err) {
      setErr(err instanceof Error ? err.message : "Google sign-up failed");
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif text-4xl leading-tight tracking-tight">
        Start designing.
      </h1>
      <p className="mt-2 text-sm text-black/60">Create an account to spin up projects.</p>

      <button
        type="button"
        onClick={onGoogle}
        disabled={busy}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white py-2.5 text-sm font-medium text-[#1a1a1a] hover:bg-[#FAF6EF] disabled:opacity-60"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-black/40">
        <span className="h-px flex-1 bg-black/10" />
        or
        <span className="h-px flex-1 bg-black/10" />
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
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

function GoogleIcon() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.1l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.1z"/>
      <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.3C29.5 34.7 26.9 36 24 36c-5.1 0-9.6-3.2-11.2-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.5 5.3C41.9 36.4 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z"/>
    </svg>
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
