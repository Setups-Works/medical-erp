import { describe, expect, it } from "vitest";
import { peopleCount, roleBadges, sameSet, toggle } from "@/features/admin/utils";

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
