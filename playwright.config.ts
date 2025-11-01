import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
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
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1, // Kjører alle tester i serie
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Capture screenshot on failure */
    screenshot: "only-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "1-ny-sak",
      use: {
        ...devices["Desktop Chrome"],
        navigationTimeout: 8000,
        actionTimeout: 4000,
      },
      testMatch: ["tests/e2e/specs/opprett-ny-sak/ny-sak/**/*.spec.ts"],
    },
    {
      name: "2-andre-opprett-sak-tester",
      use: {
        ...devices["Desktop Chrome"],
        navigationTimeout: 8000,
        actionTimeout: 4000,
      },
      testMatch: ["tests/e2e/specs/opprett-ny-sak/**/*.spec.ts"],
      testIgnore: [
        "tests/e2e/specs/opprett-ny-sak/ny-sak/**/*.spec.ts",
        "tests/e2e/specs/opprett-ny-sak/knytt-til-eksisterende/**/*.spec.ts",
      ],
    },
    {
      name: "3-knytt-til-eksisterende",
      use: {
        ...devices["Desktop Chrome"],
        navigationTimeout: 8000,
        actionTimeout: 4000,
      },
      testMatch: ["tests/e2e/specs/opprett-ny-sak/knytt-til-eksisterende/**/*.spec.ts"],
    },
    {
      name: "4-behandle-sak",
      use: {
        ...devices["Desktop Chrome"],
        navigationTimeout: 8000,
        actionTimeout: 4000,
      },
      testMatch: ["tests/e2e/specs/behandle-sak/**/*.spec.ts", "tests/e2e/specs/avslutt-behandling/**/*.spec.ts"],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes to allow for slow startup
  },
});
