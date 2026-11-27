"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, Icon, Wordmark, cn, type IconName } from "@meno/ui";
import { useTheme } from "@/hooks/useTheme";
import { withSlash } from "@/features/onboarding/utils";
import { usePlatformSignOut } from "../queries";
import { usePlatformStaff } from "../session";

/** MENO staff pages (ROLES_AND_DASHBOARDS.md "SA"). Tabs show only with their permission; more pages join later. */
const TABS: { href: string; label: string; icon: IconName; permission: string }[] = [
  { href: "/platform/reference-data/", label: "Reference data", icon: "database", permission: "platform.reference.view" },
];

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const { scheme, toggle } = useTheme();
  const pathname = withSlash(usePathname());
  const staff = usePlatformStaff();
  const signOut = usePlatformSignOut();
  const router = useRouter();
  const tabs = TABS.filter((t) => staff?.permissions?.includes(t.permission));

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="sticky top-0 z-10 border-b border-line bg-paper">
        <div className="mx-auto flex h-12 w-full max-w-[1280px] items-center gap-3 px-4">
          <Wordmark size={22} />
          <span className="text-[12.5px] text-ink-4">Platform</span>
          <span className="ml-auto hidden truncate text-[12.5px] text-ink-3 sm:block" data-testid="platform-staff-name">
            {staff?.fullName}
          </span>
          <Button variant="ghost" size="icon" className="max-sm:ml-auto" onClick={toggle} aria-label={scheme === "dark" ? "Switch to light" : "Switch to dark"}>
            <Icon name={scheme === "dark" ? "sun" : "moon"} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              signOut();
              router.replace("/platform/login/");
            }}
            aria-label="Sign out"
            data-testid="platform-sign-out"
          >
            <Icon name="log-out" />
          </Button>
        </div>
        {tabs.length > 0 && (
          <nav aria-label="Platform" className="mx-auto flex w-full max-w-[1280px] gap-1 overflow-x-auto px-3 pb-2">
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
