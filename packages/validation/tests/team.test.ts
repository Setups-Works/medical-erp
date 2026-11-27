import { describe, expect, it } from "vitest";
import { teamInvite } from "../src/team";

const BRANCH = "0192f3a4-5b6c-7d8e-9f01-23456789abcd";
const base = { fullName: "Asha", email: "", mobile: "", roleCode: "PHARMACIST", branchIds: [BRANCH] };

describe("teamInvite", () => {
  it("accepts an email invite and lower-cases the email", () => {
    const r = teamInvite({ smsAvailable: false }).parse({ ...base, email: " Asha@Shop.Test " });
    expect(r.email).toBe("asha@shop.test");
    expect(r.mobile).toBeUndefined();
  });

  it("needs an email or a mobile", () => {
    const r = teamInvite({ smsAvailable: true }).safeParse(base);
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(["email"]);
  });

  it("needs an email while SMS is not set up, and allows mobile-only once it is", () => {
    const mobileOnly = { ...base, mobile: "+91 98765-43210" };
    expect(teamInvite({ smsAvailable: false }).safeParse(mobileOnly).success).toBe(false);
    expect(teamInvite({ smsAvailable: true }).parse(mobileOnly).mobile).toBe("9876543210");
  });

  it("needs a role and at least one branch", () => {
    const r = teamInvite({ smsAvailable: false }).safeParse({ ...base, email: "a@b.test", roleCode: "", branchIds: [] });
    expect(r.success).toBe(false);
    expect(r.error?.issues.map((i) => i.path[0])).toEqual(expect.arrayContaining(["roleCode", "branchIds"]));
  });

  it("rejects a mobile that isn't 10 digits starting 6-9", () => {
    expect(teamInvite({ smsAvailable: true }).safeParse({ ...base, mobile: "12345" }).success).toBe(false);
  });
});
