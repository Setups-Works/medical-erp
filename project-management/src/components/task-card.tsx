"use client";

import { format, isPast, isToday } from "date-fns";
import { CalendarDays, CheckSquare, MessageSquare } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TaskT, UserT } from "@/lib/types";
import { Inline } from "./inline";
import { AvatarStack, Badge, PRIORITY, labelTint } from "./ui";

export function TaskCard({ task, users, onOpen, dragging }: { task: TaskT; users: Map<string, UserT>; onOpen?: () => void; dragging?: boolean }) {
  const done = task.checklist.filter((c) => c.done).length;
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = due && task.column !== "done" && isPast(due) && !isToday(due);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen?.();
      }}
      data-testid="task-card"
      className={cn(
        "group cursor-pointer rounded-tile bg-raised p-3 shadow-[inset_0_0_0_1px_var(--line)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--line-2)]",
        dragging && "shadow-pop rotate-[0.6deg]",
        task.column === "done" && "opacity-75",
      )}
    >
      <div className="mb-1.5 flex items-center gap-1.5 text-[11.5px] text-ink-4">
        <span className="font-mono tabular-nums">#{task.number}</span>
        {task.phase && <span className="font-mono">{task.phase}</span>}
        {task.priority === "high" && (
          <Badge tint={PRIORITY.high.tint} className="ml-auto">
            High
          </Badge>
        )}
      </div>
      <p className={cn("text-[13.5px] leading-snug text-ink", task.column === "done" && "line-through decoration-ink-4")}><Inline text={task.title} /></p>
      {task.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.labels.slice(0, 3).map((l) => (
            <Badge key={l} tint={labelTint(l)}>
              {l}
            </Badge>
          ))}
        </div>
      )}
      <div className="mt-2.5 flex items-center gap-3 text-[11.5px] text-ink-3">
        {due && (
          <span className={cn("flex items-center gap-1", overdue && "text-critical")}>
            <CalendarDays className="size-3" />
            {format(due, "dd MMM")}
          </span>
        )}
        {task.checklist.length > 0 && (
          <span className={cn("flex items-center gap-1 tabular-nums", done === task.checklist.length && "text-success")}>
            <CheckSquare className="size-3" />
            {done}/{task.checklist.length}
          </span>
        )}
        {task.commentCount > 0 && (
          <span className="flex items-center gap-1 tabular-nums">
            <MessageSquare className="size-3" />
            {task.commentCount}
          </span>
        )}
        <span className="ml-auto">
          <AvatarStack users={task.assignees.map((a) => users.get(a))} size={20} max={3} />
        </span>
      </div>
    </div>
  );
}
