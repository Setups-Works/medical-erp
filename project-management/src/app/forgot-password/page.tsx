"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, FormError, Input, Label } from "@/components/ui";
import { api } from "@/lib/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/password/forgot", { method: "POST", json: { email } });
      setSent(true);
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
        <h1 className="mt-4 font-display text-[22px] font-semibold tracking-[-0.022em]">Forgot your password?</h1>
        {sent ? (
          <p className="mt-3 text-[13.5px] text-ink-3">
            If <span className="text-ink">{email}</span> has a hub account, a reset link is on its way. It works for 30 minutes.
          </p>
        ) : (
          <>
            <p className="mt-1 text-[13.5px] text-ink-3">Enter your hub email and we’ll send you a link to choose a new one.</p>
            <div className="mt-6 space-y-4">
              <label className="block">
                <Label>Email</Label>
                <Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoFocus />
              </label>
              <FormError>{error}</FormError>
              <Button variant="primary" size="md" className="w-full" disabled={busy}>
                {busy ? "Sending…" : "Send reset link"}
              </Button>
            </div>
          </>
        )}
        <p className="mt-5 text-[12.5px] text-ink-4">
          <Link href="/login" className="underline underline-offset-2 hover:text-ink">Back to sign in</Link>
        </p>
      </form>
    </main>
  );
}
