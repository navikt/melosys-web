/**
 * E2E Test Mode Configuration
 *
 * Controls whether tests run against live API, record responses, or playback recorded responses.
 *
 * Usage:
 *   E2E_MODE=live pnpm test:e2e      # Default: Run against real melosys-api
 *   E2E_MODE=record pnpm test:e2e    # Record all API responses to files
 *   E2E_MODE=playback pnpm test:e2e  # Use recorded responses (no backend needed)
 */

import { PORTS } from "./constants";

export type TestMode = "live" | "record" | "playback";

/**
 * Get the current test mode from environment variable.
 * Defaults to 'live' if not specified.
 */
export function getTestMode(): TestMode {
  const mode = process.env.E2E_MODE?.toLowerCase();

  if (mode === "record" || mode === "playback") {
    return mode;
  }

  return "live";
}

/**
 * Check if we should record API responses during this test run.
 */
export function shouldRecordResponses(): boolean {
  return getTestMode() === "record";
}

/**
 * Check if we should use the mock server instead of real API.
 */
export function shouldUseMockServer(): boolean {
  return getTestMode() === "playback";
}

/**
 * Check if we're running against the live API (default mode).
 */
export function isLiveMode(): boolean {
  return getTestMode() === "live";
}

/**
 * Get the API base URL based on current mode.
 * In playback mode, this returns the mock server URL.
 */
export function getApiBaseUrl(): string {
  if (shouldUseMockServer()) {
    return process.env.MOCK_API_URL || `http://localhost:${PORTS.MOCK_API}`;
  }
  return process.env.API_BASE_URL || `http://localhost:${PORTS.API}`;
}

/**
 * Get the recordings directory path.
 */
export function getRecordingsPath(): string {
  return process.env.E2E_RECORDINGS_PATH || "./tests/e2e/recordings";
}
