"use client";

import { Button, Icon } from "@meno/ui";
import type { NavItemSpec } from "@/config/nav";
import { WIDE, useMediaQuery } from "@/hooks/useMediaQuery";
import { useTheme } from "@/hooks/useTheme";
import { sidebarStore, useSidebar } from "@/stores/sidebar";

/**
 * 48 px top bar (DESIGN_LANGUAGE §5): menu button, breadcrumb from the menu, theme, user menu. Branch switcher,
 * command search (NAV-02) and notifications join it with their features.
 */
export function TopBar({ here, account }: { here: NavItemSpec | null; account: React.ReactNode }) {
  const { expanded, drawer } = useSidebar();
  const wide = useMediaQuery(WIDE);
  const { scheme, toggle } = useTheme();
  const open = wide ? expanded : drawer;

  return (
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 border-b border-line bg-paper px-2 sm:px-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => (wide ? sidebarStore.toggleExpanded() : sidebarStore.setDrawer(!drawer))}
        aria-label={open ? "Hide menu" : "Show menu"}
        aria-expanded={open}
        data-testid="menu-button"
        className={wide ? undefined : "md:hidden"}
      >
        <Icon name={wide ? "panel-left" : "menu"} />
      </Button>
      {here && (
        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="flex items-center gap-1.5 text-[13px]">
            <li className="hidden text-ink-4 sm:block">{here.group}</li>
            <li aria-hidden className="hidden text-ink-4 sm:block">
              /
            </li>
            <li aria-current="page" className="truncate font-medium text-ink">
              {here.label}
            </li>
          </ol>
        </nav>
      )}
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label={scheme === "dark" ? "Switch to light" : "Switch to dark"}>
          <Icon name={scheme === "dark" ? "sun" : "moon"} />
        </Button>
        {account}
      </div>
    </header>
  );
}
