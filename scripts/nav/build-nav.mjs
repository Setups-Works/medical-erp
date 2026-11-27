#!/usr/bin/env node
/**
 * docs → apps/web/src/config/nav.generated.ts (NAV-01). Nothing about the menu is typed by hand in the web app:
 *
 *   label, route, edition, features, section, shortcut, permission   docs/design/NAVIGATION.md (sidebar table)
 *   live      the screen exists: apps/web/src/app/(app)<route>/page.tsx
 *   PLATFORM_ITEMS from the "Platform sidebar" table (MENO staff, ADR-0020); live = app/platform/(staff)<route>/page.tsx
 *   also      pages that aren't in the sidebar (docs/product/PAGES.md) but belong to this item: same first path
 *             segment and a shared feature ID, e.g. /admin/roles (PLT-07) → Users & Roles (PLT-06, PLT-07)
 *
 *   node scripts/nav/build-nav.mjs          write the file   (pnpm gen:nav)
 *   node scripts/nav/build-nav.mjs --check  exit 1 if the committed file is stale or a rule is broken
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const NAVIGATION = join(root, "docs/design/NAVIGATION.md");
const PAGES = join(root, "docs/product/PAGES.md");
const APP = join(root, "apps/web/src/app/(app)");
const PLATFORM_APP = join(root, "apps/web/src/app/platform/(staff)");
const TARGET = join(root, "apps/web/src/config/nav.generated.ts");
const EDITIONS = new Set(["B", "R", "W"]);
const PERMISSION = /^[a-z]+(\.[a-z_]+){2}$/; // module.resource.action (ADR-0014)

const strip = (s) => s.replaceAll("`", "").trim();
const featureIds = (s) => s.match(/\b[A-Z]{3}-\d{2}\b/g) ?? [];

/** Rows of the sidebar table (the first table that starts with "| Group | Menu item |"). */
export function parseNavigation(markdown) {
  const lines = markdown.split("\n");
  const start = lines.findIndex((l) => /^\|\s*Group\s*\|\s*Menu item\s*\|/.test(l));
  if (start < 0) throw new Error("NAVIGATION.md: sidebar table not found");
  const items = [];
  for (const line of lines.slice(start + 2)) {
    if (!line.startsWith("|")) break;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length !== 8) throw new Error(`NAVIGATION.md: expected 8 cells, got ${cells.length}: ${line}`);
    const [group, label, route, edition, features, section, shortcut, permission] = cells;
    if (!route.startsWith("/")) throw new Error(`NAVIGATION.md: bad route "${route}"`);
    if (!EDITIONS.has(edition)) throw new Error(`NAVIGATION.md: bad edition "${edition}" for ${route}`);
    const perm = strip(permission);
    if (perm && perm !== "all" && !PERMISSION.test(perm)) throw new Error(`NAVIGATION.md: bad permission "${perm}" for ${route}`);
    items.push({
      group,
      label,
      route,
      edition,
      features: featureIds(features),
      ...(section ? { section } : {}),
      ...(strip(shortcut) ? { shortcut: strip(shortcut) } : {}),
      ...(perm ? { permission: perm } : {}),
    });
  }
  return items;
}

/** Rows of the "Platform sidebar" table: Group | Menu item | Route | Feature IDs | Permission. */
export function parsePlatform(markdown) {
  const lines = markdown.split("\n");
  const start = lines.findIndex((l) => /^\|\s*Group\s*\|\s*Menu item\s*\|\s*Route\s*\|\s*Feature IDs\s*\|\s*Permission\s*\|/.test(l));
  if (start < 0) throw new Error("NAVIGATION.md: platform sidebar table not found");
  const items = [];
  for (const line of lines.slice(start + 2)) {
    if (!line.startsWith("|")) break;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length !== 5) throw new Error(`NAVIGATION.md platform table: expected 5 cells, got ${cells.length}: ${line}`);
    const [group, label, route, features, permission] = cells;
    if (!route.startsWith("/platform")) throw new Error(`NAVIGATION.md platform table: route "${route}" is not under /platform`);
    const perm = strip(permission);
    if (perm && !/^platform\.[a-z_]+\.[a-z_]+$/.test(perm)) throw new Error(`NAVIGATION.md platform table: bad permission "${perm}" for ${route}`);
    items.push({ group, label, route, edition: "B", features: featureIds(features), ...(perm ? { permission: perm } : {}) });
  }
  return items;
}

