import { defineConfig, devices } from "@playwright/test";

/**
 * E2E smoke (TEST_STRATEGY.md "E2E UI"): the web app runs against the local MSW mocks, so no backend or database
 * is needed and nothing touches staging. API behaviour itself is covered by meno-api's integration tests.
 * Mock data lives in sessionStorage, so every test starts with a clean, empty pharmacy.
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "counter-pc", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `pnpm exec msw init public --save=false && pnpm exec next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/login/`,
    env: { NEXT_PUBLIC_API_MOCKING: "all", NEXT_DIST_DIR: ".next-e2e" }, // own build folder: never mixes with `pnpm dev`
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
