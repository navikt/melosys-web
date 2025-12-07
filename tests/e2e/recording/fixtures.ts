/**
 * Playwright Test Fixtures with API Recording Support
 *
 * Extends the base Playwright test with automatic API recording when
 * running in record mode (E2E_MODE=record).
 *
 * In playback mode, resets mock server state before each test for proper
 * test isolation (enables stateful write-then-read tests).
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

// Extend the base test with recording fixture
export const test = base.extend<{ apiRecorder: ApiRecorder | null }>({
  // Provide an API recorder that automatically records in record mode
  apiRecorder: async ({ page, request }, use, testInfo) => {
    let recorder: ApiRecorder | null = null;

    // In playback mode, reset mock server state before each test
    // This ensures sequence tracking starts fresh for write-then-read tests
    if (shouldUseMockServer()) {
      try {
        const baseUrl = getApiBaseUrl();
        await request.post(`${baseUrl}/__reset`);
        // eslint-disable-next-line no-console
        console.log(`[Playback] Reset mock server state for: ${testInfo.title}`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`[Playback] Could not reset mock server (continuing anyway):`, error);
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
