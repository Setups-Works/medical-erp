"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Button, Icon, Popover, PopoverContent, PopoverTrigger } from "@meno/ui";
import { ShellFrame } from "@/components/layout/AppShell";
import { PLATFORM_ITEMS } from "@/config/nav.generated";
import { buildMenu } from "@/config/nav";
import { usePlatformSignOut } from "../queries";
import { usePlatformStaff } from "../session";

/**
 * MENO staff pages (ROLES_AND_DASHBOARDS.md "SA", ADR-0020) in the same sidebar and top bar as the tenant app. The
 * menu is NAVIGATION.md "Platform sidebar" (`PLATFORM_ITEMS`): an item shows when the staff member holds its
 * `platform.*` permission (from the platform token); screens not built yet show as "Soon".
 */
export function PlatformShell({ children }: { children: React.ReactNode }) {
  const staff = usePlatformStaff();
  const granted = staff?.permissions;
  const menu = useMemo(() => {
    const has = (p: string) => granted?.includes(p) ?? false;
    return buildMenu(null, has, PLATFORM_ITEMS);
  }, [granted]);

  return (
    <ShellFrame menu={menu} items={PLATFORM_ITEMS} home="/platform/reference-data/" label="Platform" account={<StaffMenu />}>
      {children}
    </ShellFrame>
  );
}

/** Who is signed in as MENO staff, and sign out (the session lives only in this tab). */
function StaffMenu() {
  const staff = usePlatformStaff();
  const signOut = usePlatformSignOut();
  const router = useRouter();
  const name = staff?.fullName ?? staff?.email ?? "MENO staff";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Account: ${name}`} data-testid="platform-account">
          <Icon name="user" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px]">
        <div className="border-b border-line px-2.5 pt-1.5 pb-2.5">
          <p className="truncate font-medium text-ink" data-testid="platform-staff-name">
            {name}
          </p>
          {staff?.email && <p className="truncate text-[12.5px] text-ink-3">{staff.email}</p>}
          <p className="mt-0.5 text-[12px] text-ink-4">MENO staff</p>
        </div>
        <div className="flex flex-col pt-1.5">
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => {
              signOut();
              router.replace("/platform/login/");
            }}
            data-testid="platform-sign-out"
          >
            <Icon name="log-out" />
            Sign out
          </Button>
          <p className="px-2.5 pt-1 pb-1.5 text-[12px] text-ink-4">Reloading the page also signs you out: staff sessions are kept only in this tab.</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
