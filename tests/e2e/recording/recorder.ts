/**
 * API Recorder for E2E Tests
 *
 * Intercepts all API calls during test execution and records request/response pairs.
 * Recordings are saved as JSON files that can be played back by the mock server.
 */

import type { Page, Route, Request, APIResponse } from "@playwright/test";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";
import { getRecordingsPath } from "../config/mode";
import { normalizePath } from "../shared/path-normalization";

// Types for recorded data
export interface RecordedRequest {
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
}

export interface Recording {
  version: string;
  recordedAt: string;
  testFile: string;
  testName: string;
  exchanges: RecordedExchange[];
}

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

// Patterns for normalizing embedded timestamps in string values (like oppgaveBeskrivelse)
// These are applied to ALL string values, not just specific fields
const EMBEDDED_TIMESTAMP_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // "--- 11.12.2025 15:53 (srvmelosys, Melosys) ---" → "--- 01.01.2025 00:00 (srvmelosys, Melosys) ---"
  { pattern: /--- \d{2}\.\d{2}\.\d{4} \d{2}:\d{2} \(/g, replacement: "--- 01.01.2025 00:00 (" },
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
  "opprettelsestidspunkt",
  "sistBekreftet",
  "correlationId",
];

// UUID pattern for normalization
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NORMALIZED_UUID = "00000000-0000-0000-0000-000000000000";

/**
 * Normalize embedded timestamps in a string value.
 */
function normalizeEmbeddedTimestamps(value: string): string {
  let normalized = value;
  for (const { pattern, replacement } of EMBEDDED_TIMESTAMP_PATTERNS) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized;
}

// Keys to use for sorting arrays of objects (in priority order)
const SORT_KEYS = ["id", "orgnr", "kode", "saksnummer", "behandlingId", "navn", "land", "postnummer"];

/**
 * Get a stable sort key for an object.
 * Tries known keys in order, falls back to JSON stringification.
 */
function getObjectSortKey(obj: Record<string, unknown>): string {
  // Try known unique identifiers first
  for (const key of SORT_KEYS) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return `${key}:${String(obj[key])}`;
    }
  }
  // Fall back to stringified object (deterministic for same content)
  return JSON.stringify(obj);
}

/**
 * Sort an array of objects deterministically.
 */
function sortArrayDeterministically(arr: unknown[]): unknown[] {
  // First normalize all items
  const normalized = arr.map((item) => normalizeForStableRecording(item));

  // Only sort if all items are objects (not primitives)
  const allObjects = normalized.every((item) => item !== null && typeof item === "object" && !Array.isArray(item));

  if (allObjects) {
    return [...normalized].sort((a, b) => {
      const keyA = getObjectSortKey(a as Record<string, unknown>);
      const keyB = getObjectSortKey(b as Record<string, unknown>);
      return keyA.localeCompare(keyB);
    });
  }

  return normalized;
}

/**
 * Normalize dynamic values in an object for stable recordings.
 * This ensures recordings don't change just because timestamps differ.
 */
function normalizeForStableRecording(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return sortArrayDeterministically(obj);
  }

  if (typeof obj === "string") {
    // Normalize embedded timestamps in all string values
    return normalizeEmbeddedTimestamps(obj);
  }

  if (typeof obj === "object") {
    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // Check if this field should be normalized
      const shouldNormalize = FIELDS_TO_NORMALIZE.some((field) => key.toLowerCase().includes(field.toLowerCase()));

      if (shouldNormalize && typeof value === "string") {
        // Try to normalize the value based on its format
        let normalizedValue = value;

        // Check for UUID first
        if (UUID_PATTERN.test(value)) {
          normalizedValue = NORMALIZED_UUID;
        } else {
          // Try timestamp patterns
          for (const { pattern, value: replacement } of NORMALIZE_PATTERNS) {
            if (pattern.test(value)) {
              normalizedValue = replacement;
              break;
            }
          }
        }
        // Also normalize any embedded timestamps
        normalized[key] = normalizeEmbeddedTimestamps(normalizedValue);
      } else {
        normalized[key] = normalizeForStableRecording(value);
      }
    }
    return normalized;
  }

  return obj;
}

/**
 * Create a deterministic sort key for an exchange.
 * This ensures exchanges are always sorted in the same order regardless of when they completed.
 */
