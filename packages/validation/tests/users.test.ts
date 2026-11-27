import { describe, expect, it } from "vitest";
import { userAccess } from "../src/users";

const BRANCH = "0192f3a4-5b6c-7d8e-9f01-23456789abcd";
const schema = userAccess({ allBranchRoles: ["OWNER"] });

describe("userAccess", () => {
  it("accepts a role with a branch", () => {
    expect(schema.safeParse({ roleCodes: ["PHARMACIST"], branchIds: [BRANCH] }).success).toBe(true);
  });

  it("needs at least one role", () => {
    const r = schema.safeParse({ roleCodes: [], branchIds: [BRANCH] });
    expect(r.error?.issues[0]?.path).toEqual(["roleCodes"]);
  });

  it("needs a branch unless a role covers every branch", () => {
    expect(schema.safeParse({ roleCodes: ["PHARMACIST"], branchIds: [] }).error?.issues[0]?.path).toEqual(["branchIds"]);
    expect(schema.safeParse({ roleCodes: ["OWNER", "PHARMACIST"], branchIds: [] }).success).toBe(true);
  });

  it("rejects ids that aren't UUIDs", () => {
    expect(schema.safeParse({ roleCodes: ["PHARMACIST"], branchIds: ["HO"] }).success).toBe(false);
  });
});
