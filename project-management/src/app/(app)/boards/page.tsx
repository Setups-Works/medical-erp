"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page";
import { Badge, Button, Dialog, FormError, Input, Label, Progress, Skeleton, Textarea } from "@/components/ui";
import { api, refresh, useBoards } from "@/lib/client";

export default function BoardsPage() {
  const { data } = useBoards();
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Boards"
        subtitle="One board per phase, the product backlog, and any board your team needs."
        actions={
          <Button variant="primary" onClick={() => setOpen(true)}>
            <Plus className="size-3.5" /> New board
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {!data && [0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-36" />)}
        {data?.map((b) => {
          const pct = b.total ? (b.done / b.total) * 100 : 0;
          return (
            <Link key={b.id} href={`/boards/${b.id}`} className="card flex flex-col p-5 transition-shadow hover:shadow-[inset_0_0_0_1px_var(--line-2)]">
              <div className="flex items-center gap-2">
                <h2 className="text-[15.5px] font-semibold tracking-[-0.01em]">{b.name}</h2>
                <Badge tint={b.kind === "phase" ? "violet" : b.kind === "backlog" ? "blue" : "slate"} className="ml-auto capitalize">
                  {b.kind}
                </Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-[13px] text-ink-3">{b.description}</p>
              <div className="mt-auto pt-4">
                <Progress value={pct} />
                <p className="mt-1.5 font-mono text-[12px] tabular-nums text-ink-3">
                  {b.done}/{b.total} done · {Math.round(pct)}%
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      <NewBoard open={open} onOpenChange={setOpen} />
    </div>
  );
}

function NewBoard({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  async function create(e: React.FormEvent) {
    e.preventDefault();
    try {
      const b = await api<{ id: string }>("/api/boards", { method: "POST", json: { name, description } });
      refresh("/api/boards");
      toast.success("Board created");
      onOpenChange(false);
      router.push(`/boards/${b.id}`);
    } catch (err) {
      setError((err as Error).message);
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="New board" description="Columns: Backlog, To do, In progress, In review, QA, Done.">
      <form onSubmit={create} className="space-y-4">
        <label className="block">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sprint 3, Design reviews" autoFocus />
        </label>
        <label className="block">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this board for?" />
        </label>
        <FormError>{error}</FormError>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={name.trim().length < 2}>
            Create board
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
