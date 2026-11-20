"use client";

import Link from "next/link";
import { ActivityFeed, TaskRows } from "@/components/feeds";
import { PageHeader } from "@/components/page";
import { Avatar, Progress, Skeleton } from "@/components/ui";
import { useActivity, useMe, useStats, useTasks } from "@/lib/client";
import { useLookups } from "@/lib/maps";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function Home() {
  const { data: me } = useMe();
  const { data: stats } = useStats();
  const { data: mineAll } = useTasks("assignee=me&column=open&limit=500");
  const mine = mineAll && [...mineAll].sort((a, b) => (a.phase || "P9").localeCompare(b.phase || "P9") || a.number - b.number).slice(0, 8);
  const { data: activity } = useActivity("limit=12");
  const { users, userMap, boardMap, boards } = useLookups();
  const phaseBoard = (key: string) => boards?.find((b) => b.phase === key)?.id;

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader title={me ? `${greeting()}, ${me.name}` : " "} subtitle="Where MENO stands today. Everything updates live as the team works." />

      <section className="card mb-6 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[15.5px] font-semibold">Road to production</h2>
            <p className="mt-0.5 text-[13px] text-ink-3">
              Every task across P0–P7. When all of them are Done, MENO is live with pilot customers.{" "}
              <Link href="/product" className="text-data hover:underline">
                See the product map
              </Link>
            </p>
          </div>
          <p className="font-display text-[30px] font-semibold tabular-nums tracking-[-0.02em]">
            {stats ? `${stats.overall.total ? Math.round((stats.overall.done / stats.overall.total) * 100) : 0}%` : "–"}
          </p>
        </div>
        <Progress value={stats?.overall.total ? (stats.overall.done / stats.overall.total) * 100 : 0} className="mt-3 h-2" />
        <p className="mt-2 font-mono text-[12px] tabular-nums text-ink-3">
          {stats ? `${stats.overall.done} done · ${stats.overall.open} to go · ${stats.overall.total} tasks` : ""}
        </p>
      </section>

      {me?.role === "admin" && <TeamProgress />}

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "My open tasks", value: Object.entries(stats?.mine ?? {}).filter(([k]) => k !== "done").reduce((s, [, n]) => s + n, 0) },
          { label: "In progress", value: stats?.columns.in_progress ?? 0 },
          { label: "In review + QA", value: (stats?.columns.review ?? 0) + (stats?.columns.qa ?? 0) },
          { label: "Done", value: stats?.columns.done ?? 0 },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-[12.5px] text-ink-3">{s.label}</p>
            <p className="mt-1 font-display text-[28px] font-semibold tabular-nums tracking-[-0.02em]">{stats ? s.value : "–"}</p>
          </div>
        ))}
      </section>

      <section className="card mb-6 p-5">
        <h2 className="mb-4 text-[15.5px] font-semibold">Phases</h2>
        {!stats ? (
          <Skeleton className="h-40" />
        ) : (
          <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
            {stats.phases.map((p) => {
              const pct = p.total ? (p.done / p.total) * 100 : 0;
              const id = phaseBoard(p.key);
              const row = (
                <>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="text-[13.5px]">
                      <span className="font-mono text-ink-3">{p.key}</span> <span className="font-medium">{p.name}</span>
                    </span>
                    <span className="font-mono text-[12px] tabular-nums text-ink-3">
                      {p.done}/{p.total} tasks · {p.features} features
                    </span>
                  </div>
                  <Progress value={pct} />
                </>
              );
              return id ? (
                <Link key={p.key} href={`/boards/${id}`} className="-m-2 rounded-ctl p-2 hover:bg-hover">
                  {row}
                </Link>
              ) : (
                <div key={p.key}>{row}</div>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="card min-w-0 p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[15.5px] font-semibold">My open tasks</h2>
            <Link href="/my-tasks" className="text-[12.5px] text-ink-3 hover:text-ink">
              See all
            </Link>
          </div>
          {mine ? <TaskRows tasks={mine} users={userMap} boards={boardMap} /> : <Skeleton className="h-48" />}
        </section>
        <section className="card min-w-0 p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[15.5px] font-semibold">Recent activity</h2>
            <Link href="/activity" className="text-[12.5px] text-ink-3 hover:text-ink">
              See all
            </Link>
          </div>
          <ActivityFeed items={activity} users={userMap} boards={boardMap} />
        </section>
      </div>

      {me?.role !== "admin" && <TeamProgress />}
    </div>
  );
}

/** Admin view: every developer's total, pending, in-progress, review/QA and finished task counts (live). */
function TeamProgress() {
  const { users } = useLookups();
  const totals = (users ?? []).reduce(
    (a, u) => ({ total: a.total + (u.total ?? 0), pending: a.pending + (u.pending ?? 0), active: a.active + (u.active ?? 0), review: a.review + (u.review ?? 0), done: a.done + (u.done ?? 0) }),
    { total: 0, pending: 0, active: 0, review: 0, done: 0 },
  );
  const cell = "px-3 py-2.5 text-right font-mono text-[13px] tabular-nums";
  return (
    <section className="card mb-6 overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h2 className="text-[15.5px] font-semibold">Team progress</h2>
        <Link href="/team" className="text-[12.5px] text-ink-3 hover:text-ink">
          Team pages
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-y border-line bg-side text-[12px] text-ink-3">
              <th className="px-5 py-2 font-medium">Developer</th>
              <th className="px-3 py-2 text-right font-medium">Total</th>
              <th className="px-3 py-2 text-right font-medium">Pending</th>
              <th className="px-3 py-2 text-right font-medium">In progress</th>
              <th className="px-3 py-2 text-right font-medium">Review + QA</th>
              <th className="px-3 py-2 text-right font-medium">Finished</th>
              <th className="w-48 px-5 py-2 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {!users && (
              <tr>
                <td colSpan={7} className="p-4">
                  <Skeleton className="h-24" />
                </td>
              </tr>
            )}
            {users?.map((u) => {
              const pct = u.total ? ((u.done ?? 0) / u.total) * 100 : 0;
              return (
                <tr key={u.id} className="hover:bg-hover">
                  <td className="px-5 py-2.5">
                    <Link href={`/team/${u.id}`} className="flex items-center gap-2.5">
                      <Avatar user={u} size={26} />
                      <span>
                        <span className="block text-[13.5px] font-medium">{u.name}</span>
                        <span className="block text-[11.5px] text-ink-4">{u.title}</span>
                      </span>
                    </Link>
                  </td>
                  <td className={cell}>{u.total}</td>
                  <td className={cell}>{u.pending}</td>
                  <td className={cell}>{u.active}</td>
                  <td className={cell}>{u.review}</td>
                  <td className={cell + " text-success"}>{u.done}</td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <Progress value={pct} />
                      <span className="w-9 text-right font-mono text-[11.5px] text-ink-3">{Math.round(pct)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {users && (
            <tfoot>
              <tr className="border-t border-line-2 bg-side text-[12.5px] font-medium">
                <td className="px-5 py-2.5">Team</td>
                <td className={cell}>{totals.total}</td>
                <td className={cell}>{totals.pending}</td>
                <td className={cell}>{totals.active}</td>
                <td className={cell}>{totals.review}</td>
                <td className={cell}>{totals.done}</td>
                <td className="px-5 py-2.5 text-[11.5px] text-ink-4">Tasks shared by several people count for each of them</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
}
