import type { Tint } from "@meno/ui";

type RoleFlags = { custom?: boolean; customised?: boolean; locked?: boolean };

/** Where a role comes from and whether it was changed, in words (never colour alone, DESIGN_LANGUAGE §4). */
export function roleBadges(r: RoleFlags): { label: string; tint: Tint }[] {
  if (r.locked) return [{ label: "Every permission", tint: "slate" }];
  if (r.custom) return [{ label: "Your role", tint: "violet" }];
  return r.customised ? [{ label: "MENO default", tint: "slate" }, { label: "Changed", tint: "amber" }] : [{ label: "MENO default", tint: "slate" }];
}

/** "3 people", "1 person · 1 deactivated", "Nobody yet". */
export function peopleCount(active = 0, total = 0): string {
  if (total === 0) return "Nobody yet";
  const base = `${active} ${active === 1 ? "person" : "people"}`;
  const inactive = total - active;
  return inactive > 0 ? `${base} · ${inactive} deactivated` : base;
}

/** Adds or removes `code`, keeping the list sorted so dirty checks compare like with like. */
export function toggle(list: readonly string[], code: string, on: boolean): string[] {
  const next = new Set(list);
  if (on) next.add(code);
  else next.delete(code);
  return [...next].sort();
}

/** True when two permission lists hold the same codes. */
export const sameSet = (a: readonly string[], b: readonly string[]): boolean => a.length === b.length && a.every((c) => b.includes(c));
