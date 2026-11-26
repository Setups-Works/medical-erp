"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, FormError, Input, Label } from "@/components/ui";
import { api } from "@/lib/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await api<{ mustChangePassword: boolean }>("/api/auth/login", { method: "POST", json: { email, password } });
      window.location.href = r.mustChangePassword ? "/settings?first=1" : "/";
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-side px-4">
      <form onSubmit={submit} className="card w-full max-w-[380px] p-7">
        <p className="font-brand text-[30px] leading-none tracking-[-0.02em]">MENO</p>
        <h1 className="mt-4 font-display text-[22px] font-semibold tracking-[-0.022em]">Sign in to the hub</h1>
        <p className="mt-1 text-[13.5px] text-ink-3">Boards, tasks and the plan for the whole team.</p>
        <div className="mt-6 space-y-4">
          <label className="block">
            <Label>Email</Label>
            <Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoFocus />
          </label>
          <label className="block">
            <span className="flex items-baseline justify-between">
              <Label>Password</Label>
              <Link href="/forgot-password" className="text-[12px] text-ink-4 underline-offset-2 hover:text-ink hover:underline">
                Forgot password?
              </Link>
            </span>
            <Input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <FormError>{error}</FormError>
          <Button variant="primary" size="md" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </div>
        <p className="mt-5 text-[12.5px] text-ink-4">No account? Ask Nitheesh to add you.</p>
      </form>
    </main>
  );
}