function getExchangeSortKey(exchange: RecordedExchange): string {
  const { method, normalizedPath, query, body } = exchange.request;
  // Sort query params deterministically
  const sortedQuery = Object.keys(query)
    .sort()
    .map((k) => `${k}=${query[k]}`)
    .join("&");
  // Include body hash for POST/PUT requests that have same path but different body
  const bodyHash = body ? JSON.stringify(body) : "";
  return `${method}|${normalizedPath}|${sortedQuery}|${bodyHash}`;
}

/**
 * Sort exchanges deterministically by their request signature.
 * This ensures recordings are stable regardless of async timing.
 */
function sortExchanges(exchanges: RecordedExchange[]): RecordedExchange[] {
  return [...exchanges].sort((a, b) => {
    const keyA = getExchangeSortKey(a);
    const keyB = getExchangeSortKey(b);
    return keyA.localeCompare(keyB);
  });
}

/**
 * Canonical JSON stringify that sorts object keys for deterministic comparison.
 * This ensures {"a":1,"b":2} equals {"b":2,"a":1}.
 */
function canonicalStringify(obj: unknown): string {
  if (obj === null || obj === undefined) {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map((item) => canonicalStringify(item)).join(",") + "]";
  }
  if (typeof obj === "object") {
    const sortedKeys = Object.keys(obj as Record<string, unknown>).sort();
    const pairs = sortedKeys.map((key) => {
      const value = (obj as Record<string, unknown>)[key];
      return JSON.stringify(key) + ":" + canonicalStringify(value);
    });
    return "{" + pairs.join(",") + "}";
  }
  return JSON.stringify(obj);
}

/**
 * Check if two recordings have equivalent exchanges (ignoring metadata like recordedAt, duration, dynamicFields).
 * Compares exchanges after sorting them deterministically.
 * Returns true if they are equivalent and no update is needed.
 */
function recordingsAreEquivalent(existing: Recording, newRecording: Recording): boolean {
  // Different number of exchanges = not equivalent
  if (existing.exchanges.length !== newRecording.exchanges.length) {
    return false;
  }

  // Sort both sets of exchanges for deterministic comparison
  const sortedExisting = sortExchanges(existing.exchanges);
  const sortedNew = sortExchanges(newRecording.exchanges);

  // Compare each exchange (request + response, ignoring duration/dynamicFields)
  for (let i = 0; i < sortedExisting.length; i++) {
    const existingEx = sortedExisting[i];
    const newEx = sortedNew[i];

    // Compare requests (ignoring id which is generated)
    if (
      existingEx.request.method !== newEx.request.method ||
      existingEx.request.pathname !== newEx.request.pathname ||
      canonicalStringify(existingEx.request.query) !== canonicalStringify(newEx.request.query) ||
      canonicalStringify(existingEx.request.body) !== canonicalStringify(newEx.request.body)
    ) {
      return false;
    }

    // Compare responses (status and normalized body)
    // Normalize existing body too, since old recordings may have non-normalized dates/arrays
    const existingBodyNormalized = normalizeForStableRecording(existingEx.response.body);
    const newBodyNormalized = normalizeForStableRecording(newEx.response.body);
    if (
      existingEx.response.status !== newEx.response.status ||
      canonicalStringify(existingBodyNormalized) !== canonicalStringify(newBodyNormalized)
    ) {
      return false;
    }
  }

  return true;
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

    try {
      // Fetch from the real API
      const response = await route.fetch();

      // Record the exchange
      const exchange = await this.captureExchange(request, response);
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
  private async captureExchange(request: Request, response: APIResponse): Promise<RecordedExchange> {
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

    // Parse query parameters for ID generation
    const query = parseQuery(url);

    return {
      request: {
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

    // Sort exchanges deterministically for stable recordings
    const sortedExchanges = sortExchanges(this.exchanges);

    // Use a fixed timestamp for stable recordings
    const STABLE_RECORDED_AT = "2025-01-01T00:00:00.000Z";

    const newRecording: Recording = {
      version: "1.0",
      recordedAt: STABLE_RECORDED_AT,
      testFile: this.testFile,
      testName: this.testName,
      exchanges: sortedExchanges,
    };

    // Check if file exists and compare with existing recording
    if (existsSync(outputPath)) {
      try {
        const existingContent = readFileSync(outputPath, "utf-8");
        const existingRecording: Recording = JSON.parse(existingContent);

        // If recordings are equivalent, skip writing entirely
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

    // Write recording as JSON
    writeFileSync(outputPath, JSON.stringify(newRecording, null, 2));

    // Format with prettier for consistent formatting
    try {
      execSync(`npx prettier --write "${outputPath}"`, { stdio: "ignore" });
    } catch {
      // Ignore prettier errors - file is still valid JSON
    }

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
