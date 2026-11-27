import { expect, test } from "@playwright/test";
import { signUpThroughForm } from "./fixtures";

// NAV-01: app sidebar from NAVIGATION.md, permission-aware, collapsible, remembers open groups.
test.describe("app shell", () => {
  test.beforeEach(async ({ page }) => {
    await signUpThroughForm(page);
    await page.goto("/dashboard/");
    await expect(page.getByTestId("dashboard")).toBeVisible();
  });

  test("shows the menu, opens built screens and marks the rest as soon", async ({ page, isMobile }) => {
    test.skip(isMobile, "phone layout has its own test");
    const menu = page.getByRole("navigation", { name: "Main" });
    await expect(menu.getByRole("link", { name: /Home dashboard/ })).toHaveAttribute("aria-current", "page");

    await menu.getByRole("button", { name: "Administration" }).click();
    await menu.getByRole("link", { name: "Users & Roles" }).click();
    await expect(page).toHaveURL(/\/admin\/users\/$/);
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Users & Roles");

    await menu.getByRole("button", { name: "Sales" }).click();
    await expect(menu.locator("[aria-disabled=true]", { hasText: "POS Billing" })).toContainText("Soon");
    await expect(menu.getByRole("link", { name: "POS Billing" })).toHaveCount(0);
  });

  test("remembers open groups and the collapsed rail across reloads", async ({ page, isMobile }) => {
    test.skip(isMobile, "the rail is for counter PCs");
    const menu = page.getByRole("navigation", { name: "Main" });
    await menu.getByRole("button", { name: "Finance" }).click();
    await page.reload();
    await expect(menu.getByRole("button", { name: "Finance" })).toHaveAttribute("aria-expanded", "true");

    await page.getByTestId("sidebar-toggle").click();
    await expect(page.getByTestId("sidebar")).toHaveAttribute("data-state", "rail");
    await page.reload();
    await expect(page.getByTestId("sidebar")).toHaveAttribute("data-state", "rail");
    await menu.getByRole("button", { name: "Inventory" }).click();
    await expect(page.getByTestId("sidebar")).toHaveAttribute("data-state", "open");
  });

  test("G then H goes home", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard shortcuts are for counter PCs");
    await page.goto("/admin/users/");
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Users & Roles");
    await page.keyboard.press("g");
    await page.keyboard.press("h");
    await expect(page).toHaveURL(/\/dashboard\/$/);
  });

  test("on a phone the menu opens from the top bar and closes after a choice", async ({ page, isMobile }) => {
    test.skip(!isMobile, "phone only");
    await expect(page.getByTestId("sidebar")).toBeHidden();
    await page.getByTestId("menu-button").click();
    const menu = page.getByRole("navigation", { name: "Main" });
    await menu.getByRole("button", { name: "Administration" }).click();
    await menu.getByRole("link", { name: "Users & Roles" }).click();
    await expect(page).toHaveURL(/\/admin\/users\/$/);
    await expect(page.getByTestId("sidebar")).toBeHidden();
  });
});
