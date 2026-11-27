import type { StaffUser, UserAdminOptions } from "@meno/api-client";
import type { Tint } from "@meno/ui";

type Roles = NonNullable<UserAdminOptions["roles"]>;

/** Role codes whose holders see every branch; from the API (role.all_branches), never a hard-coded list. */
export const allBranchRoleCodes = (roles: Roles | undefined): string[] => (roles ?? []).filter((r) => r.allBranches).map((r) => r.code ?? "");

/** True when one of `roleCodes` covers every branch, so the person needs no branch list. */
export const coversAllBranches = (roleCodes: readonly string[], roles: Roles | undefined): boolean =>
  roleCodes.some((c) => allBranchRoleCodes(roles).includes(c));

/** Roles the person holds that can't be granted or removed on this page (Business owner and the like). */
export function lockedRoles(user: StaffUser, roles: Roles | undefined): { code: string; label: string }[] {
  const assignable = new Set((roles ?? []).filter((r) => r.assignable).map((r) => r.code));
  return (user.roles ?? []).filter((r) => !assignable.has(r.code)).map((r) => ({ code: r.code ?? "", label: r.label ?? r.code ?? "" }));
}

/** "All branches" for every-branch people, otherwise the branch names. */
export const branchSummary = (user: StaffUser): string =>
  user.allBranches ? "All branches" : (user.branches ?? []).map((b) => b.name).join(", ") || "No branch yet";

/** Status in words with its tint: never colour alone (DESIGN_LANGUAGE §4). */
export const userStatus = (status: StaffUser["status"]): { label: string; tint: Tint } =>
  status === "DISABLED" ? { label: "Deactivated", tint: "slate" } : { label: "Active", tint: "green" };

/** Mobile as people read it: +91 98765 43210. */
export function formatMobile(e164: string | undefined): string {
  if (!e164) return "";
  const m = /^\+91(\d{5})(\d{5})$/.exec(e164);
  return m ? `+91 ${m[1]} ${m[2]}` : e164;
}
