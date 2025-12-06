import { defineConfig, devices } from "@playwright/test";
import path from "path";

/**
 * E2E Test Mode Configuration
 *
 * E2E_MODE environment variable controls test behavior:
 * - live (default): Run against real melosys-api
 * - record: Run against real API and record all responses
 * - playback: Run against mock server with recorded responses
 */
type TestMode = "live" | "record" | "playback";
const E2E_MODE = (process.env.E2E_MODE?.toLowerCase() || "live") as TestMode;

/**
 * Get context options based on mode.
 * In record mode, enable HAR recording for API calls.
 */
function getContextOptions() {
  if (E2E_MODE === "record") {
    const harPath = path.join(process.cwd(), "tests/e2e/recordings/har/api-recording.har");
    // eslint-disable-next-line no-console
    console.log(`[Playwright] HAR path: ${harPath}`);
    return {
      recordHar: {
        path: harPath,
        urlFilter: "**/api/**",
      },
    };
  }
  return {};
}

/**
 * Get webServer configuration based on mode.
 */
function getWebServerConfig() {
  if (E2E_MODE === "playback") {
    // In playback mode, start both the mock server and the frontend
    return [
      {
        // Start mock API server
        command: "cd tests/e2e/mock-server && npm start",
        url: "http://localhost:8080/health",
        reuseExistingServer: !process.env.CI, // Always start fresh in CI
        timeout: 30 * 1000,
        stdout: "pipe",
        stderr: "pipe",
      },
      {
        // Start frontend (Vite)
        command: "node generate-local-config.mjs .local.env && npx vite --port 3333",
        url: "http://localhost:3333",
        reuseExistingServer: false,
        timeout: 120 * 1000,
        stdout: "pipe",
        stderr: "pipe",
      },
    ];
  }

  // For live and record modes, just start the frontend
  return {
    command: "node generate-local-config.mjs .local.env && npx vite --port 3333",
    url: "http://localhost:3333",
    reuseExistingServer: false,
    timeout: 120 * 1000,
  };
}

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

    /* Context options (includes HAR recording in record mode) */
    ...getContextOptions(),
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
  webServer: getWebServerConfig(),
});

// Log current mode and config
// eslint-disable-next-line no-console
console.log(`[Playwright] E2E_MODE: ${E2E_MODE}`);
if (E2E_MODE === "record") {
  // eslint-disable-next-line no-console
  console.log(`[Playwright] HAR recording ENABLED - files will be saved to tests/e2e/recordings/har/`);
}
