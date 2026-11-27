import { describe, expect, it } from "vitest";
import { platformLogin, referenceLoad } from "../src/platform";

const csv = (name = "pincode.csv", text = "Pincode\n600001\n") => new File([text], name, { type: "text/csv" });

describe("platformLogin", () => {
  it("lower-cases the email and needs a password", () => {
    expect(platformLogin.parse({ email: " Admin@Meno.Test ", password: "x" }).email).toBe("admin@meno.test");
    expect(platformLogin.safeParse({ email: "admin@meno.test", password: "" }).success).toBe(false);
  });
});

describe("referenceLoad", () => {
  const schema = referenceLoad({ today: "2026-11-27" });

  it("accepts a CSV with a date up to today", () => {
    expect(schema.safeParse({ file: csv(), sourceDate: "2026-11-27", replaceAnyway: false }).success).toBe(true);
  });

  it("needs a file, a .csv one, not empty", () => {
    const issues = (file: File | null) => schema.safeParse({ file, sourceDate: "2026-11-01", replaceAnyway: false }).error?.issues[0]?.message;
    expect(issues(null)).toBe("Choose a CSV file.");
    expect(issues(csv("list.xlsx"))).toBe("Upload the list as a .csv file.");
    expect(issues(csv("list.csv", ""))).toBe("The file is empty.");
  });

  it("refuses a future or missing date", () => {
    const r = schema.safeParse({ file: csv(), sourceDate: "2026-11-28", replaceAnyway: false });
    expect(r.error?.issues[0]?.message).toBe("The file's date can't be in the future.");
    expect(schema.safeParse({ file: csv(), sourceDate: "", replaceAnyway: false }).success).toBe(false);
  });
});
