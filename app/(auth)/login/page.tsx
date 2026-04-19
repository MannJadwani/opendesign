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

  async function onGoogle() {
    setErr(null);
    setBusy(true);
    try {
      await signIn.social({ provider: "google", callbackURL: nextPath });
    } catch (err) {
      console.error("[login] google threw", err);
      setErr(err instanceof Error ? err.message : "Google sign-in failed");
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif text-4xl leading-tight tracking-tight">
        Welcome back.
      </h1>
      <p className="mt-2 text-sm text-black/60">Sign in to your workspace.</p>

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
