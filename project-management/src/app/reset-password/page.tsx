"use client";

import Link from "next/link";
import { use, useState } from "react";
import { Button, FormError, Input, Label } from "@/components/ui";
import { api } from "@/lib/client";

export default function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = use(searchParams);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return setError("The two passwords don’t match.");
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/password/reset", { method: "POST", json: { token, password } });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-side px-4">
      <form onSubmit={submit} className="card w-full max-w-[380px] p-7">
        <p className="font-brand text-[30px] leading-none tracking-[-0.02em]">MENO</p>
        <h1 className="mt-4 font-display text-[22px] font-semibold tracking-[-0.022em]">Choose a new password</h1>
        {done ? (
          <p className="mt-3 text-[13.5px] text-ink-3">Your password is changed. Sign in with the new one.</p>
        ) : !token ? (
          <p className="mt-3 text-[13.5px] text-ink-3">This link is missing its token. Open the link from the email again, or ask for a new one.</p>
        ) : (
          <div className="mt-6 space-y-4">
            <label className="block">
              <Label>New password</Label>
              <Input type="password" autoComplete="new-password" required minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
            </label>
            <label className="block">
              <Label>Type it again</Label>
              <Input type="password" autoComplete="new-password" required minLength={10} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </label>
            <FormError>{error}</FormError>
            <Button variant="primary" size="md" className="w-full" disabled={busy}>
              {busy ? "Saving…" : "Save new password"}
            </Button>
          </div>
        )}
        <p className="mt-5 text-[12.5px] text-ink-4">
          <Link href={done ? "/login" : "/forgot-password"} className="underline underline-offset-2 hover:text-ink">
            {done ? "Go to sign in" : "Ask for a new link"}
          </Link>
        </p>
      </form>
    </main>
  );
}
