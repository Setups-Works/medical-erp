import { describe, expect, it } from "vitest";
import { filterCatalogue, peopleCount, roleBadges, sameSet, toggle } from "@/features/admin/utils";

describe("admin utils", () => {
  it("names where a role comes from", () => {
    expect(roleBadges({ locked: true }).map((b) => b.label)).toEqual(["Every permission"]);
    expect(roleBadges({ custom: true }).map((b) => b.label)).toEqual(["Your role"]);
    expect(roleBadges({ customised: true }).map((b) => b.label)).toEqual(["MENO default", "Changed"]);
    expect(roleBadges({}).map((b) => b.label)).toEqual(["MENO default"]);
  });

  it("counts people in words", () => {
    expect(peopleCount(0, 0)).toBe("Nobody yet");
    expect(peopleCount(1, 1)).toBe("1 person");
    expect(peopleCount(2, 3)).toBe("2 people · 1 deactivated");
  });

  it("toggles codes in a sorted list and compares sets", () => {
    expect(toggle(["b.x.y"], "a.x.y", true)).toEqual(["a.x.y", "b.x.y"]);
    expect(toggle(["a.x.y", "b.x.y"], "a.x.y", false)).toEqual(["b.x.y"]);
    expect(sameSet(["a", "b"], ["b", "a"])).toBe(true);
    expect(sameSet(["a"], ["a", "b"])).toBe(false);
  });
});

describe("filterCatalogue", () => {
  const catalogue = {
    modules: [
      { code: "identity", label: "Users and roles", permissions: [{ code: "identity.user.view", description: "See staff accounts" }] },
      { code: "party", label: "Customers and suppliers", permissions: [{ code: "party.customer.create", description: "Create customers" }] },
    ],
  };
  it("keeps everything for an empty search and drops empty modules otherwise", () => {
    expect(filterCatalogue(catalogue, " ")).toHaveLength(2);
    expect(filterCatalogue(catalogue, "CUSTOMER").map((m) => m.code)).toEqual(["party"]);
    expect(filterCatalogue(catalogue, "identity.user").map((m) => m.code)).toEqual(["identity"]);
    expect(filterCatalogue(catalogue, "nothing")).toEqual([]);
  });
});
