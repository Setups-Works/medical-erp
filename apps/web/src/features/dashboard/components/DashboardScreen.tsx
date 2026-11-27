"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, Icon, PageHeader, Progress, Skeleton, formatDate } from "@meno/ui";
import { buildMenu, canOpen } from "@/config/nav";
import { landingPath } from "@/features/auth/utils";
import { useChecklist } from "@/features/onboarding/queries";
import { progress, todayIso } from "@/features/onboarding/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useSessionUser } from "@/lib/session";

const ONBOARDING_VIEW = "tenancy.onboarding.view";

/**
 * Home dashboard (/dashboard). The KPI widgets (RPT-01, DSH-08) need sales, purchase and stock data that arrive in
 * P3–P4, so until then it shows only real things: who you are, set-up progress until go-live (AUT-15) and the
 * screens you can open today, straight from the menu.
 */
export function DashboardScreen() {
  const user = useSessionUser();
  const permissions = usePermissions();
  const firstName = user?.fullName?.split(" ")[0];
  const ready = useMemo(
    () => buildMenu(null, permissions.has).flatMap((g) => g.sections.flatMap((s) => s.items)).filter((i) => i.route !== "/dashboard" && canOpen(i, permissions.has)),
    [permissions],
  );

  return (
    <div data-testid="dashboard">
      <PageHeader eyebrow={formatDate(todayIso())} title={firstName ? `Hello, ${firstName}` : "Hello"} description="Your pharmacy at a glance." />
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {permissions.has(ONBOARDING_VIEW) && <SetupCard />}
        <Card className="flex flex-col gap-3">
          <h2 className="text-[15px] font-medium text-ink">Open now</h2>
          {permissions.isPending ? (
            <Skeleton className="h-16" />
          ) : ready.length ? (
            <ul className="flex flex-col gap-1" data-testid="dashboard-ready">
              {ready.map((i) => (
                <li key={i.route}>
                  <Link href={`${i.route}/`} className="flex h-9 items-center gap-2 rounded-ctl px-2 text-[13.5px] text-ink-2 hover:bg-hover hover:text-ink">
                    <span className="flex-1">{i.label}</span>
                    <span className="text-[12px] text-ink-4">{i.group}</span>
                    <Icon name="arrow-right" className="text-ink-4" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13.5px] text-ink-3">Nothing else is open to you yet. Your owner can give you access from Users & Roles.</p>
          )}
        </Card>
      </div>
      <Card className="mt-3">
        <h2 className="text-[15px] font-medium text-ink">Sales, stock and money</h2>
        <p className="mt-1 text-[13.5px] text-ink-3">Today’s sales, purchases, margin, low stock and near-expiry figures appear here once billing and purchases go live.</p>
      </Card>
    </div>
  );
}

/** Set-up progress until go-live. Hidden once live, and for people who can't see onboarding. */
function SetupCard() {
  const checklist = useChecklist();
  if (checklist.isPending) return <Skeleton className="h-[148px] rounded-card" />;
  if (checklist.isError || !checklist.data || checklist.data.live) return null;
  const { done, total } = progress(checklist.data);
  return (
    <Card className="flex flex-col gap-3" data-testid="dashboard-setup">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[15px] font-medium text-ink">Finish setting up</h2>
        <span className="font-mono text-[12.5px] text-ink-3 tabular-nums">
          {done}/{total}
        </span>
      </div>
      <Progress value={done} max={Math.max(total, 1)} label="Required set-up steps done" />
      <p className="text-[13.5px] text-ink-3">Billing opens after go-live. Pick up where you left off.</p>
      <div>
        <Link href={landingPath(checklist.data)} className="inline-flex h-8 items-center gap-1.5 rounded-ctl bg-ink px-3 text-[13px] font-medium text-paper hover:opacity-90">
          Continue set-up
          <Icon name="arrow-right" />
        </Link>
      </div>
    </Card>
  );
}
