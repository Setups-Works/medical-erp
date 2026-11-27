import { expect, type Page } from "@playwright/test";

/** Test owner; fake data only (AGENTS.md §9: never real customer data). */
export const OWNER = {
  name: "Test Owner",
  mobile: "9876543210",
  email: "owner@e2e.test",
  password: "e2e-pass-12345",
  business: "E2E Medicals",
  state: "Tamil Nadu",
};

/** Signs up through the real form, the way an owner does (ONBOARDING.md step 1). Ends on /verify. */
export async function signUpThroughForm(page: Page, owner = OWNER) {
  await page.goto("/signup/");
  await page.getByLabel("Your name").fill(owner.name);
  await page.getByLabel("Mobile").fill(owner.mobile);
  await page.getByLabel("Email").fill(owner.email);
  await page.getByLabel(/^Password/).fill(owner.password);
  await page.getByLabel("Business name").fill(owner.business);
  await page.getByRole("combobox", { name: "State" }).click();
  await page.getByRole("option", { name: owner.state }).click();
  await page.getByRole("radio").first().click();
  await page.getByRole("checkbox").check();
  await page.getByTestId("signup-submit").click();
  await expect(page).toHaveURL(/\/verify\/$/);
}

export async function signIn(page: Page, identifier: string, password = OWNER.password) {
  await page.goto("/login/");
  await page.getByTestId("login-identifier").fill(identifier);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-password").press("Enter");
}

/** Sign out from the app shell's user menu (top bar). `everywhere` = "Sign out of all devices". */
export async function signOut(page: Page, everywhere = false) {
  await page.getByTestId("user-menu").click();
  await page.getByTestId(everywhere ? "sign-out-all" : "sign-out").click();
}
