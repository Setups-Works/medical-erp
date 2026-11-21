"use client";

import { format, formatDistanceToNowStrict } from "date-fns";
import { Archive, ChevronDown, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { api, refresh, useActivity, useTask } from "@/lib/client";
import type { BoardT, ChecklistItem, TaskT, UserT } from "@/lib/types";
import { Comments } from "./comments";
import { Markdown } from "./markdown";
import { TaskLinkPanel } from "./task-links";
import { useTaskLinks } from "@/lib/product";
import { DatePicker } from "./date-picker";
import { Avatar, Badge, Button, Dialog, Input, Label, PRIORITY, Picker, Progress, Skeleton, Textarea, labelTint } from "./ui";

const PHASE_KEYS = ["P0", "P1", "P2", "P3", "P4", "P5", "P6", "P7"];

export function TaskDialog({ taskId, board, users, onClose }: { taskId: string | null; board: BoardT; users: Map<string, UserT>; onClose: () => void }) {
  const { data: task } = useTask(taskId);
  return (
    <Dialog
      open={!!taskId}
      onOpenChange={(o) => !o && onClose()}
      wide
      title={task ? <span className="font-mono text-[14px] font-medium text-ink-3">#{task.number}</span> : "Task"}
      description={task ? `${board.name} · created ${formatDistanceToNowStrict(new Date(task.createdAt))} ago` : undefined}
    >
      {!task ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24" />
        </div>
      ) : (
        <TaskBody key={task.id} task={task} board={board} users={users} onClose={onClose} />
      )}
    </Dialog>
  );
}

function TaskBody({ task, board, users, onClose }: { task: TaskT; board: BoardT; users: Map<string, UserT>; onClose: () => void }) {
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description);
  const [tab, setTab] = useState<"comments" | "activity">("comments");
  const [editing, setEditing] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newItem, setNewItem] = useState("");
  useEffect(() => setTitle(task.title), [task.title]);
  useEffect(() => setDesc(task.description), [task.description]);

  async function save(patch: Partial<TaskT> & { archived?: boolean }) {
    try {
      await api(`/api/tasks/${task.id}`, { method: "PATCH", json: patch });
      refresh(`/api/tasks/${task.id}`, `/api/boards/${board.id}`, "/api/activity");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const checklist = task.checklist.map((c) => ({ text: c.text, done: c.done }));
  const doneCount = checklist.filter((c) => c.done).length;
  const userList = [...users.values()];
  const col = board.columns.find((c) => c.key === task.column);
  const links = useTaskLinks(task);

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_240px]">
      <div className="min-w-0 space-y-5">
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title.trim() && title !== task.title && save({ title: title.trim() })}
          rows={1}
          aria-label="Title"
          className="w-full resize-none bg-transparent font-display text-[22px] font-semibold leading-tight tracking-[-0.022em] outline-none field-sizing-content"
        />
        <TaskLinkPanel links={links} />
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label className="mb-0">Description</Label>
            {!editing && (
              <button className="text-[12.5px] text-ink-3 hover:text-ink" onClick={() => setEditing(true)}>
                Edit
              </button>
            )}
          </div>
          {editing || !task.description ? (
            <Textarea
              autoFocus={editing}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onBlur={() => {
                if (desc !== task.description) save({ description: desc });
                setEditing(false);
              }}
              placeholder="Add details, acceptance criteria, links… (### heading, - bullet, **bold**, `code`)"
              className="min-h-40 font-mono text-[13px]"
            />
          ) : (
            <div className="rounded-ctl bg-side px-4 py-2.5" onDoubleClick={() => setEditing(true)}>
              <Markdown text={task.description} />
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label className="mb-0">
              Checklist {checklist.length > 0 && <span className="font-mono">({doneCount}/{checklist.length})</span>}
            </Label>
          </div>
          {checklist.length > 0 && <Progress value={(doneCount / checklist.length) * 100} className="mb-2" />}
          <ul className="space-y-1">
            {checklist.map((c, i) => (
              <li key={i} className="group flex items-center gap-2 rounded-ctl px-1 py-1 hover:bg-hover">
                <input
                  type="checkbox"
                  checked={c.done}
                  onChange={() => save({ checklist: checklist.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) as ChecklistItem[] })}
                  className="size-4 accent-[var(--ink)]"
                  aria-label={c.text}
                />
                <span className={cn("flex-1 text-[13.5px]", c.done && "text-ink-4 line-through")}>{c.text}</span>
                <button aria-label="Remove item" className="opacity-0 group-hover:opacity-100" onClick={() => save({ checklist: checklist.filter((_, j) => j !== i) as ChecklistItem[] })}>
                  <X className="size-3.5 text-ink-3" />
                </button>
              </li>
            ))}
          </ul>
          <form
            className="mt-1 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newItem.trim()) return;
              save({ checklist: [...checklist, { text: newItem.trim(), done: false }] as ChecklistItem[] });
              setNewItem("");
            }}
          >
            <Input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add an item" className="h-8" />
            <Button disabled={!newItem.trim()}>
              <Plus className="size-3.5" />
            </Button>
          </form>
        </div>

        <div>
          <div className="mb-3 flex gap-4 border-b border-line" role="tablist">
            {(["comments", "activity"] as const).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("-mb-px border-b-2 pb-2 text-[13px] font-medium capitalize", tab === t ? "border-ink text-ink" : "border-transparent text-ink-3 hover:text-ink")}>
                {t}
                {t === "comments" && task.commentCount > 0 && <span className="ml-1 font-mono text-ink-4">{task.commentCount}</span>}
              </button>
            ))}
          </div>
          {tab === "comments" ? <Comments url={`/api/tasks/${task.id}/comments`} users={users} /> : <TaskActivity taskId={task.id} users={users} />}
        </div>
      </div>

      <aside className="space-y-4 md:border-l md:border-line md:pl-5">
        <Field label="Status">
          <Picker
            label="Move to"
            value={[task.column]}
            options={board.columns.map((c) => ({ value: c.key, label: c.name }))}
            onChange={([v]) => save({ column: v, order: Date.now() })}
            trigger={<PickerButton>{col?.name ?? task.column}</PickerButton>}
          />
        </Field>
        <Field label="Assignees">
          <Picker
            multi
            label="Assign to"
            value={task.assignees}
            options={userList.map((u) => ({ value: u.id, label: u.name, icon: <Avatar user={u} size={20} /> }))}
            onChange={(v) => save({ assignees: v })}
            trigger={
              <PickerButton>
                {task.assignees.length ? (
                  <span className="flex flex-wrap items-center gap-1.5">
                    {task.assignees.map((a) => (
                      <span key={a} className="flex items-center gap-1">
                        <Avatar user={users.get(a)} size={18} />
                        {users.get(a)?.name}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="text-ink-4">Unassigned</span>
                )}
              </PickerButton>
            }
          />
        </Field>
        <Field label="Priority">
          <Picker
            value={[task.priority]}
            options={(["high", "medium", "low"] as const).map((p) => ({ value: p, label: PRIORITY[p].label }))}
            onChange={([v]) => save({ priority: v as TaskT["priority"] })}
            trigger={
              <PickerButton>
                <Badge tint={PRIORITY[task.priority].tint}>{PRIORITY[task.priority].label}</Badge>
              </PickerButton>
            }
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phase">
            <Picker
              value={[task.phase]}
              options={PHASE_KEYS.map((p) => ({ value: p, label: p }))}
              onChange={([v]) => save({ phase: v })}
              trigger={<PickerButton>{task.phase || <span className="text-ink-4">None</span>}</PickerButton>}
            />
          </Field>
          <Field label="Size">
            <Picker
              value={[task.size]}
              options={(["S", "M", "L"] as const).map((s) => ({ value: s, label: s === "S" ? "S · ≤ 1 day" : s === "M" ? "M · ≤ 3 days" : "L · ≤ 5 days" }))}
              onChange={([v]) => save({ size: v as TaskT["size"] })}
              trigger={<PickerButton>{task.size || <span className="text-ink-4">None</span>}</PickerButton>}
            />
          </Field>
        </div>
        <Field label="Due date">
          <DatePicker value={task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : null} onChange={(v) => save({ dueDate: v })} />
        </Field>
        <Field label="Labels">
          <div className="flex flex-wrap gap-1">
            {task.labels.map((l) => (
              <Badge key={l} tint={labelTint(l)}>
                {l}
                <button aria-label={`Remove ${l}`} onClick={() => save({ labels: task.labels.filter((x) => x !== l) })}>
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
          <form
            className="mt-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              const l = newLabel.trim().toLowerCase();
              if (l && !task.labels.includes(l)) save({ labels: [...task.labels, l] });
              setNewLabel("");
            }}
          >
            <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Add label + Enter" className="h-8 text-[13px]" />
          </form>
        </Field>
        <div className="border-t border-line pt-3">
          <ArchiveButton
            onConfirm={async () => {
              await save({ archived: true });
              toast.success(`Archived #${task.number}`);
              onClose();
            }}
          />
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function PickerButton({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...p} className="flex min-h-8 w-full items-center justify-between gap-2 rounded-ctl px-2 py-1 text-left text-[13.5px] hover:bg-hover">
      <span className="min-w-0 flex-1">{children}</span>
      <ChevronDown className="size-3.5 shrink-0 text-ink-4" />
    </button>
  );
}

function TaskActivity({ taskId, users }: { taskId: string; users: Map<string, UserT> }) {
  const { data } = useActivity(`task=${taskId}`);
  if (!data?.length) return <p className="py-4 text-[13px] text-ink-3">No activity yet.</p>;
  return (
    <ol className="space-y-2.5">
      {data.map((a) => (
        <li key={a.id} className="flex gap-2 text-[13px]">
          <Avatar user={users.get(a.actor)} size={20} />
          <span className="text-ink-2">
            <span className="font-medium text-ink">{users.get(a.actor)?.name}</span> {a.action}
            <span className="ml-1.5 text-ink-4">{formatDistanceToNowStrict(new Date(a.createdAt))} ago</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Two-step destructive action: first click asks, second click archives (no native confirm dialogs). */
function ArchiveButton({ onConfirm }: { onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <Button variant={armed ? "danger" : "ghost"} className={cn("w-full justify-start", !armed && "text-critical hover:text-critical")} onClick={() => (armed ? onConfirm() : setArmed(true))}>
      {armed ? <Trash2 className="size-3.5" /> : <Archive className="size-3.5" />}
      {armed ? "Click again to archive" : "Archive task"}
    </Button>
  );
}
