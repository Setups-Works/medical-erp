"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Icon, Wordmark, cn, type IconName } from "@meno/ui";
import { useTheme } from "@/hooks/useTheme";
import { usePermissions } from "@/hooks/usePermissions";
import { withSlash } from "@/features/onboarding/utils";

/**
 * Administration pages (NAVIGATION.md "Administration"). Each tab shows only when the person holds its view
 * permission. A stand-in frame until the app shell (sidebar, top bar, branch switcher) ships; then these pages move
 * into it unchanged.
 */
export const ADMIN_TABS: { href: string; label: string; icon: IconName; permission: string }[] = [
  { href: "/admin/users/", label: "Users", icon: "users", permission: "identity.user.view" },
  { href: "/admin/roles/", label: "Roles", icon: "shield", permission: "identity.role.view" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { scheme, toggle } = useTheme();
  const pathname = withSlash(usePathname());
  const permissions = usePermissions();
  const tabs = ADMIN_TABS.filter((t) => permissions.has(t.permission));

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="sticky top-0 z-10 border-b border-line bg-paper">
        <div className="mx-auto flex h-12 w-full max-w-[1280px] items-center gap-3 px-4">
          <Link href="/dashboard/" className="rounded-tab" aria-label="MENO dashboard">
            <Wordmark size={22} />
          </Link>
          <span className="text-[12.5px] text-ink-4">Administration</span>
          <Button variant="ghost" size="icon" className="ml-auto" onClick={toggle} aria-label={scheme === "dark" ? "Switch to light" : "Switch to dark"}>
            <Icon name={scheme === "dark" ? "sun" : "moon"} />
          </Button>
        </div>
        {tabs.length > 1 && (
          <nav aria-label="Administration" className="mx-auto flex w-full max-w-[1280px] gap-1 overflow-x-auto px-3 pb-2">
            {tabs.map((t) => {
              const active = pathname.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={cn("flex h-8 shrink-0 items-center gap-2 rounded-tab px-2.5 text-[13px] text-ink-3 hover:bg-hover hover:text-ink", active && "bg-raised font-medium text-ink shadow-[0_0_0_1px_var(--line)]")}
                >
                  <Icon name={t.icon} className="text-ink-4" />
                  {t.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pt-6 pb-12">{children}</main>
    </div>
  );
}
