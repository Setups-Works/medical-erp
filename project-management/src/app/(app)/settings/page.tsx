"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page";
import { Avatar, Button, FormError, Input, Label } from "@/components/ui";
import { api, refresh, useMe } from "@/lib/client";

export default function SettingsPage() {
  return (
    <Suspense>
      <Settings />
    </Suspense>
  );
}

function Settings() {
  const { data: me } = useMe();
  const first = useSearchParams().get("first");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState("");

  async function change(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("/api/auth/password", { method: "POST", json: { current, next } });
      setCurrent("");
      setNext("");
      refresh("/api/auth/me");
      toast.success("Password changed");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="mx-auto max-w-[640px]">
      <PageHeader title="Settings" subtitle="Your account and password." />
      {(first || me?.mustChangePassword) && <p className="mb-4 rounded-ctl at-amber tint px-3 py-2 text-[13.5px]">You’re using a temporary password. Choose your own below.</p>}
      <section className="card mb-4 flex items-center gap-4 p-5">
        <Avatar user={me} size={44} />
        <div>
          <p className="text-[15px] font-medium">{me?.name}</p>
          <p className="text-[13px] text-ink-3">
            {me?.title} · {me?.email}
          </p>
        </div>
      </section>
      <form onSubmit={change} className="card space-y-4 p-5">
        <h2 className="text-[15.5px] font-semibold">Change password</h2>
        <label className="block">
          <Label>Current password</Label>
          <Input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </label>
        <label className="block">
          <Label>New password</Label>
          <Input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="At least 10 characters" />
        </label>
        <FormError>{error}</FormError>
        <Button variant="primary" disabled={!current || next.length < 10}>
          Update password
        </Button>
      </form>
    </div>
  );
}
