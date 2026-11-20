"use client";

import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page";
import { Avatar, Badge, Button, Dialog, FormError, Input, Label, Picker, Skeleton } from "@/components/ui";
import { api, refresh, useMe, useUsers } from "@/lib/client";
import type { Tint } from "@/lib/types";

export default function TeamPage() {
  const { data: users } = useUsers();
  const { data: me } = useMe();
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto max-w-[940px]">
      <PageHeader
        title="Team"
        subtitle="Who is on MENO and what they’re carrying."
        actions={
          me?.role === "admin" && (
            <Button variant="primary" onClick={() => setOpen(true)}>
              <UserPlus className="size-3.5" /> Add member
            </Button>
          )
        }
      />
      <div className="card divide-y divide-line">
        {!users && <Skeleton className="m-4 h-40" />}
        {users?.map((u) => (
          <Link key={u.id} href={`/team/${u.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-hover">
            <Avatar user={u} size={38} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[14.5px] font-medium">
                {u.name}
                {u.role === "admin" && <Badge tint="violet">Admin</Badge>}
              </p>
              <p className="text-[13px] text-ink-3">
                {u.title} · {u.email}
              </p>
            </div>
            <div className="text-right font-mono text-[12.5px] tabular-nums">
              <p>{u.open} open</p>
              <p className="text-ink-4">{u.done} done</p>
            </div>
          </Link>
        ))}
      </div>
      <AddMember open={open} onOpenChange={setOpen} />
    </div>
  );
}

const TINTS: Tint[] = ["blue", "green", "amber", "red", "violet", "pink", "slate"];

function AddMember({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [form, setForm] = useState({ name: "", email: "", title: "", role: "member", tint: "blue", password: "" });
  const [error, setError] = useState("");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });
  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api("/api/users", { method: "POST", json: form });
      refresh("/api/users");
      toast.success(`${form.name} can now sign in`);
      onOpenChange(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Add member" description="They’ll be asked to change the temporary password on first sign-in.">
      <form onSubmit={save} className="space-y-4">
        <label className="block">
          <Label>Name</Label>
          <Input value={form.name} onChange={set("name")} autoFocus />
        </label>
        <label className="block">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={set("email")} />
        </label>
        <label className="block">
          <Label>Title</Label>
          <Input value={form.title} onChange={set("title")} placeholder="e.g. Backend Engineer" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Role</Label>
            <Picker value={[form.role]} options={[{ value: "member", label: "Member" }, { value: "admin", label: "Admin" }]} onChange={([v]) => setForm({ ...form, role: v })} trigger={<Button type="button" className="w-full justify-start capitalize">{form.role}</Button>} />
          </div>
          <div>
            <Label>Colour</Label>
            <Picker
              value={[form.tint]}
              options={TINTS.map((t) => ({ value: t, label: t, icon: <span className={`at-${t} size-3 rounded-full bg-(--abf)`} /> }))}
              onChange={([v]) => setForm({ ...form, tint: v })}
              trigger={
                <Button type="button" className="w-full justify-start capitalize">
                  <span className={`at-${form.tint} size-3 rounded-full bg-(--abf)`} /> {form.tint}
                </Button>
              }
            />
          </div>
        </div>
        <label className="block">
          <Label>Temporary password</Label>
          <Input type="password" value={form.password} onChange={set("password")} autoComplete="new-password" />
        </label>
        <FormError>{error}</FormError>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary">Add member</Button>
        </div>
      </form>
    </Dialog>
  );
}
