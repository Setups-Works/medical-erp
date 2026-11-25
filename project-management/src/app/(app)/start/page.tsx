"use client";

import { ArrowRight, Check, Circle, CircleDot } from "lucide-react";
import Link from "next/link";
import { Inline } from "@/components/inline";
import { PageHeader } from "@/components/page";
import { Avatar, Badge, Progress, Skeleton } from "@/components/ui";
import { AFTER_P1, AGENDA, LAYERS, PERSON_NOTES, TOPICS, WAITING, WEEKS } from "@/lib/build-order";
import { cn } from "@/lib/cn";
import { useMe, useTasks } from "@/lib/client";
import { useLookups } from "@/lib/maps";
import { withSteps } from "@/lib/steps";
import type { TaskT, Tint, UserT } from "@/lib/types";

const STATUS: Record<string, { label: string; tint: Tint }> = {
  backlog: { label: "Not started", tint: "slate" },
  todo: { label: "To do", tint: "slate" },
  in_progress: { label: "In progress", tint: "blue" },
  review: { label: "In review", tint: "violet" },
  qa: { label: "QA", tint: "amber" },
  done: { label: "Done", tint: "green" },
};

const taskHref = (t: TaskT) => `/boards/${t.boardId}?task=${t.id}`;
/** Local calendar date as YYYY-MM-DD (not UTC, so the week flips at local midnight). */
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function StartHere() {
  const { data: p0 } = useTasks("phase=P0&limit=500");
  const { data: p1 } = useTasks("phase=P1&limit=500");
  const { users, userMap } = useLookups();
  const { data: me } = useMe();
  const tasks = p0 && p1 ? [...p0, ...p1] : undefined;

  const layers = LAYERS.map((l) => {
    const items = l.items.map((i) => ({ ...i, task: tasks?.find((t) => t.title.startsWith(i.match)) }));
    const found = items.filter((i) => i.task);
    const done = found.filter((i) => i.task!.column === "done").length;
    return { ...l, items, done, total: found.length };
  });
  // "Build next" = the first layer that still has open work.
  const current = layers.find((l) => l.total && l.done < l.total)?.key;

  const week = WEEKS.find((w) => today() >= w.from && today() <= w.to);
  const topic = TOPICS[new Date().getDay()];

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Start here"
        subtitle="What we build first, what comes next, and how the daily meeting runs. Status is live from the boards."
      />

      {/* Today */}
      <section className="mb-6 grid gap-3 md:grid-cols-2">
        <div className="card p-4">
          <p className="text-[11.5px] font-medium uppercase tracking-wide text-ink-4">This week’s goal</p>
          <p className="mt-1 text-[15px] font-semibold">{week ? week.goal : "Pick the goal for this week in Monday’s meeting"}</p>
          {week && <p className="mt-1 text-[12.5px] text-ink-3">{week.label}</p>}
        </div>
        <div className="card p-4">
          <p className="text-[11.5px] font-medium uppercase tracking-wide text-ink-4">Today’s meeting topic</p>
          <p className="mt-1 text-[15px] font-semibold">{topic ? topic.topic : "No meeting today"}</p>
          {topic && <p className="mt-1 text-[12.5px] text-ink-3">Owner: {topic.owner} · minutes 25–50 of the daily hour</p>}
        </div>
      </section>

      {/* Build order */}
      <section className="mb-6">
        <h2 className="mb-1 text-[15.5px] font-semibold">Build order: the road before the cars</h2>
        <p className="mb-3 text-[13px] text-ink-3">
          Finish one layer before the next. Inside a layer everyone works at the same time. Click any item to open its task.
        </p>
        <ol className="grid gap-3 lg:grid-cols-2">
          {layers.map((l) => {
            const isNow = l.key === current;
            const isDone = l.total > 0 && l.done === l.total;
            return (
              <li key={l.key} className={cn("card p-4", isNow && "shadow-[inset_0_0_0_2px_var(--ink)]")}>
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-semibold">{l.name}</h3>
                  {isNow && <Badge tint="blue">Build now</Badge>}
                  {isDone && <Badge tint="green">Done</Badge>}
                  <span className="ml-auto font-mono text-[12px] tabular-nums text-ink-3">{tasks ? `${l.done}/${l.total}` : ""}</span>
                </div>
                <p className="mt-0.5 text-[12.5px] text-ink-3">{l.why}</p>
                <Progress value={l.total ? (l.done / l.total) * 100 : 0} className="mt-2" />
                {tasks ? (
                  <ul className="mt-2 space-y-0.5">
                    {l.items.map((i) => (
                      <LayerRow key={i.match} label={i.label} task={i.task} users={userMap} />
                    ))}
                  </ul>
                ) : (
                  <Skeleton className="mt-3 h-40" />
                )}
              </li>
            );
          })}
        </ol>
        <div className="card mt-3 overflow-x-auto p-4">
          <h3 className="mb-2 text-[14px] font-semibold">After P1: follow how a pharmacy works</h3>
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <tbody>
              {AFTER_P1.map((r) => (
                <tr key={r.phase} className="border-t border-line first:border-0">
                  <td className="w-12 py-1.5 font-mono text-ink-3">{r.phase}</td>
                  <td className="py-1.5 font-medium">{r.build}</td>
                  <td className="py-1.5 text-ink-3">{r.because}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Everyone's next step */}
      <section className="mb-6">
        <h2 className="mb-1 text-[15.5px] font-semibold">Everyone’s next step</h2>
        <p className="mb-3 text-[13px] text-ink-3">The lowest open Step from each person’s My tasks. Say this number at stand-up.</p>
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {users
            ? [...users]
                .sort((a, b) => Number(b.id === me?.id) - Number(a.id === me?.id))
                .map((u) => <PersonNext key={u.id} user={u} isMe={u.id === me?.id} />)
            : [0, 1, 2].map((i) => <Skeleton key={i} className="h-36" />)}
        </ul>
        <p className="mt-2 text-[12.5px] text-ink-3">
          Two hand-offs set our speed: <b className="text-ink-2">web scaffold + UI kit + page patterns</b> (Meyyarivu) and{" "}
          <b className="text-ink-2">backend skeleton, security, tenancy</b> (Kamesh) + <b className="text-ink-2">OpenAPI → api-client</b> (Nitheesh). Check both every day.
        </p>
      </section>

      {/* Calendar */}
      <section className="card mb-6 overflow-x-auto p-4">
        <h2 className="mb-2 text-[15.5px] font-semibold">The next six weeks</h2>
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead className="text-[12px] text-ink-4">
            <tr>
              <th className="py-1 font-medium">Week</th>
              <th className="py-1 font-medium">Goal by Friday</th>
              <th className="py-1 font-medium">Who does what</th>
            </tr>
          </thead>
          <tbody>
            {WEEKS.map((w) => {
              const now = w === week;
              const past = today() > w.to;
              return (
                <tr key={w.from} className={cn("border-t border-line align-top", now && "bg-hover", past && "text-ink-4")}>
                  <td className="w-[190px] py-2 pr-3 font-medium">
                    {w.label}
                    {now && <Badge tint="blue" className="ml-1.5">This week</Badge>}
                  </td>
                  <td className="py-2 pr-3 font-medium">{w.goal}</td>
                  <td className="py-2 text-ink-3">{w.highlights}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-2 text-[12px] text-ink-4">If a goal slips we move scope, never quality. Agree holidays (25 Dec, 1 Jan) the week before.</p>
      </section>

      {/* Daily meeting */}
      <section className="mb-6 grid gap-3 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="text-[15.5px] font-semibold">The daily 1-hour meeting</h2>
          <p className="mb-2 text-[12.5px] text-ink-3">Same time every day · Nitheesh keeps time · Hub open on the shared screen · ends on time.</p>
          <ol className="space-y-2">
            {AGENDA.map((a) => (
              <li key={a.minutes} className="flex gap-3">
                <span className="w-12 shrink-0 font-mono text-[12px] tabular-nums text-ink-3">{a.minutes}</span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-medium">{a.what}</span>
                  <span className="block text-[12.5px] text-ink-3">{a.how}</span>
                </span>
              </li>
            ))}
          </ol>
          <ul className="mt-3 space-y-1 border-t border-line pt-3 text-[12.5px] text-ink-3">
            <li>More than 5 minutes on one topic? Move it to a separate call with only the people involved.</li>
            <li>“I’m blocked” is never bad news. Hiding it is.</li>
            <li>The meeting doesn’t replace PR reviews: code still goes branch → PR → review.</li>
          </ul>
        </div>
        <div className="card p-4">
          <h2 className="mb-2 text-[15.5px] font-semibold">Topic of the day</h2>
          <ul className="space-y-1.5">
            {TOPICS.map((t, d) =>
              t ? (
                <li key={d} className={cn("flex gap-3 rounded-ctl px-2 py-1.5", d === new Date().getDay() && "bg-hover")}>
                  <span className="w-10 shrink-0 text-[12.5px] font-medium text-ink-3">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]}</span>
                  <span className="min-w-0 flex-1 text-[13px]">{t.topic}</span>
                  <span className="shrink-0 text-[12px] text-ink-4">{t.owner}</span>
                </li>
              ) : null,
            )}
          </ul>
          <h3 className="mt-4 mb-1.5 text-[14px] font-semibold">Waiting for someone? Do this</h3>
          <ul className="space-y-1">
            {WAITING.map((w) => (
              <li key={w.for} className="text-[12.5px]">
                <span className="font-medium text-ink-2">{w.for}:</span> <span className="text-ink-3">{w.do}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function LayerRow({ label, task, users }: { label: string; task?: TaskT; users: Map<string, UserT> }) {
  if (!task) return <li className="px-1 py-1 text-[12.5px] text-ink-4">{label} (task not found: re-run the seed)</li>;
  const s = STATUS[task.column] ?? STATUS.backlog;
  const Icon = task.column === "done" ? Check : task.column === "backlog" || task.column === "todo" ? Circle : CircleDot;
  return (
    <li>
      <Link href={taskHref(task)} className="flex items-center gap-2 rounded px-1 py-1 hover:bg-hover">
        <Icon className={cn("size-3.5 shrink-0", task.column === "done" ? "text-ink" : "text-ink-4")} strokeWidth={2} />
        <span className={cn("min-w-0 flex-1 truncate text-[13px]", task.column === "done" && "text-ink-3 line-through")}>{label}</span>
        <span className="flex shrink-0 -space-x-1">
          {task.assignees.slice(0, 3).map((id) => (
            <Avatar key={id} user={users.get(id)} size={18} ring />
          ))}
        </span>
        <Badge tint={s.tint} className="shrink-0">{s.label}</Badge>
        <span className="w-10 shrink-0 text-right font-mono text-[11px] text-ink-4">#{task.number}</span>
      </Link>
    </li>
  );
}

function PersonNext({ user, isMe }: { user: UserT; isMe: boolean }) {
  const { data } = useTasks(`assignee=${user.id}&limit=500`);
  const { sorted, step, total } = withSteps(data);
  const open = sorted.filter((t) => t.column !== "done").slice(0, 3);
  const note = PERSON_NOTES[user.name.split(" ")[0].toLowerCase()];
  return (
    <li className={cn("card min-w-0 p-3", isMe && "shadow-[inset_0_0_0_2px_var(--ink)]")}>
      <div className="mb-2 flex items-center gap-2">
        <Avatar user={user} size={22} />
        <span className="text-[13.5px] font-medium">{isMe ? `${user.name} (you)` : user.name}</span>
        <span className="truncate text-[11.5px] text-ink-4">{user.title}</span>
      </div>
      {!data ? (
        <Skeleton className="h-16" />
      ) : open.length ? (
        <ol className="space-y-0.5">
          {open.map((t, i) => (
            <li key={t.id}>
              <Link href={taskHref(t)} className="flex items-baseline gap-2 rounded px-1 py-0.5 hover:bg-hover">
                <span className={cn("w-14 shrink-0 font-mono text-[11px]", i === 0 ? "text-ink" : "text-ink-4")}>
                  {i === 0 ? <>Step {step.get(t.id)}</> : <>then {step.get(t.id)}</>}
                </span>
                <span className={cn("min-w-0 flex-1 truncate text-[12.5px]", i === 0 ? "font-medium" : "text-ink-3")}>
                  <Inline text={t.title} />
                </span>
                {i === 0 && <ArrowRight className="size-3.5 shrink-0 text-ink-4" />}
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-1 text-[12.5px] text-ink-3">All {total} tasks done.</p>
      )}
      {note && (
        <dl className="mt-2 space-y-0.5 border-t border-line pt-2 text-[12px]">
          <div className="flex gap-2"><dt className="w-16 shrink-0 text-ink-4">Needs</dt><dd className="text-ink-2">{note.needs}</dd></div>
          <div className="flex gap-2"><dt className="w-16 shrink-0 text-ink-4">Unblocks</dt><dd className="text-ink-2">{note.unblocks}</dd></div>
          <div className="flex gap-2"><dt className="w-16 shrink-0 text-ink-4">If waiting</dt><dd className="text-ink-2">{note.wait}</dd></div>
        </dl>
      )}
    </li>
  );
}