/** Every page route in PAGES.md with its feature IDs. */
export function parsePages(markdown) {
  const pages = [];
  for (const line of markdown.split("\n")) {
    const c = line.split("|").map((x) => x.trim());
    if (c.length > 5 && c[2].startsWith("`/")) pages.push({ route: strip(c[2]).split("?")[0], features: featureIds(c[4]) });
  }
  return pages;
}

const segment = (route) => route.split("/")[1] ?? "";

/** Sub-pages for each sidebar item. A page goes to the item sharing the most feature IDs (ties: first in the menu). */
export function attachSubPages(items, pages) {
  const menuRoutes = new Set(items.map((i) => i.route));
  const also = new Map(items.map((i) => [i.route, []]));
  for (const page of pages) {
    if (menuRoutes.has(page.route) || page.route.includes("[")) continue;
    let best = null;
    let score = 0;
    for (const item of items) {
      if (segment(item.route) !== segment(page.route)) continue;
      const shared = page.features.filter((f) => item.features.includes(f)).length;
      if (shared > score) [best, score] = [item, shared];
    }
    if (best && !page.route.startsWith(`${best.route}/`)) also.get(best.route).push(page.route);
  }
  return items.map((i) => (also.get(i.route).length ? { ...i, also: [...new Set(also.get(i.route))].sort() } : i));
}

function guard(items) {
  const unguarded = items.filter((i) => i.live && !i.permission);
  if (unguarded.length)
    throw new Error(`NAVIGATION.md: built screens need a Permission (or \`all\`): ${unguarded.map((i) => i.route).join(", ")}`);
  return items;
}

export function build({ navigation, pages, isBuilt }) {
  return guard(attachSubPages(parseNavigation(navigation), parsePages(pages)).map((i) => ({ ...i, live: isBuilt(i.route) })));
}

/** `isBuilt` gets the route under /platform, e.g. "/reference-data" for /platform/reference-data. */
export function buildPlatform({ navigation, pages, isBuilt }) {
  const known = new Set(parsePages(pages).map((p) => p.route));
  const items = parsePlatform(navigation);
  const missing = items.filter((i) => !known.has(i.route)).map((i) => i.route);
  if (missing.length) throw new Error(`NAVIGATION.md platform table: routes not in PAGES.md: ${missing.join(", ")}`);
  return guard(items.map((i) => ({ ...i, live: isBuilt(i.route.slice("/platform".length) || "/") })));
}

export function render(items, platform = []) {
  const body = items.map((i) => `  ${JSON.stringify(i)},`).join("\n");
  const platformBody = platform.map((i) => `  ${JSON.stringify(i)},`).join("\n");
  return `// Generated by scripts/nav/build-nav.mjs from docs/design/NAVIGATION.md, docs/product/PAGES.md and the routes in
// apps/web/src/app/(app). Do not edit: change the docs or add the page, then run \`pnpm gen:nav\`.
import type { NavItemSpec } from "./nav";

export const NAV_ITEMS: readonly NavItemSpec[] = [
${body}
];

/** MENO staff sidebar (NAVIGATION.md "Platform sidebar"). */
export const PLATFORM_ITEMS: readonly NavItemSpec[] = [
${platformBody}
];
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const navigation = readFileSync(NAVIGATION, "utf8");
    const pages = readFileSync(PAGES, "utf8");
    const output = render(
      build({ navigation, pages, isBuilt: (route) => existsSync(join(APP, route, "page.tsx")) }),
      buildPlatform({ navigation, pages, isBuilt: (route) => existsSync(join(PLATFORM_APP, route, "page.tsx")) }),
    );
    if (process.argv.includes("--check")) {
      const current = existsSync(TARGET) ? readFileSync(TARGET, "utf8") : "";
      if (current !== output) {
        console.error("apps/web/src/config/nav.generated.ts is stale. Run: pnpm gen:nav");
        process.exit(1);
      }
      console.log("nav.generated.ts matches the docs and routes");
    } else {
      writeFileSync(TARGET, output);
      console.log(`Wrote ${TARGET}`);
    }
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
}
