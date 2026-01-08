/**
 * Types for test summary generation
 */

/**
 * Individual test result data
 */
export interface TestData {
  title: string;
  file: string;
  status: "passed" | "failed" | "skipped" | "flaky";
  totalAttempts: number;
  failedAttempts: number;
  duration: number;
  error?: string;
}

/**
 * Complete test summary data
 */
export interface TestSummaryData {
  status: "passed" | "failed";
  startTime?: Date;
  duration: number;
  tests: TestData[];
  mode: "playback" | "record" | "live";
}
