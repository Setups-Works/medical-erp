import { expect, test, type Page } from "@playwright/test";
import { OWNER, signUpThroughForm } from "./fixtures";

/**
 * /admin/users happy path (PLT-06) on the MSW mocks: the owner sees the staff list, changes a person's role and
 * branch, deactivates and reactivates them. Staff accounts are seeded into the mock database because accepting an
 * invitation is a separate page. Fake data only.
 */
async function seedStaff(page: Page) {
  await page.evaluate(() => {
    const key = "meno.mock-db.v1";
    const s = JSON.parse(sessionStorage.getItem(key) ?? "{}");
    const owner = s.users[0];
    const tenant = s.tenants[owner.tenantId];
    const ho = { id: crypto.randomUUID(), headOffice: true, details: { name: "Main shop", code: "HO" } };
    const annex = { id: crypto.randomUUID(), headOffice: false, details: { name: "Annex", code: "AX" } };
    tenant.branches = [ho, annex];
    s.users.push({ id: crypto.randomUUID(), tenantId: owner.tenantId, email: "priya@e2e.test", password: "x", fullName: "Priya Pharmacist", mobile: "9876500001", roles: ["PHARMACIST"], branchIds: [ho.id], version: 0, emailVerified: true, mobileVerified: true });
    sessionStorage.setItem(key, JSON.stringify(s));
  });
}

test.describe("user management", () => {
  test("owner changes a person's access, deactivates and reactivates them", async ({ page }) => {
    await signUpThroughForm(page);
    await seedStaff(page);
    await page.goto("/admin/users/");

    const list = page.getByTestId("user-list");
    await expect(list.getByText(OWNER.name)).toBeVisible();
    await list.getByText("Priya Pharmacist").click();

    const panel = page.getByTestId("user-panel");
    await expect(panel.getByRole("heading", { name: /Priya Pharmacist/ })).toBeVisible();
    await panel.getByLabel("Branch manager").check();
    await panel.getByLabel("Pharmacist").uncheck();
    await panel.getByLabel(/Annex/).check();
    await panel.getByTestId("access-save").click();
    await expect(panel.getByText(/^Saved\./)).toBeVisible();
    await expect(list.getByText("Branch manager")).toBeVisible();

    await panel.getByTestId("deactivate").click();
    await panel.getByTestId("deactivate-confirm").click();
    // Gone from the default (active) list; found under Deactivated, then brought back.
    await expect(list.getByText("Priya Pharmacist")).toBeHidden();
    await page.getByRole("radio", { name: "Deactivated" }).click();
    await list.getByText("Priya Pharmacist").click();
    await page.getByTestId("reactivate").click();
    await expect(list.getByText("Priya Pharmacist")).toBeHidden();
    await page.getByRole("radio", { name: "Active" }).click();
    await expect(list.getByText("Priya Pharmacist")).toBeVisible();
  });

  test("search finds people and / focuses it", async ({ page }) => {
    await signUpThroughForm(page);
    await seedStaff(page);
    await page.goto("/admin/users/");
    await expect(page.getByTestId("user-list").getByText("Priya Pharmacist")).toBeVisible();
    await page.keyboard.press("/");
    await page.keyboard.type("zzz");
    await expect(page.getByText("Nobody matches")).toBeVisible();
  });
});
