import { describe, expect, it } from "vitest";
import type { StaffUser, UserAdminOptions } from "@meno/api-client";
import { allBranchRoleCodes, branchSummary, coversAllBranches, formatMobile, lockedRoles, userStatus } from "@/features/users/utils";

const roles: UserAdminOptions["roles"] = [
  { code: "OWNER", label: "Business owner", assignable: false, allBranches: true },
  { code: "PHARMACIST", label: "Pharmacist", assignable: true, allBranches: false },
];
const user = (over: Partial<StaffUser> = {}): StaffUser => ({ id: "u1", fullName: "Asha", email: "a@x.test", status: "ACTIVE", roles: [], branches: [], allBranches: false, version: 0, ...over });

describe("users utils", () => {
  it("reads every-branch roles from the API options", () => {
    expect(allBranchRoleCodes(roles)).toEqual(["OWNER"]);
    expect(coversAllBranches(["PHARMACIST"], roles)).toBe(false);
    expect(coversAllBranches(["PHARMACIST", "OWNER"], roles)).toBe(true);
  });

  it("lists held roles that can't be changed here", () => {
    const u = user({ roles: [{ code: "OWNER", label: "Business owner" }, { code: "PHARMACIST", label: "Pharmacist" }] });
    expect(lockedRoles(u, roles)).toEqual([{ code: "OWNER", label: "Business owner" }]);
  });

  it("summarises branches and status in words", () => {
    expect(branchSummary(user({ allBranches: true }))).toBe("All branches");
    expect(branchSummary(user({ branches: [{ id: "b1", name: "Main shop" }, { id: "b2", name: "Annex" }] }))).toBe("Main shop, Annex");
    expect(branchSummary(user())).toBe("No branch yet");
    expect(userStatus("DISABLED").label).toBe("Deactivated");
    expect(userStatus("ACTIVE").label).toBe("Active");
  });

  it("formats an Indian mobile for reading", () => {
    expect(formatMobile("+919876543210")).toBe("+91 98765 43210");
    expect(formatMobile(undefined)).toBe("");
  });
});
