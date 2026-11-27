import { describe, expect, it } from "vitest";
import { cadence, count, fileSize, indiaToday, statusOf } from "@/features/platform/utils";

describe("platform utils", () => {
  it("writes the refresh cadence in words", () => {
    expect(cadence(1)).toBe("Every month");
    expect(cadence(3)).toBe("Every 3 months");
    expect(cadence(12)).toBe("Every year");
    expect(cadence(24)).toBe("Every 2 years");
  });

  it("labels every status in words and falls back to Not loaded", () => {
    expect(statusOf("DUE").label).toBe("Refresh due");
    expect(statusOf("LATER").tint).toBe("slate");
    expect(statusOf(undefined).label).toBe("Not loaded");
    expect(statusOf("SOMETHING_NEW").label).toBe("Not loaded");
  });

  it("formats sizes and Indian digit grouping", () => {
    expect(fileSize(512)).toBe("512 B");
    expect(fileSize(12_400_000)).toBe("11.8 MB");
    expect(count(154823)).toBe("1,54,823");
  });

  it("takes today in India, not UTC", () => {
    // 20:00 UTC on 27 Nov is already 28 Nov in India (UTC+5:30).
    expect(indiaToday(new Date("2026-11-27T20:00:00Z"))).toBe("2026-11-28");
  });
});
