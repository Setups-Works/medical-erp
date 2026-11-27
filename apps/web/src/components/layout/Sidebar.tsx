"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Button, Icon, Kbd, Wordmark, cn } from "@meno/ui";
import { buildMenu, locate, type CompanyEdition, type NavGroup, type NavItemSpec } from "@/config/nav";
import { WIDE, useMediaQuery } from "@/hooks/useMediaQuery";
import { usePermissions } from "@/hooks/usePermissions";
import { sidebarStore, useSidebar } from "@/stores/sidebar";

/**
 * App sidebar (NAV-01, NAVIGATION.md, DESIGN_LANGUAGE §5). A 48 px icon rail that opens to a 264 px panel: at 1280 px
 * and wider the panel pushes the page and the choice is remembered; narrower, it covers the page and closes after
 * a click; under 768 px the rail is hidden and the panel opens from the top bar's menu button.
 */
export function Sidebar({ edition = null }: { edition?: CompanyEdition }) {
  const pathname = usePathname();
  const permissions = usePermissions();
  const { expanded, openGroups, drawer } = useSidebar();
  const wide = useMediaQuery(WIDE);
  const open = drawer || (wide && expanded);
  const menu = useMemo(() => buildMenu(edition, permissions.has), [edition, permissions]);
  const active = locate(pathname);

  // Leaving a page closes the covering panel; Esc closes it too (KEYBOARD_SHORTCUTS.md rule 8).
  useEffect(() => sidebarStore.setDrawer(false), [pathname]);
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && sidebarStore.setDrawer(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  const reveal = (group: string) => {
    if (wide) sidebarStore.reveal(group);
    else {
      if (!openGroups.includes(group)) sidebarStore.toggleGroup(group);
      sidebarStore.setDrawer(true);
    }
  };

  return (
    <>
      {/* Keeps the page clear of the fixed sidebar: the rail on tablets, the rail or panel on counter PCs. */}
      <div aria-hidden className={cn("hidden shrink-0 md:block md:w-12", expanded && "xl:w-[264px]")} />
      {drawer && !wide && <div aria-hidden className="fixed inset-0 z-30 bg-ink/20" onClick={() => sidebarStore.setDrawer(false)} />}
      <aside
        aria-label="Main menu"
        data-testid="sidebar"
        data-state={open ? "open" : "rail"}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-line bg-side transition-[width] duration-200 ease-meno-out motion-reduce:transition-none",
          open ? "w-[264px]" : "hidden w-12 md:flex",
        )}
      >
        <div className={cn("flex h-12 shrink-0 items-center border-b border-line", open ? "justify-between pr-1.5 pl-4" : "justify-center")}>
          <Link href="/dashboard/" aria-label="MENO home" className="rounded-tab">
            {open ? <Wordmark size={22} /> : <span className="font-brand text-[22px] leading-none text-ink">M</span>}
          </Link>
          {drawer && !wide && (
            <Button variant="ghost" size="icon" onClick={() => sidebarStore.setDrawer(false)} aria-label="Close menu">
              <Icon name="x" />
            </Button>
          )}
        </div>

        <nav aria-label="Main" className="flex-1 overflow-y-auto overscroll-contain py-2">
          {menu.map((g) =>
            open ? <Group key={g.name} group={g} isOpen={openGroups.includes(g.name) || g.name === active?.group} active={active} /> : <RailButton key={g.name} group={g} active={active} onClick={() => reveal(g.name)} />,
          )}
        </nav>

        {wide && (
          <div className="shrink-0 border-t border-line p-1.5">
            <Button
              variant="ghost"
              size={open ? "md" : "icon"}
              className={cn("text-ink-3", open && "w-full justify-start")}
              onClick={sidebarStore.toggleExpanded}
              aria-label={open ? undefined : "Expand sidebar"}
              aria-expanded={open}
              data-testid="sidebar-toggle"
            >
              <Icon name="panel-left" />
              {open && "Collapse sidebar"}
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}

function RailButton({ group, active, onClick }: { group: NavGroup; active: NavItemSpec | null; onClick: () => void }) {
  const current = active?.group === group.name;
  return (
    <div className="flex justify-center py-0.5">
      <button
        type="button"
        onClick={onClick}
        aria-label={group.name}
        title={group.name}
        className={cn("grid size-9 place-items-center rounded-tab text-ink-3 hover:bg-hover hover:text-ink", current && "bg-hover text-ink")}
      >
        <Icon name={group.icon} />
      </button>
    </div>
  );
}

function Group({ group, isOpen, active }: { group: NavGroup; isOpen: boolean; active: NavItemSpec | null }) {
  const id = `nav-${group.name.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <div className="px-2 pb-1">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={id}
        onClick={() => sidebarStore.toggleGroup(group.name)}
        className="flex h-8 w-full items-center gap-2 rounded-tab px-2 text-[11.5px] font-medium tracking-[0.04em] text-ink-4 uppercase hover:bg-hover hover:text-ink-2"
      >
        <Icon name={group.icon} className="text-ink-4" />
        <span className="flex-1 text-left">{group.name}</span>
        <Icon name={isOpen ? "chevron-down" : "chevron-right"} className="size-3.5" />
      </button>
      {isOpen && (
        <ul id={id} className="mt-0.5 flex flex-col gap-px">
          {group.sections.map((s) => (
            <li key={s.name ?? "_"}>
              {s.name && <p className="px-2 pt-2 pb-1 pl-8 text-[11.5px] text-ink-4">{s.name}</p>}
              <ul className="flex flex-col gap-px">
                {s.items.map((item) => (
                  <li key={item.route}>
                    <Item item={item} current={active?.route === item.route} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Item({ item, current }: { item: NavItemSpec; current: boolean }) {
  const base = "flex h-8 items-center gap-2 rounded-tab pr-2 pl-8 text-[13.5px]";
  if (!item.live) {
    return (
      <span aria-disabled="true" className={cn(base, "text-ink-4")}>
        <span className="flex-1 truncate">{item.label}</span>
        <span className="text-[11px]">Soon</span>
      </span>
    );
  }
  return (
    <Link href={`${item.route}/`} aria-current={current ? "page" : undefined} className={cn(base, "text-ink-2 hover:bg-hover hover:text-ink", current && "bg-hover font-medium text-ink")}>
      <span className="flex-1 truncate">{item.label}</span>
      {item.shortcut && <Kbd className="hidden xl:inline-flex">{item.shortcut}</Kbd>}
    </Link>
  );
}
