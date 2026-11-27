"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Icon, PageHeader } from "@meno/ui";
import { usePermissions } from "@/hooks/usePermissions";
import { useSessionUser } from "@/lib/session";
import { useLogout, useLogoutAll } from "../queries";
import { AuthShell } from "./AuthShell";

/**
 * Landing after sign-in until the app shell and role dashboards (NAVIGATION.md, Meyyarivu / Gokul) are built.
 * It only proves the session works end to end.
 */
export function DashboardPlaceholder() {
  const user = useSessionUser();
  const logout = useLogout();
  const logoutAll = useLogoutAll();
  const router = useRouter();
  const permissions = usePermissions();
  const toLogin = { onSettled: () => router.replace("/login/") };
  return (
    <AuthShell wide>
      <PageHeader eyebrow="Dashboard" title={`Hello, ${user?.fullName?.split(" ")[0] ?? "there"}`} description="The MENO workspace opens here once the app shell ships." />
      <Card className="flex flex-col gap-3">
        <p className="text-[13.5px] text-ink-2">
          Signed in as <span className="font-medium text-ink">{user?.email}</span>
          {user?.roles?.length ? <> · {user.roles.join(", ").toLowerCase()}</> : null}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/onboarding/" className="inline-flex h-8 items-center gap-1.5 rounded-ctl px-3 text-[13px] text-ink shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-hover">
            <Icon name="check-circle" />
            Set-up checklist
          </Link>
          {permissions.has("identity.user.view") && (
            <Link href="/admin/users/" className="inline-flex h-8 items-center gap-1.5 rounded-ctl px-3 text-[13px] text-ink shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-hover" data-testid="admin-users-link">
              <Icon name="users" />
              Users
            </Link>
          )}
          <Button variant="ghost" onClick={() => logout.mutate(undefined, toLogin)} data-testid="sign-out">
            <Icon name="log-out" />
            Sign out
          </Button>
          <Button variant="ghost" loading={logoutAll.isPending} onClick={() => logoutAll.mutate(undefined, toLogin)} data-testid="sign-out-all">
            <Icon name="log-out" />
            Sign out of all devices
          </Button>
        </div>
        <p className="text-[12.5px] text-ink-3">Use this if you signed in on a shared or lost computer. Every browser and counter PC has to sign in again.</p>
      </Card>
    </AuthShell>
  );
}
