/**
 * API Recorder for E2E Tests
 *
 * Intercepts all API calls during test execution and records request/response pairs.
 * Recordings are saved as JSON files that can be played back by the mock server.
 */

import type { Page, Route, Request, APIResponse } from "@playwright/test";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";
import { getRecordingsPath } from "../config/mode";
import { normalizePath } from "../shared/path-normalization";

// Types for recorded data
export interface RecordedRequest {
  id: string;
  method: string;
  url: string;
  pathname: string;
  normalizedPath: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: unknown | null;
}

export interface RecordedResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
}

export interface RecordedExchange {
  request: RecordedRequest;
  response: RecordedResponse;
  duration: number;
  dynamicFields: string[];
}

export interface Recording {
  version: string;
  recordedAt: string;
  testFile: string;
  testName: string;
  exchanges: RecordedExchange[];
}

// Known dynamic fields that change between runs (for detection/logging)
const KNOWN_DYNAMIC_FIELDS = [
  "opprettetTidspunkt",
  "endretTidspunkt",
  "sistOppdatert",
  "opprettetAv",
  "endretAv",
  "timestamp",
  "dato",
  "fom",
  "tom",
];

// Fields that should be normalized to stable values before saving
// Key patterns (case-insensitive) → normalized value
const NORMALIZE_PATTERNS: Array<{ pattern: RegExp; value: string }> = [
  // ISO timestamps (2025-12-11T14:00:28.983841Z)
  { pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/, value: "2025-01-01T00:00:00.000Z" },
  // ISO dates (2025-12-11)
  { pattern: /^\d{4}-\d{2}-\d{2}$/, value: "2025-01-01" },
  // Norwegian dates (11.12.2025)
  { pattern: /^\d{2}\.\d{2}\.\d{4}$/, value: "01.01.2025" },
];

// Field names that should have their values normalized (case-insensitive partial match)
const FIELDS_TO_NORMALIZE = [
  "registrertDato",
  "endretDato",
  "opprettetTidspunkt",
  "endretTidspunkt",
  "sistOppdatert",
  "mottaksdato",
  "behandlingsfrist",
  "svarFrist",
  "opprettetDato",
  "sisteOpplysningerHentetDato",
];

/**
 * Normalize dynamic values in an object for stable recordings.
 * This ensures recordings don't change just because timestamps differ.
 */
function normalizeForStableRecording(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => normalizeForStableRecording(item));
  }

  if (typeof obj === "object") {
    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // Check if this field should be normalized
      const shouldNormalize = FIELDS_TO_NORMALIZE.some((field) => key.toLowerCase().includes(field.toLowerCase()));

      if (shouldNormalize && typeof value === "string") {
        // Try to normalize the value based on its format
        let normalizedValue = value;
        for (const { pattern, value: replacement } of NORMALIZE_PATTERNS) {
          if (pattern.test(value)) {
            normalizedValue = replacement;
            break;
          }
        }
        normalized[key] = normalizedValue;
      } else {
        normalized[key] = normalizeForStableRecording(value);
      }
    }
    return normalized;
  }

  return obj;
}

/**
 * Check if two recordings have equivalent exchanges (ignoring metadata like recordedAt).
 * Returns true if they are equivalent and no update is needed.
 */
function recordingsAreEquivalent(existing: Recording, newRecording: Recording): boolean {
  // Different number of exchanges = not equivalent
  if (existing.exchanges.length !== newRecording.exchanges.length) {
    return false;
  }

  // Compare each exchange (request + response, ignoring duration)
  for (let i = 0; i < existing.exchanges.length; i++) {
    const existingEx = existing.exchanges[i];
    const newEx = newRecording.exchanges[i];

    // Compare requests (ignoring id which is generated)
    if (
      existingEx.request.method !== newEx.request.method ||
      existingEx.request.pathname !== newEx.request.pathname ||
      JSON.stringify(existingEx.request.query) !== JSON.stringify(newEx.request.query) ||
      JSON.stringify(existingEx.request.body) !== JSON.stringify(newEx.request.body)
    ) {
      return false;
    }

    // Compare responses (status and normalized body)
    if (
      existingEx.response.status !== newEx.response.status ||
      JSON.stringify(existingEx.response.body) !== JSON.stringify(newEx.response.body)
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Generate a unique ID for a request based on method, path, query, and body.
 */
function generateRequestId(method: string, pathname: string, query: Record<string, string>, body: unknown): string {
  const queryString = Object.entries(query)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  const content = `${method}:${pathname}:${queryString}:${JSON.stringify(body || "")}`;
  return createHash("md5").update(content).digest("hex").substring(0, 12);
}

/**
 * Parse URL query parameters into an object.
 */
function parseQuery(url: URL): Record<string, string> {
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });
  return query;
}

/**
 * Extract relevant headers from a request/response.
 */
function extractHeaders(headers: Record<string, string>): Record<string, string> {
  const relevant = ["content-type", "accept", "authorization"];
  const extracted: Record<string, string> = {};
  for (const key of relevant) {
    if (headers[key]) {
      extracted[key] = key === "authorization" ? "[REDACTED]" : headers[key];
    }
  }
  return extracted;
}

/**
 * Find dynamic fields in a response body.
 */
function findDynamicFields(body: unknown, path: string = ""): string[] {
  const fields: string[] = [];

  if (body === null || body === undefined) {
    return fields;
  }

  if (Array.isArray(body)) {
    body.forEach((item, index) => {
      fields.push(...findDynamicFields(item, `${path}[${index}]`));
    });
  } else if (typeof body === "object") {
    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
      const fieldPath = path ? `${path}.${key}` : key;

      // Check if this is a known dynamic field
      if (KNOWN_DYNAMIC_FIELDS.some((df) => key.toLowerCase().includes(df.toLowerCase()))) {
        fields.push(fieldPath);
      }

      // Recurse into nested objects
      fields.push(...findDynamicFields(value, fieldPath));
    }
  }

  return fields;
}

