import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildMenu, canOpen, editionAllows, goToKeys, locate, type NavItemSpec } from "@/config/nav";
import { NAV_ITEMS, PLATFORM_ITEMS } from "@/config/nav.generated";
import { isTyping } from "@/hooks/useGoToShortcuts";
// @ts-expect-error plain ESM build script without types
import { attachSubPages, build, buildPlatform, parseNavigation, parsePlatform, render } from "../../../../scripts/nav/build-nav.mjs";

const repo = (p: string) => fileURLToPath(new URL(`../../../../${p}`, import.meta.url));
const none = () => false;
const all = () => true;
const item = (over: Partial<NavItemSpec>): NavItemSpec => ({ group: "Sales", label: "X", route: "/x", edition: "B", features: [], live: false, ...over });

describe("nav.generated.ts", () => {
  it("matches NAVIGATION.md, PAGES.md and the built routes (run `pnpm gen:nav` if this fails)", () => {
    const navigation = readFileSync(repo("docs/design/NAVIGATION.md"), "utf8");
    const pages = readFileSync(repo("docs/product/PAGES.md"), "utf8");
    const items = build({ navigation, pages, isBuilt: (route: string) => existsSync(repo(`apps/web/src/app/(app)${route}/page.tsx`)) });
    const platform = buildPlatform({ navigation, pages, isBuilt: (route: string) => existsSync(repo(`apps/web/src/app/platform/(staff)${route}/page.tsx`)) });
    expect(render(items, platform)).toBe(readFileSync(repo("apps/web/src/config/nav.generated.ts"), "utf8"));
  });

  it("has Dashboard + the 10 groups of NAVIGATION.md, in order", () => {
    expect([...new Set(NAV_ITEMS.map((i) => i.group))]).toEqual([
      "Dashboard",
      "Sales",
      "Purchase",
      "Inventory",
      "Masters",
      "Wholesale",
      "Finance",
      "CRM & Engagement",
      "Reports",
      "GST & Compliance",
      "Administration",
    ]);
  });
});

describe("platform menu", () => {
  it("lists the /platform pages and opens only built ones the staff member may see", () => {
    expect(PLATFORM_ITEMS.every((i) => i.route.startsWith("/platform"))).toBe(true);
    const routes = (has: (p: string) => boolean) => buildMenu(null, has, PLATFORM_ITEMS).flatMap((g) => g.sections.flatMap((s) => s.items.filter((i) => i.live).map((i) => i.route)));
    expect(routes((p) => p === "platform.reference.view")).toEqual(["/platform/reference-data"]);
    expect(routes(none)).toEqual([]);
    expect(locate("/platform/reference-data/", PLATFORM_ITEMS)?.label).toBe("Reference data");
    expect(locate("/platform/", PLATFORM_ITEMS)?.label).toBe("Platform dashboard");
  });

  it("rejects a platform row outside /platform or with a tenant permission", () => {
    const t = (row: string) => ["| Group | Menu item | Route | Feature IDs | Permission |", "|---|---|---|---|---|", row].join("\n");
    expect(() => parsePlatform(t("| Ops | X | /admin/x | PLT-22 |  |"))).toThrow(/not under \/platform/);
    expect(() => parsePlatform(t("| Ops | X | /platform/x | PLT-22 | `identity.user.view` |"))).toThrow(/permission/);
  });
});

