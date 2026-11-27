"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { NAV_ITEMS } from "@/config/nav.generated";
import { buildMenu, locate, type NavGroup, type NavItemSpec } from "@/config/nav";
import { useGoToShortcuts } from "@/hooks/useGoToShortcuts";
import { usePermissions } from "@/hooks/usePermissions";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { UserMenu } from "./UserMenu";

/** The frame: sidebar, top bar and page. Shared by the tenant app and the MENO staff pages. */
export function ShellFrame({ menu, items, home, label, account, children }: { menu: NavGroup[]; items: readonly NavItemSpec[]; home: string; label: string; account: React.ReactNode; children: React.ReactNode }) {
  const active = locate(usePathname(), items);
  return (
    <div className="flex min-h-dvh bg-paper">
      <Sidebar menu={menu} active={active} home={home} label={label} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar here={active} account={account} />
        <main id="main" className="mx-auto w-full max-w-[1280px] flex-1 px-4 pt-6 pb-12 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}

/** Frame for every signed-in workspace page (apps/web AGENTS.md: `(app)/layout.tsx`). */
export function AppShell({ children }: { children: React.ReactNode }) {
  useGoToShortcuts();
  const permissions = usePermissions();
  // Edition is unknown until company.edition ships (PLT-02): both editions show.
  const menu = useMemo(() => buildMenu(null, permissions.has), [permissions]);
  return (
    <ShellFrame menu={menu} items={NAV_ITEMS} home="/dashboard/" label="Main" account={<UserMenu />}>
      {children}
    </ShellFrame>
  );
}
