/**
 * E2E Test Configuration Constants
 *
 * Centralized configuration for ports, timeouts, paths, and commands
 * used across Playwright configuration and test utilities.
 */

/** Server ports */
export const PORTS = {
  /** Vite dev server port */
  VITE: 3333,
  /** Mock API server port (and real API in local dev) */
  API: 8080,
} as const;

/** Timeout values in milliseconds */
export const TIMEOUTS = {
  /** Maximum time a single test can run */
  TEST: 15_000,
  /** Maximum time for expect() assertions */
  EXPECT: 8_000,
  /** Maximum time for page navigation */
  NAVIGATION: 8_000,
  /** Maximum time for user actions (click, fill, etc.) */
  ACTION: 4_000,
  /** Time to wait for mock server to start */
  MOCK_SERVER_STARTUP: 30_000,
  /** Time to wait for Vite dev server to start */
  VITE_STARTUP: 120_000,
} as const;

/** File system paths relative to project root */
export const PATHS = {
  TEST_DIR: "./tests/e2e/specs",
  OUTPUT_DIR: "tests/e2e/artifacts",
  REPORT_DIR: "tests/e2e/reports/playwright-report",
  HAR_DIR: "tests/e2e/recordings/har",
  GLOBAL_SETUP: "./tests/e2e/globalSetup.ts",
  SUMMARY_REPORTER: "./tests/e2e/reporters/test-summary-reporter.ts",
} as const;

/** Shell commands for starting servers */
export const COMMANDS = {
  /** Start Vite dev server with local config */
  VITE: `node generate-local-config.mjs .local.env && npx vite --port ${PORTS.VITE}`,
  /** Start mock API server */
  MOCK_SERVER: "cd tests/e2e/mock-server && npm start",
} as const;

/** CI environment configuration */
export const CI_CONFIG = {
  /** Timeout multiplier for CI environments (slower than local) */
  TIMEOUT_MULTIPLIER: 3,
  /** Number of parallel workers in CI (reduced due to browser resource contention) */
  WORKERS: 2,
} as const;

/** Local development configuration */
export const LOCAL_CONFIG = {
  /** Number of parallel workers locally */
  WORKERS: 4,
} as const;
