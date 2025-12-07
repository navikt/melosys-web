/**
 * Playwright Test Fixtures with API Recording Support
 *
 * Extends the base Playwright test with automatic API recording when
 * running in record mode (E2E_MODE=record).
 *
 * In playback mode:
 * - Adds X-Playwright-Worker-ID header to all API requests for per-worker isolation
 * - Resets mock server state before each test for proper test isolation
 * - Enables parallel test execution with sequence tracking per worker
 *
 * Usage in test files:
 *   import { test, expect } from '../recording/fixtures';
 *
 * Or continue using the standard import if recording is not needed:
 *   import { test, expect } from '@playwright/test';
 */

import { test as base, expect } from "@playwright/test";
import { ApiRecorder } from "./recorder";
import { shouldRecordResponses, shouldUseMockServer, getApiBaseUrl } from "../config/mode";

// Header name used to identify workers (must match mock server)
const WORKER_ID_HEADER = "x-playwright-worker-id";

// Extend the base test with recording fixture
export const test = base.extend<{ apiRecorder: ApiRecorder | null }>({
  // Provide an API recorder that automatically records in record mode
  apiRecorder: async ({ page, request }, use, testInfo) => {
    let recorder: ApiRecorder | null = null;

    // Generate worker ID from parallel index (e.g., "worker-0", "worker-1")
    const workerId = `worker-${testInfo.parallelIndex}`;

    // In playback mode, set up worker isolation
    if (shouldUseMockServer()) {
      const baseUrl = getApiBaseUrl();

      // Add worker ID header to all API requests via route interception
      // This ensures each worker's requests are tracked separately by the mock server
      // Note: Browser makes requests to localhost:3333 (Vite) which proxies to 8080,
      // so we need to intercept **/api/** pattern, not the baseUrl pattern
      await page.route("**/api/**", async (route) => {
        const headers = {
          ...route.request().headers(),
          [WORKER_ID_HEADER]: workerId,
        };
        await route.continue({ headers });
      });

      // Also intercept GraphQL requests
      await page.route("**/graphql", async (route) => {
        const headers = {
          ...route.request().headers(),
          [WORKER_ID_HEADER]: workerId,
        };
        await route.continue({ headers });
      });
      await page.route("**/graphql/", async (route) => {
        const headers = {
          ...route.request().headers(),
          [WORKER_ID_HEADER]: workerId,
        };
        await route.continue({ headers });
      });

      // Reset mock server state for this worker before each test
      // This ensures sequence tracking starts fresh for write-then-read tests
      try {
        await request.post(`${baseUrl}/__reset`, {
          headers: { [WORKER_ID_HEADER]: workerId },
        });
        // eslint-disable-next-line no-console
        console.log(`[Playback] Reset mock server state for ${workerId}: ${testInfo.title}`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`[Playback] Could not reset mock server for ${workerId} (continuing anyway):`, error);
      }
    }

    if (shouldRecordResponses()) {
      // Create recorder with test context
      recorder = new ApiRecorder(testInfo.file, testInfo.title);

      // Attach to page to intercept requests
      await recorder.attachToPage(page);

      // eslint-disable-next-line no-console
      console.log(`[Recording] Started for: ${testInfo.title}`);
    }

    // Run the test
    await use(recorder);

    // After test: save recordings
    if (recorder && recorder.exchangeCount > 0) {
      recorder.save();
      // eslint-disable-next-line no-console
      console.log(`[Recording] Completed: ${recorder.exchangeCount} exchanges captured`);
    }
  },
});

// Re-export expect for convenience
export { expect };

/**
 * Helper function to check if we're in recording mode.
 * Can be used in tests to conditionally skip or modify behavior.
 */
export function isRecordingMode(): boolean {
  return shouldRecordResponses();
}
