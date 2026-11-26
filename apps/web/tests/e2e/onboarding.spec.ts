import { expect, test } from "@playwright/test";
import { signUpThroughForm } from "./fixtures";

// PLT-01 / AUT-03 / AUT-05: a new owner lands on the checklist and can save the first step.
test.describe("onboarding", () => {
  test("checklist lists the steps and the business step saves", async ({ page }) => {
    await signUpThroughForm(page);
    await page.getByTestId("verify-continue").click();
    await expect(page).toHaveURL(/\/onboarding\/$/);
    await expect(page.getByTestId("checklist-step-BUSINESS")).toBeVisible();

    await page.getByTestId("checklist-resume").click();
    await expect(page).toHaveURL(/\/onboarding\/business\/$/);
    await page.getByRole("radiogroup", { name: "Type of business" }).getByRole("radio").first().click();
    await page.getByRole("radiogroup", { name: "How many shops" }).getByRole("radio").first().click();
    await page.getByRole("radiogroup", { name: "Catalogue size" }).getByRole("radio").first().click();
    await page.getByRole("combobox").first().click();
    await page.getByRole("option").first().click();
    await page.getByRole("combobox").nth(1).click();
    await page.getByRole("option").first().click();
    await page.getByRole("button", { name: "Save and continue" }).click();

    await expect(page).toHaveURL(/\/onboarding\/pharmacy\/$/);
  });
});
