import { expect, test } from "@playwright/test";
import { signUpThroughForm } from "./fixtures";

/** /admin/roles happy path (PLT-07) on the MSW mocks: create, change permissions, reset a default, remove. */
test.describe("role management", () => {
  test("owner creates a role, changes its permissions and removes it", async ({ page }) => {
    await signUpThroughForm(page);
    await page.goto("/admin/roles/");

    const list = page.getByTestId("role-list");
    await expect(list.getByText("Business owner")).toBeVisible();
    await page.getByTestId("role-new").click();
    const form = page.getByTestId("role-new-form");
    await form.getByLabel("Name").fill("Night pharmacist");
    await page.getByTestId("role-create").click();

    const editor = page.getByTestId("role-editor");
    await expect(editor.getByRole("heading", { name: /Night pharmacist/ })).toBeVisible();
    await editor.getByLabel(/See staff accounts/).check();
    await page.getByTestId("role-permissions-save").click();
    await expect(editor.getByText(/^Saved\./)).toBeVisible();
    await expect(list.getByRole("button", { name: /Night pharmacist/ }).getByText(/1 permission$/)).toBeVisible();

    await page.getByTestId("role-archive").click();
    await page.getByTestId("role-archive-confirm").click();
    await expect(list.getByText("Night pharmacist")).toBeHidden();
  });

  test("a changed default role can be reset; the owner role is locked", async ({ page }) => {
    await signUpThroughForm(page);
    await page.goto("/admin/roles/");
    const list = page.getByTestId("role-list");
    await list.getByText("Business owner").click();
    await expect(page.getByTestId("role-editor").getByText(/always has every permission/)).toBeVisible();
    await expect(page.getByTestId("role-permissions-save")).toHaveCount(0);

    await list.getByText("Branch manager").click();
    const editor = page.getByTestId("role-editor");
    await editor.getByLabel(/Create customers/).check();
    await page.getByTestId("role-permissions-save").click();
    await expect(list.getByText("Changed")).toBeVisible();
    await page.getByTestId("role-reset").click();
    await page.getByTestId("role-reset-confirm").click();
    await expect(list.getByText("Changed")).toBeHidden();
  });
});
