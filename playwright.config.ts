import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  globalSetup: "./tests/e2e/globalSetup.ts",
  testDir: "./tests/e2e/specs",
  outputDir: "tests/e2e/artifacts",
  reporter: [["html", { outputFolder: "tests/e2e/reports/playwright-report", open: "always" }], ["list"]],
  /* Maximum time one test can run for. */
  timeout: 15000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 8000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 4, // Kjører 4 tester parallelt (hver test har sin egen dedikerte sak)
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3333",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Capture screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video */
    video: "on", // Ta opp alle tester
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        navigationTimeout: 8000,
        actionTimeout: 4000,
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "node generate-local-config.mjs .local.env && npx vite --port 3333",
    url: "http://localhost:3333",
    reuseExistingServer: false, // Alltid start en ny server for e2e-tester
    timeout: 120 * 1000, // 2 minutes to allow for slow startup
  },
});
