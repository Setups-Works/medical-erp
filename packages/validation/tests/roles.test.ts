import { describe, expect, it } from "vitest";
import { roleForm } from "../src/roles";

describe("roleForm", () => {
  it("trims the name and allows an empty description", () => {
    expect(roleForm.parse({ label: "  Night pharmacist ", description: "" })).toEqual({ label: "Night pharmacist", description: "" });
  });

  it("needs a name of up to 60 characters", () => {
    expect(roleForm.safeParse({ label: "  ", description: "" }).success).toBe(false);
    expect(roleForm.safeParse({ label: "x".repeat(61), description: "" }).success).toBe(false);
  });

  it("refuses control characters and long descriptions", () => {
    expect(roleForm.safeParse({ label: "Bad\u0007name", description: "" }).success).toBe(false);
    expect(roleForm.safeParse({ label: "Ok", description: "d".repeat(301) }).success).toBe(false);
  });
});
