import { expect, test } from "@playwright/test";

/**
 * /platform/reference-data (PLT-22) on the MSW mocks: MENO staff sign in, load a PIN code file, see a refused file
 * in the history, and are sent back to sign in after a reload (staff sessions are memory only). Fake data only.
 */
const PINS = "OfficeName,Pincode,District,StateName\nAnna Nagar S.O,600040,CHENNAI,TAMIL NADU\nConnaught Place H.O,110001,NEW DELHI,DELHI\n";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/platform/reference-data/");
  await expect(page).toHaveURL(/\/platform\/login\/\?next=/);
  await page.getByTestId("platform-login-email").fill("admin@meno.test");
  await page.getByTestId("platform-login-password").fill("platform-pass-12");
  await page.getByTestId("platform-login-submit").click();
  await expect(page).toHaveURL(/\/platform\/reference-data\/$/);
}

test.describe("platform reference data", () => {
  test("wrong password is refused", async ({ page }) => {
    await page.goto("/platform/login/");
    await page.getByTestId("platform-login-email").fill("admin@meno.test");
    await page.getByTestId("platform-login-password").fill("nope");
    await page.getByTestId("platform-login-submit").click();
    await expect(page.getByText("Email or password is wrong.")).toBeVisible();
  });

  test("staff pages use the app sidebar with the platform menu", async ({ page, isMobile }) => {
    await signIn(page);
    if (isMobile) await page.getByTestId("menu-button").click();
    const menu = page.getByRole("navigation", { name: "Main" });
    await menu.getByRole("button", { name: "Operations" }).click();
    await expect(menu.getByRole("link", { name: "Reference data" })).toHaveAttribute("aria-current", "page");
    await menu.getByRole("button", { name: "Customers" }).click();
    await expect(menu.locator("[aria-disabled=true]", { hasText: "License console" })).toContainText("Soon");
    if (isMobile) await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Reference data");
    await page.getByTestId("platform-account").click();
    await expect(page.getByTestId("platform-staff-name")).toHaveText("MENO Admin");
    await page.getByTestId("platform-sign-out").click();
    await expect(page).toHaveURL(/\/platform\/login\//);
  });

  test("staff load a PIN code file, a bad file is refused, and a reload asks to sign in again", async ({ page }) => {
    await signIn(page);
    const pin = page.getByTestId("dataset-PINCODE");
    await expect(pin.getByText("Not loaded")).toBeVisible();
    await expect(page.getByTestId("dataset-HSN").getByText("Later · P3")).toBeVisible();
    await expect(page.getByTestId("load-HSN")).toHaveCount(0);

    // A file without the state column is refused and recorded.
    await pin.getByTestId("load-PINCODE").click();
    await pin.getByTestId("load-file-PINCODE").setInputFiles({ name: "bad.csv", mimeType: "text/csv", buffer: Buffer.from("Pincode,District\n600040,CHENNAI\n") });
    await pin.getByLabel(/File dated/).click();
    // The 1st of this month: always on or before today (leading days from last month are 23rd onwards).
    await page.getByRole("button", { name: /^1 [A-Z][a-z]+ \d{4}$/ }).first().click();
    await pin.getByTestId("load-submit-PINCODE").click();
    await expect(pin.getByText(/The file has no statename column/)).toBeVisible();

    await pin.getByTestId("load-file-PINCODE").setInputFiles({ name: "pincodes.csv", mimeType: "text/csv", buffer: Buffer.from(PINS) });
    await pin.getByTestId("load-submit-PINCODE").click();
    await expect(pin.getByTestId("loaded-PINCODE")).toContainText("Loaded 2 rows from pincodes.csv");
    await expect(pin.getByText("Up to date")).toBeVisible();
    const history = pin.getByTestId("history-list-PINCODE");
    await expect(history.getByText("Loaded", { exact: true })).toBeVisible();
    await expect(history.getByText("Refused", { exact: true })).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/platform\/login\//);
  });
});
