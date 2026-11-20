"use client";

import { MessageSquare, Search, X } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Comments } from "@/components/comments";
import { Kanban } from "@/components/kanban";
import { useLive } from "@/components/live";
import { PageHeader } from "@/components/page";
import { TaskDialog } from "@/components/task-dialog";
import { Avatar, AvatarStack, Badge, Button, Dialog, Input, PRIORITY, Picker, Progress, Skeleton, labelTint } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useBoard, useMe, useUsers } from "@/lib/client";
import type { UserT } from "@/lib/types";

export default function BoardPage() {
  return (
    <Suspense>
      <Board />
    </Suspense>
  );
}

function Board() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const search = useSearchParams();
  const openTask = search.get("task");
  const { data, error } = useBoard(id);
  const { data: users } = useUsers();
  const { data: me } = useMe();
  const { online } = useLive();
  const [q, setQ] = useState("");
  const [assignees, setAssignees] = useState<string[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [talk, setTalk] = useState(false);

  const userMap = useMemo(() => new Map((users ?? []).map((u) => [u.id, u] as [string, UserT])), [users]);
  const allLabels = useMemo(() => [...new Set((data?.tasks ?? []).flatMap((t) => t.labels))].sort(), [data]);
  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return (data?.tasks ?? []).filter(
      (t) =>
        (!text || t.title.toLowerCase().includes(text) || String(t.number) === text.replace("#", "") || t.featureId.toLowerCase().includes(text)) &&
        (!assignees.length || t.assignees.some((a) => assignees.includes(a)) || (assignees.includes("none") && !t.assignees.length)) &&
        (!labels.length || t.labels.some((l) => labels.includes(l))) &&
        (!priorities.length || priorities.includes(t.priority)),
    );
  }, [data, q, assignees, labels, priorities]);

  if (error) return <p className="text-ink-3">{error.message}</p>;
  if (!data)
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-72" />
        <div className="flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96 w-[288px]" />
          ))}
        </div>
      </div>
    );

  const { board, tasks } = data;
  const done = tasks.filter((t) => t.column === "done").length;
  const pct = tasks.length ? (done / tasks.length) * 100 : 0;
  const filtering = q || assignees.length || labels.length || priorities.length;
  const setTask = (taskId: string | null) => router.replace(taskId ? `/boards/${id}?task=${taskId}` : `/boards/${id}`, { scroll: false });

  return (
    <div>
      <PageHeader
        title={board.name}
        subtitle={board.description}
        actions={
          <>
            <AvatarStack users={(users ?? []).filter((u) => online.includes(u.id))} size={26} />
            <Button onClick={() => setTalk(true)}>
              <MessageSquare className="size-3.5" /> Discussion
            </Button>
          </>
        }
      />
      <div className="mb-4 flex items-center gap-3">
        <Progress value={pct} className="max-w-56" />
        <span className="font-mono text-[12.5px] tabular-nums text-ink-3">
          {done}/{tasks.length} done
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-64">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-ink-4" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, #number, feature" className="h-8 pl-8 text-[13px]" />
        </div>
        <Picker
          multi
          label="Assignee"
          value={assignees}
          onChange={setAssignees}
          options={[
            ...(me ? [{ value: me.id, label: "Me", icon: <Avatar user={me} size={18} /> }] : []),
            ...(users ?? []).filter((u) => u.id !== me?.id).map((u) => ({ value: u.id, label: u.name, icon: <Avatar user={u} size={18} /> })),
            { value: "none", label: "Unassigned" },
          ]}
          trigger={<FilterPill active={assignees.length > 0}>Assignee{assignees.length ? ` · ${assignees.length}` : ""}</FilterPill>}
        />
        <Picker
          multi
          label="Label"
          value={labels}
          onChange={setLabels}
          options={allLabels.map((l) => ({ value: l, label: <Badge tint={labelTint(l)}>{l}</Badge> }))}
          trigger={<FilterPill active={labels.length > 0}>Label{labels.length ? ` · ${labels.length}` : ""}</FilterPill>}
        />
        <Picker
          multi
          label="Priority"
          value={priorities}
          onChange={setPriorities}
          options={(["high", "medium", "low"] as const).map((p) => ({ value: p, label: PRIORITY[p].label }))}
          trigger={<FilterPill active={priorities.length > 0}>Priority{priorities.length ? ` · ${priorities.length}` : ""}</FilterPill>}
        />
        {filtering ? (
          <Button
            variant="ghost"
            onClick={() => {
              setQ("");
              setAssignees([]);
              setLabels([]);
              setPriorities([]);
            }}
          >
            <X className="size-3.5" /> Clear
          </Button>
        ) : null}
        <span className="ml-auto text-[12.5px] text-ink-4">Drag cards between columns · changes appear for everyone</span>
      </div>

      <Kanban board={board} tasks={filtered} users={userMap} onOpen={setTask} />
      <TaskDialog taskId={openTask} board={board} users={userMap} onClose={() => setTask(null)} />
      <Dialog open={talk} onOpenChange={setTalk} title="Board discussion" description={`Talk about ${board.name} with the team. Use @name to mention.`}>
        <Comments url={`/api/boards/${board.id}/comments`} users={userMap} placeholder="Share an update, ask a question…" />
      </Dialog>
    </div>
  );
}

function FilterPill({ active, children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button {...p} className={cn("h-7 rounded-pill px-3 text-[12.5px] font-medium", active ? "bg-ink text-paper" : "text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-hover")}>
      {children}
    </button>
  );
}
