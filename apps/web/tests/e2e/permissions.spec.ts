import { expect, test } from "@playwright/test";
import { signUpThroughForm } from "./fixtures";

/** /admin/permissions happy path (PLT-07) on the MSW mocks: tick and untick one cell; the owner column is locked. */
test.describe("permission management", () => {
  test("owner gives a role one permission and takes it back", async ({ page }) => {
    await signUpThroughForm(page);
    await page.goto("/admin/permissions/");

    const matrix = page.getByTestId("permission-matrix");
    await expect(matrix.getByRole("checkbox", { name: "Business owner: Create customers" })).toBeDisabled();
    await expect(matrix.getByRole("checkbox", { name: "Business owner: Create customers" })).toBeChecked();

    const cell = matrix.getByRole("checkbox", { name: "Pharmacist: Create customers" });
    // Not optimistic: the box ticks once the API has saved it.
    await cell.click();
    await expect(cell).toBeChecked();
    await expect(cell).toBeEnabled();
    await page.goto("/admin/roles/");
    await expect(page.getByTestId("role-list").getByRole("button", { name: /Pharmacist/ }).getByText("Changed")).toBeVisible();

    await page.goto("/admin/permissions/");
    await expect(matrix.getByRole("checkbox", { name: "Pharmacist: Create customers" })).toBeChecked();
    await matrix.getByRole("checkbox", { name: "Pharmacist: Create customers" }).click();
    await expect(matrix.getByRole("checkbox", { name: "Pharmacist: Create customers" })).not.toBeChecked();
  });

  test("search narrows the rows", async ({ page }) => {
    await signUpThroughForm(page);
    await page.goto("/admin/permissions/");
    await page.getByLabel("Search permissions").fill("supplier");
    const matrix = page.getByTestId("permission-matrix");
    await expect(matrix.getByText("Create suppliers")).toBeVisible();
    await expect(matrix.getByText("Create customers")).toBeHidden();
  });
});
