import { describe, expect, it } from "vitest";
import { formatFinancialYear, formatMoney } from "../src/format";

describe("formatMoney", () => {
  it.each([
    ["0", "₹0.00"],
    ["123456.5000", "₹1,23,456.50"],
    ["12345678.0049", "₹1,23,45,678.00"],
    ["999.995", "₹1,000.00"],
    ["-120", "−₹120.00"],
    ["7999.0000", "₹7,999.00"],
  ])("%s → %s", (input, expected) => {
    expect(formatMoney(input)).toBe(expected);
  });
});

describe("formatFinancialYear", () => {
  it("labels April–March years", () => {
    expect(formatFinancialYear("2026-04-01", "2027-03-31")).toBe("FY 2026-27");
  });
});
