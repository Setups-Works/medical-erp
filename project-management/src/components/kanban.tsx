"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { api, refresh } from "@/lib/client";
import type { BoardT, TaskT, UserT } from "@/lib/types";
import { TaskCard } from "./task-card";
import { Button, Input } from "./ui";

type Cols = Record<string, TaskT[]>;

function group(board: BoardT, tasks: TaskT[]): Cols {
  const cols: Cols = Object.fromEntries(board.columns.map((c) => [c.key, [] as TaskT[]]));
  for (const t of [...tasks].sort((a, b) => a.order - b.order)) (cols[t.column] ??= []).push(t);
  return cols;
}

export function Kanban({ board, tasks, users, onOpen }: { board: BoardT; tasks: TaskT[]; users: Map<string, UserT>; onOpen: (id: string) => void }) {
  const [cols, setCols] = useState<Cols>(() => group(board, tasks));
  const [activeId, setActiveId] = useState<string | null>(null);
  // Server (or another teammate) changed something: re-sync unless we're mid-drag.
  useEffect(() => {
    if (!activeId) setCols(group(board, tasks));
  }, [board, tasks, activeId]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const findCol = (id: string) => (id in cols ? id : Object.keys(cols).find((k) => cols[k].some((t) => t.id === id)));
  const active = useMemo(() => tasks.find((t) => t.id === activeId), [tasks, activeId]);

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragOver(e: DragOverEvent) {
    const from = findCol(String(e.active.id));
    const to = e.over ? findCol(String(e.over.id)) : undefined;
    if (!from || !to || from === to) return;
    setCols((c) => {
      const moving = c[from].find((t) => t.id === e.active.id);
      if (!moving) return c;
      const overIndex = c[to].findIndex((t) => t.id === e.over!.id);
      const target = [...c[to]];
      target.splice(overIndex < 0 ? target.length : overIndex, 0, { ...moving, column: to });
      return { ...c, [from]: c[from].filter((t) => t.id !== e.active.id), [to]: target };
    });
  }

  async function onDragEnd(e: DragEndEvent) {
    const id = String(e.active.id);
    setActiveId(null);
    const col = findCol(id);
    if (!col || !e.over) return;
    let list = cols[col];
    const from = list.findIndex((t) => t.id === id);
    const overIdx = list.findIndex((t) => t.id === e.over!.id);
    if (overIdx >= 0 && overIdx !== from) {
      list = [...list];
      const [m] = list.splice(from, 1);
      list.splice(overIdx, 0, m);
      setCols((c) => ({ ...c, [col]: list }));
    }
    const i = list.findIndex((t) => t.id === id);
    const prev = list[i - 1]?.order;
    const next = list[i + 1]?.order;
    const order = prev !== undefined && next !== undefined ? (prev + next) / 2 : prev !== undefined ? prev + 1000 : next !== undefined ? next - 1000 : 1000;
    const original = tasks.find((t) => t.id === id);
    if (original && original.column === col && original.order === order) return;
    try {
      await api(`/api/tasks/${id}`, { method: "PATCH", json: { column: col, order } });
    } catch (err) {
      toast.error((err as Error).message);
    }
    refresh(`/api/boards/${board.id}`);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
      <div className="scroll-thin -mx-[clamp(16px,3vw,40px)] flex gap-3 overflow-x-auto px-[clamp(16px,3vw,40px)] pb-4">
        {board.columns.map((c) => (
          <Column key={c.key} boardId={board.id} colKey={c.key} name={c.name} wipLimit={c.wipLimit} tasks={cols[c.key] ?? []} users={users} onOpen={onOpen} />
        ))}
      </div>
      <DragOverlay>{active ? <TaskCard task={active} users={users} dragging /> : null}</DragOverlay>
    </DndContext>
  );
}

function Column({ boardId, colKey, name, wipLimit, tasks, users, onOpen }: { boardId: string; colKey: string; name: string; wipLimit: number; tasks: TaskT[]; users: Map<string, UserT>; onOpen: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: colKey });
  const over = wipLimit > 0 && tasks.length > wipLimit;
  return (
    <section className={cn("flex w-[288px] shrink-0 flex-col rounded-card bg-side", isOver && "shadow-[inset_0_0_0_1px_var(--line-2)]")} aria-label={name}>
      <header className="flex items-center gap-2 px-3 pt-3 pb-2">
        <h3 className="text-[13px] font-semibold">{name}</h3>
        <span className={cn("font-mono text-[12px] tabular-nums text-ink-4", over && "text-critical")} title={wipLimit ? `WIP limit ${wipLimit}` : undefined}>
          {tasks.length}
          {wipLimit ? `/${wipLimit}` : ""}
        </span>
      </header>
      <div ref={setNodeRef} className="scroll-thin flex max-h-[calc(100dvh-260px)] min-h-24 flex-col gap-2 overflow-y-auto px-2 pb-2">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((t) => (
            <SortableCard key={t.id} task={t} users={users} onOpen={() => onOpen(t.id)} />
          ))}
        </SortableContext>
      </div>
      <AddTask boardId={boardId} column={colKey} />
    </section>
  );
}

function SortableCard({ task, users, onOpen }: { task: TaskT; users: Map<string, UserT>; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn(isDragging && "opacity-30")} {...attributes} {...listeners}>
      <TaskCard task={task} users={users} onOpen={onOpen} />
    </div>
  );
}

function AddTask({ boardId, column }: { boardId: string; column: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await api("/api/tasks", { method: "POST", json: { boardId, column, title: title.trim() } });
      setTitle("");
      refresh(`/api/boards/${boardId}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="m-2 mt-0 flex h-8 items-center gap-1.5 rounded-ctl px-2 text-[13px] text-ink-3 hover:bg-hover hover:text-ink">
        <Plus className="size-3.5" /> Add task
      </button>
    );
  return (
    <form onSubmit={add} className="space-y-2 p-2 pt-0">
      <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" onKeyDown={(e) => e.key === "Escape" && setOpen(false)} />
      <div className="flex gap-2">
        <Button variant="primary" disabled={busy || !title.trim()}>
          Add
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
