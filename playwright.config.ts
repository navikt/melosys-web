import { defineConfig, devices, ReporterDescription } from "@playwright/test";
import { getTestMode } from "./tests/e2e/config/mode";
import { PORTS, TIMEOUTS, PATHS, COMMANDS, CI_CONFIG, LOCAL_CONFIG } from "./tests/e2e/config/constants";

/**
 * Playwright E2E Test Configuration
 *
 * Supports three modes via E2E_MODE environment variable:
 * - live (default): Run against real melosys-api
 * - record: Run against real API and record all responses
 * - playback: Run against mock server with recorded responses
 *
 * @see https://playwright.dev/docs/test-configuration
 */

const E2E_MODE = getTestMode();
const IS_CI = !!process.env.CI;
const TIMEOUT_MULTIPLIER = IS_CI ? CI_CONFIG.TIMEOUT_MULTIPLIER : 1;
const WORKERS = IS_CI ? CI_CONFIG.WORKERS : LOCAL_CONFIG.WORKERS;

/** Apply CI timeout multiplier to a base timeout value */
function withTimeout(baseTimeout: number): number {
  return baseTimeout * TIMEOUT_MULTIPLIER;
}

/** Vite dev server configuration for live/record mode (uses real API) */
const VITE_SERVER = {
  command: COMMANDS.VITE,
  url: `http://localhost:${PORTS.VITE}`,
  reuseExistingServer: false,
  timeout: TIMEOUTS.VITE_STARTUP,
  stdout: "pipe" as const,
  stderr: "pipe" as const,
};

/** Vite dev server configuration for playback mode (uses mock API) */
const VITE_SERVER_PLAYBACK = {
  command: COMMANDS.VITE_PLAYBACK,
  url: `http://localhost:${PORTS.VITE}`,
  reuseExistingServer: false,
  timeout: TIMEOUTS.VITE_STARTUP,
  stdout: "pipe" as const,
  stderr: "pipe" as const,
};

/** Get webServer configuration based on mode */
function getWebServerConfig() {
  if (E2E_MODE === "playback") {
    return [
      {
        command: COMMANDS.MOCK_SERVER,
        url: `http://localhost:${PORTS.MOCK_API}/health`,
        reuseExistingServer: !IS_CI,
        timeout: TIMEOUTS.MOCK_SERVER_STARTUP,
        stdout: "pipe" as const,
        stderr: "pipe" as const,
      },
      VITE_SERVER_PLAYBACK,
    ];
  }
  return VITE_SERVER;
}

/** Build reporter configuration */
function getReporters(): ReporterDescription[] {
  const reporters: ReporterDescription[] = [
    ["html", { outputFolder: PATHS.REPORT_DIR, open: IS_CI ? "never" : "always" }],
    ["list"],
    [PATHS.SUMMARY_REPORTER],
  ];

  if (IS_CI) {
    reporters.push(["github"]);
  }

  return reporters;
}

/** Log configuration on startup */
function logConfiguration(): void {
  const logs = [
    `[Playwright] E2E_MODE: ${E2E_MODE}, CI: ${IS_CI}, Workers: ${WORKERS}, Timeout: ${TIMEOUT_MULTIPLIER}x`,
  ];

  if (IS_CI) {
    logs.push(
      `[Playwright] CI timeouts: navigation=${withTimeout(TIMEOUTS.NAVIGATION)}ms, test=${withTimeout(TIMEOUTS.TEST)}ms`,
    );
  }

  if (E2E_MODE === "playback") {
    logs.push("[Playwright] Playback: per-worker sequence tracking via X-Playwright-Worker-ID header");
  }

  if (E2E_MODE === "record") {
    logs.push("[Playwright] Recording: API responses → tests/e2e/recordings/");
  }

  // eslint-disable-next-line no-console
  logs.forEach((log) => console.log(log));
}

// Log on config load
logConfiguration();

export default defineConfig({
  globalSetup: PATHS.GLOBAL_SETUP,
  testDir: PATHS.TEST_DIR,
  // manuell-forhaandsvisning-filene deler saksnumre med AC-tester og kan IKKE kjøres
  // parallelt med dem. Som default ekskluderes de fra test:e2e. For å sette opp
  // saker for manuell brev-forhåndsvisning, sett PW_INCLUDE_MANUELL=1:
  //   PW_INCLUDE_MANUELL=1 pnpm exec playwright test --headed manuell-forhaandsvisning -g "25%-regel"
  testIgnore: process.env.PW_INCLUDE_MANUELL ? [] : ["**/manuell-forhaandsvisning*.spec.ts"],
  outputDir: PATHS.OUTPUT_DIR,
  reporter: getReporters(),

  timeout: withTimeout(TIMEOUTS.TEST),
  expect: {
    timeout: withTimeout(TIMEOUTS.EXPECT),
  },

  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: 0,
  workers: WORKERS,

  use: {
    baseURL: `http://localhost:${PORTS.VITE}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        navigationTimeout: withTimeout(TIMEOUTS.NAVIGATION),
        actionTimeout: withTimeout(TIMEOUTS.ACTION),
      },
    },
  ],

  webServer: getWebServerConfig(),
});