/**
 * Safely parse JSON body, returning null if parsing fails.
 */
async function safeParseBody(response: APIResponse): Promise<unknown> {
  try {
    const contentType = response.headers()["content-type"] || "";
    if (contentType.includes("application/json")) {
      return await response.json();
    }
    // For non-JSON responses, return text
    const text = await response.text();
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

/**
 * API Recorder class that attaches to a Playwright page and records all API interactions.
 */
export class ApiRecorder {
  private exchanges: RecordedExchange[] = [];
  private testFile: string;
  private testName: string;
  private recordingsPath: string;

  constructor(testFile: string, testName: string) {
    this.testFile = testFile;
    this.testName = testName;
    this.recordingsPath = getRecordingsPath();
  }

  /**
   * Attach the recorder to a Playwright page.
   * Intercepts all /api/* requests and POST /graphql requests.
   */
  async attachToPage(page: Page): Promise<void> {
    // Intercept API requests (must start with /api/)
    await page.route(/^https?:\/\/[^/]+\/api\//, async (route: Route) => {
      await this.handleRoute(route);
    });

    // Intercept GraphQL requests (POST to /graphql endpoint, with or without trailing slash)
    await page.route(/^https?:\/\/[^/]+\/graphql\/?$/, async (route: Route) => {
      await this.handleRoute(route);
    });
  }

  /**
   * Handle an intercepted route: fetch from real API and record the exchange.
   */
  private async handleRoute(route: Route): Promise<void> {
    const request = route.request();
    const startTime = Date.now();

    try {
      // Fetch from the real API
      const response = await route.fetch();
      const duration = Date.now() - startTime;

      // Record the exchange
      const exchange = await this.captureExchange(request, response, duration);
      this.exchanges.push(exchange);

      // Continue with the real response
      await route.fulfill({
        status: response.status(),
        headers: response.headers(),
        body: await response.body(),
      });
    } catch (error) {
      // If fetch fails, let the route continue normally
      // eslint-disable-next-line no-console
      console.warn(`[Recorder] Failed to capture ${request.url()}: ${error}`);
      await route.continue();
    }
  }

  /**
   * Capture a request/response exchange.
   */
  private async captureExchange(request: Request, response: APIResponse, duration: number): Promise<RecordedExchange> {
    const url = new URL(request.url());
    const pathname = url.pathname;
    const method = request.method();

    // Parse request body
    let requestBody: unknown = null;
    try {
      const postData = request.postData();
      if (postData) {
        requestBody = JSON.parse(postData);
      }
    } catch {
      requestBody = request.postData();
    }

    // Parse response body and normalize dynamic fields for stable recordings
    const rawResponseBody = await safeParseBody(response);
    const responseBody = normalizeForStableRecording(rawResponseBody);

    // Find dynamic fields in response (for logging/debugging)
    const dynamicFields = findDynamicFields(rawResponseBody);

    // Parse query parameters for ID generation
    const query = parseQuery(url);

    return {
      request: {
        id: generateRequestId(method, pathname, query, requestBody),
        method,
        url: request.url(),
        pathname,
        normalizedPath: normalizePath(pathname),
        query,
        headers: extractHeaders(request.headers()),
        body: requestBody,
      },
      response: {
        status: response.status(),
        statusText: response.statusText(),
        headers: extractHeaders(response.headers()),
        body: responseBody,
      },
      duration,
      dynamicFields,
    };
  }

  /**
   * Get the number of recorded exchanges.
   */
  get exchangeCount(): number {
    return this.exchanges.length;
  }

  /**
   * Save recordings to a JSON file.
   * Only writes if the recording has actually changed (ignoring metadata like recordedAt).
   */
  save(): void {
    if (this.exchanges.length === 0) {
      return;
    }

    // Create output path based on test file structure
    const relativePath = this.testFile.replace(/.*\/specs\//, "").replace(/\.spec\.ts$/, "");
    const sanitizedTestName = this.sanitizeFileName(this.testName);
    const outputDir = join(this.recordingsPath, "specs", relativePath);
    const outputPath = join(outputDir, `${sanitizedTestName}.json`);

    const newRecording: Recording = {
      version: "1.0",
      recordedAt: new Date().toISOString(),
      testFile: this.testFile,
      testName: this.testName,
      exchanges: this.exchanges,
    };

    // Check if file exists and compare with existing recording
    if (existsSync(outputPath)) {
      try {
        const existingContent = readFileSync(outputPath, "utf-8");
        const existingRecording: Recording = JSON.parse(existingContent);

        // If recordings are equivalent, skip writing
        if (recordingsAreEquivalent(existingRecording, newRecording)) {
          // eslint-disable-next-line no-console
          console.log(`[Recorder] Skipped (unchanged): ${outputPath}`);
          return;
        }
      } catch {
        // If we can't read/parse existing file, just overwrite it
      }
    }

    // Ensure directory exists
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Write recording
    writeFileSync(outputPath, JSON.stringify(newRecording, null, 2));

    // eslint-disable-next-line no-console
    console.log(`[Recorder] Saved ${this.exchanges.length} exchanges to ${outputPath}`);
  }

  /**
   * Sanitize a test name for use as a filename.
   */
  private sanitizeFileName(name: string): string {
    return name
      .toLowerCase()
      .replace(/æ/g, "ae")
      .replace(/ø/g, "o")
      .replace(/å/g, "a")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 100);
  }
}
