import { expect, test } from "@playwright/test";
import { OWNER, signIn, signOut, signUpThroughForm } from "./fixtures";

// PLT-01 / AUT-04 sign-up, PLT-08 sign in with email or mobile + logout from all devices.
test.describe("auth", () => {
  test("owner signs up, signs out, and signs back in with email or mobile", async ({ page }) => {
    await signUpThroughForm(page);
    await page.goto("/dashboard/");
    await signOut(page);
    await expect(page).toHaveURL(/\/login\/$/);

    await signIn(page, OWNER.email.toUpperCase());
    await expect(page).toHaveURL(/\/onboarding\//);

    await page.goto("/dashboard/");
    await signOut(page);
    await signIn(page, "+91 98765 43210");
    await expect(page).toHaveURL(/\/onboarding\//);
  });

  test("wrong password and a malformed identifier show friendly errors", async ({ page }) => {
    await signUpThroughForm(page);
    await page.goto("/dashboard/");
    await signOut(page);

    await signIn(page, "12345");
    await expect(page.getByText("10-digit mobile number")).toBeVisible();

    await signIn(page, OWNER.mobile, "not-the-password");
    await expect(page.getByText("Email, mobile or password is wrong.")).toBeVisible();
    await expect(page).toHaveURL(/\/login\/$/);
  });

  test("the same mobile can't open a second account", async ({ page }) => {
    await signUpThroughForm(page);
    await page.goto("/dashboard/");
    await signOut(page);

    await page.goto("/signup/");
    await page.getByLabel("Your name").fill("Second Owner");
    await page.getByLabel("Mobile").fill(OWNER.mobile);
    await page.getByLabel("Email").fill("second@e2e.test");
    await page.getByLabel(/^Password/).fill(OWNER.password);
    await page.getByLabel("Business name").fill("Second Medicals");
    await page.getByRole("combobox", { name: "State" }).click();
    await page.getByRole("option", { name: OWNER.state }).click();
    await page.getByRole("radio").first().click();
    await page.getByRole("checkbox").check();
    await page.getByTestId("signup-submit").click();
    await expect(page.getByText("An account with this mobile number already exists.")).toBeVisible();
  });

  test("sign out of all devices ends the session", async ({ page }) => {
    await signUpThroughForm(page);
    await page.goto("/dashboard/");
    await signOut(page, true);
    await expect(page).toHaveURL(/\/login\/$/);

    await page.goto("/dashboard/");
    await expect(page).toHaveURL(/\/login\/\?next=/);
  });

  test("forgot password always answers the same way", async ({ page }) => {
    await page.goto("/forgot-password/");
    await page.getByLabel("Email").fill("nobody@e2e.test");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText("Check your email")).toBeVisible();
  });
});
