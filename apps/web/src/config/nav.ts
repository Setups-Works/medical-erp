import type { IconName } from "@meno/ui";
import { NAV_ITEMS } from "./nav.generated";

/**
 * Sidebar menu (NAV-01). Every item, its permission and whether its screen exists come from the docs and the route
 * folders through nav.generated.ts (`pnpm gen:nav`, scripts/nav/build-nav.mjs). Never add or gate a menu item here:
 * change docs/design/NAVIGATION.md.
 */

/** B = both editions, R = retail only, W = wholesale only (NAVIGATION.md "Edition"). */
export type NavEdition = "B" | "R" | "W";

/** A company's edition (MULTI_TENANCY.md). `null` while unknown: `company.edition` arrives with PLT-02. */
export type CompanyEdition = "RETAIL" | "WHOLESALE" | "BOTH" | null;

export type NavItemSpec = {
  group: string;
  label: string;
  route: string;
  edition: NavEdition;
  features: string[];
  section?: string;
  shortcut?: string;
  /** `module.resource.action`, or `all` for every signed-in person. Empty until the module defines its codes. */
  permission?: string;
  /** Pages outside the sidebar that keep this item highlighted (from PAGES.md feature IDs). */
  also?: string[];
  /** The screen exists in apps/web/src/app/(app). */
  live: boolean;
};

/** Icon per group: NAVIGATION.md "Sidebar look" and "Platform group icons". Order follows the tables. */
const GROUP_ICONS: Readonly<Record<string, IconName>> = {
  Dashboard: "layout-dashboard",
  Sales: "receipt",
  Purchase: "shopping-cart",
  Inventory: "boxes",
  Masters: "database",
  Wholesale: "truck",
  Finance: "landmark",
  "CRM & Engagement": "heart-handshake",
  Reports: "bar-chart",
  "GST & Compliance": "shield",
  Administration: "settings",
  // Platform sidebar (MENO staff)
  Overview: "layout-dashboard",
  Customers: "building",
  Operations: "database",
  Security: "shield",
};

export type NavSection = { name: string | null; items: NavItemSpec[] };
export type NavGroup = { name: string; icon: IconName; sections: NavSection[] };

export function editionAllows(item: NavEdition, company: CompanyEdition): boolean {
  if (item === "B" || company === null || company === "BOTH") return true;
  return item === "R" ? company === "RETAIL" : company === "WHOLESALE";
}

/** May this person open the item? Screens not built yet carry no permission and are never openable. */
export function canOpen(item: NavItemSpec, has: (permission: string) => boolean): boolean {
  if (!item.live || !item.permission) return false;
  return item.permission === "all" || has(item.permission);
}

/**
 * The menu one person sees. Hidden: items outside the company's edition, and built screens they lack the permission
 * for (NAVIGATION.md rules). Screens not built yet stay visible as "Soon" so the whole product map is in view.
 */
export function buildMenu(edition: CompanyEdition, has: (permission: string) => boolean, items: readonly NavItemSpec[] = NAV_ITEMS): NavGroup[] {
  const visible = items.filter((i) => editionAllows(i.edition, edition) && (!i.live || canOpen(i, has)));
  const groups: NavGroup[] = [];
  for (const item of visible) {
    let group = groups.find((g) => g.name === item.group);
    if (!group) {
      group = { name: item.group, icon: GROUP_ICONS[item.group] ?? "circle", sections: [] };
      groups.push(group);
    }
    const name = item.section ?? null;
    const last = group.sections.at(-1);
    if (last && last.name === name) last.items.push(item);
    else group.sections.push({ name, items: [item] });
  }
  return groups;
}

const trim = (p: string) => (p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p);

function owns(item: NavItemSpec, path: string, items: readonly NavItemSpec[]): number {
  const under = (r: string) => path === r || path.startsWith(`${r}/`);
  // A route that is itself the parent of other menu items (/dashboard, /admin, /platform) owns only its exact page.
  const parent = items.some((o) => o.route !== item.route && o.route.startsWith(`${item.route}/`));
  if (parent ? path === item.route : under(item.route)) return item.route.length;
  return (item.also ?? []).some(under) ? 1 : 0;
}

/** The one menu item that owns a page (sidebar highlight, breadcrumb). The most specific match wins. */
export function locate(pathname: string, items: readonly NavItemSpec[] = NAV_ITEMS): NavItemSpec | null {
  const path = trim(pathname);
  let best: NavItemSpec | null = null;
  let bestScore = 0;
  for (const i of items) {
    const score = owns(i, path, items);
    if (score > bestScore) [best, bestScore] = [i, score];
  }
  return best;
}

/** `G` go-to keys from NAVIGATION.md's Shortcut column ("G H" → "h"). */
export function goToKeys(items: readonly NavItemSpec[] = NAV_ITEMS): Map<string, NavItemSpec> {
  const map = new Map<string, NavItemSpec>();
  for (const i of items) {
    const key = i.shortcut?.match(/^G (.)$/)?.[1];
    if (key) map.set(key.toLowerCase(), i);
  }
  return map;
}
