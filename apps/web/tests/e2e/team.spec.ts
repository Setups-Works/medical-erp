import { expect, test, type Page } from "@playwright/test";
import { signUpThroughForm } from "./fixtures";

/**
 * /onboarding/team (AUT-09) keyboard-only pass on the MSW mocks: invite a person without the mouse, then walk the
 * inline revoke confirm and check focus never falls back to <body>. Branches are seeded because the branch step
 * is its own page. Fake data only.
 */
async function seedBranches(page: Page) {
  await page.evaluate(() => {
    const key = "meno.mock-db.v1";
    const s = JSON.parse(sessionStorage.getItem(key) ?? "{}");
    const tenant = s.tenants[s.users[0].tenantId];
    tenant.branches = [{ id: crypto.randomUUID(), headOffice: true, details: { name: "Main shop", code: "HO" } }];
    sessionStorage.setItem(key, JSON.stringify(s));
  });
}

test.describe("team step", () => {
  test("invite and revoke with the keyboard only", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "phone", "keyboard-only pass is for the counter PC");
    await signUpThroughForm(page);
    await seedBranches(page);
    await page.goto("/onboarding/team/");

    const form = page.getByTestId("invite-form");
    await expect(form).toBeVisible();
    await form.getByLabel("Full name").focus();
    await page.keyboard.type("Priya Pharmacist");
    await page.keyboard.press("Tab");
    await page.keyboard.type("priya@e2e.test");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(form.getByRole("combobox")).toBeFocused();
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(form.getByRole("combobox")).not.toHaveText(/Choose a role/);
    await expect(page.getByRole("listbox")).toBeHidden();
    await page.keyboard.press("Tab");
    // With a single branch it comes pre-ticked; Space would untick it, so only check focus reached it.
    await expect(form.getByRole("checkbox")).toBeFocused();
    await expect(form.getByRole("checkbox")).toBeChecked();
    await page.keyboard.press("Enter");

    const list = page.getByTestId("invitation-list");
    await expect(list.getByText("Priya Pharmacist")).toBeVisible();

    const revoke = list.getByRole("button", { name: "Revoke Priya Pharmacist's invitation" });
    await revoke.focus();
    await page.keyboard.press("Enter");
    // Asking lands on the safe choice; Escape backs out to where the user was.
    await expect(list.getByRole("button", { name: "Keep" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(revoke).toBeFocused();

    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await expect(list.getByRole("button", { name: "Confirm revoking Priya Pharmacist's invitation" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(list.getByText("Revoked")).toBeVisible();
  });
});
