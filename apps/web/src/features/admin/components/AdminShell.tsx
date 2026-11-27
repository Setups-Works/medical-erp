"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, cn, type IconName } from "@meno/ui";
import { usePermissions } from "@/hooks/usePermissions";
import { withSlash } from "@/features/onboarding/utils";

/**
 * Users & Roles (NAVIGATION.md "Administration"): the Users, Roles and Permissions pages share one menu item, so they
 * get tabs. Each tab shows only when the person holds its view permission. The app shell (sidebar, top bar) wraps it.
 */
export const ADMIN_TABS: { href: string; label: string; icon: IconName; permission: string }[] = [
  { href: "/admin/users/", label: "Users", icon: "users", permission: "identity.user.view" },
  { href: "/admin/roles/", label: "Roles", icon: "shield", permission: "identity.role.view" },
  { href: "/admin/permissions/", label: "Permissions", icon: "key", permission: "identity.role.view" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = withSlash(usePathname());
  const permissions = usePermissions();
  const tabs = ADMIN_TABS.filter((t) => permissions.has(t.permission));

  return (
    <>
      {tabs.length > 1 && (
        <nav aria-label="Users and roles" className="-mt-2 mb-5 flex gap-1 overflow-x-auto border-b border-line pb-2">
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
      {children}
    </>
  );
}