describe("build-nav.mjs", () => {
  const table = (rows: string[]) => ["| Group | Menu item | Route | Edition | Feature IDs | Section | Shortcut | Permission |", "|---|---|---|---|---|---|---|---|", ...rows].join("\n");

  it("reads every column", () => {
    expect(parseNavigation(table(["| Masters | Ledgers | /finance/accounts | B | ACC-03, ACX-03 | Accounts masters | `G L` | `finance.ledger.view` |"]))).toEqual([
      { group: "Masters", label: "Ledgers", route: "/finance/accounts", edition: "B", features: ["ACC-03", "ACX-03"], section: "Accounts masters", shortcut: "G L", permission: "finance.ledger.view" },
    ]);
  });

  it("rejects bad editions and permission codes", () => {
    expect(() => parseNavigation(table(["| Sales | X | /x | Z | POS-01 |  |  |  |"]))).toThrow(/edition/);
    expect(() => parseNavigation(table(["| Sales | X | /x | B | POS-01 |  |  | Sales View |"]))).toThrow(/permission/);
  });

  it("refuses a built screen without a permission", () => {
    expect(() => build({ navigation: table(["| Sales | X | /x | B | POS-01 |  |  |  |"]), pages: "", isBuilt: () => true })).toThrow(/Permission/);
  });

  it("gives a page outside the menu to the item sharing a feature in the same area", () => {
    const items = [
      { group: "Administration", label: "Settings Home", route: "/admin", edition: "B", features: ["PLT-13"] },
      { group: "Administration", label: "Users & Roles", route: "/admin/users", edition: "B", features: ["PLT-06", "PLT-07"] },
    ];
    const out = attachSubPages(items, [
      { route: "/admin/roles", features: ["PLT-07"] },
      { route: "/admin/users/new", features: ["PLT-06"] },
      { route: "/sales/roles", features: ["PLT-07"] },
    ]);
    expect(out[1].also).toEqual(["/admin/roles"]);
    expect(out[0].also).toBeUndefined();
  });
});

describe("menu", () => {
  it("filters by edition; unknown edition shows both", () => {
    expect(editionAllows("R", "WHOLESALE")).toBe(false);
    expect(editionAllows("W", "WHOLESALE")).toBe(true);
    expect(editionAllows("R", "BOTH")).toBe(true);
    expect(editionAllows("W", null)).toBe(true);
    expect(editionAllows("B", "RETAIL")).toBe(true);
  });

  it("hides built screens the person may not open, keeps unbuilt ones as Soon", () => {
    const items = [
      item({ route: "/a", live: true, permission: "all" }),
      item({ route: "/b", live: true, permission: "sales.invoice.view" }),
      item({ route: "/c", live: false }),
      item({ route: "/d", edition: "W" }),
    ];
    const routes = (edition: "RETAIL" | null, has: (p: string) => boolean) => buildMenu(edition, has, items).flatMap((g) => g.sections.flatMap((s) => s.items.map((i) => i.route)));
    expect(routes(null, none)).toEqual(["/a", "/c", "/d"]);
    expect(routes(null, all)).toEqual(["/a", "/b", "/c", "/d"]);
    expect(routes("RETAIL", all)).toEqual(["/a", "/b", "/c"]);
  });

  it("groups Masters items under their sections", () => {
    const masters = buildMenu(null, all).find((g) => g.name === "Masters");
    expect(masters?.sections.map((s) => s.name)).toEqual(["Inventory masters", "Party masters", "Accounts masters"]);
  });

  it("never opens an unbuilt screen", () => {
    expect(canOpen(item({ live: false, permission: "all" }), all)).toBe(false);
    expect(canOpen(item({ live: true, permission: "x.y.view" }), none)).toBe(false);
    expect(canOpen(item({ live: true, permission: "all" }), none)).toBe(true);
  });

  it("finds the one item that owns a page", () => {
    expect(locate("/dashboard/")?.label).toBe("Home dashboard");
    expect(locate("/dashboard/retail/")?.label).toBe("Retail dashboard");
    expect(locate("/admin/users/")?.label).toBe("Users & Roles");
    expect(locate("/admin/roles/")?.label).toBe("Users & Roles");
    expect(locate("/admin/")?.label).toBe("Settings Home");
    expect(locate("/sales/invoices/123")?.label).toBe("Sales Invoices");
    expect(locate("/onboarding/")).toBeNull();
  });

  it("maps G go-to keys from the Shortcut column", () => {
    const keys = goToKeys();
    expect(keys.get("h")?.route).toBe("/dashboard");
    expect(keys.get(",")?.route).toBe("/admin");
    expect(keys.get("p")?.route).toBe("/sales/pos");
  });
});

describe("shortcuts", () => {
  it("ignores keys typed into fields", () => {
    const el = (tagName: string, role: string | null = null) => ({ tagName, isContentEditable: false, getAttribute: () => role }) as unknown as EventTarget;
    expect(isTyping(el("INPUT"))).toBe(true);
    expect(isTyping(el("DIV", "combobox"))).toBe(true);
    expect(isTyping(el("BUTTON"))).toBe(false);
    expect(isTyping(null)).toBe(false);
  });
});
