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

    // PLT-22 / ADR-0021: a known PIN fills the empty district and offers its post offices as cities.
    await page.getByLabel("PIN code").fill("600001");
    await expect(page.getByTestId("pin-lookup")).toContainText("PIN 600001: Chennai");
    await expect(page.getByLabel("District")).toHaveValue("Chennai");
    // City is a dropdown of that PIN's post offices, and still takes any typed value.
    const city = page.getByRole("combobox", { name: "City" });
    await city.click();
    await expect(page.getByRole("option")).toHaveText(["Parrys", "George Town", "Chennai"]);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(city).toHaveValue("George Town");
    await city.fill("Royapuram");
    await expect(city).toHaveValue("Royapuram");
    // An unknown PIN never blocks: it asks the person to type the details.
    await page.getByLabel("PIN code").fill("560999");
    await expect(page.getByTestId("pin-lookup")).toContainText("We don’t know this PIN");
  });
});
