/**
 * Dynamic Value Handler
 *
 * Transforms dynamic values in recorded responses to match the current context.
 * Handles dates, timestamps, and IDs that change between test runs.
 */

import type { RecordedResponse } from "./types";

// Date-related field patterns (case insensitive)
const DATE_FIELD_PATTERNS = [
  /opprettet/i,
  /endret/i,
  /sistoppdatert/i,
  /timestamp/i,
  /dato/i,
  /tidspunkt/i,
  /fom/i,
  /tom/i,
  /startdato/i,
  /sluttdato/i,
  /mottattdato/i,
  /innsendt/i,
];

// ISO date regex pattern
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;

// Date-only pattern (YYYY-MM-DD)
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface TransformContext {
  requestParams: Record<string, string>;
  requestQuery: Record<string, string>;
  requestBody: unknown;
  recordedAt?: string;
}

/**
 * Check if a field name looks like a date field.
 */
function isDateField(fieldName: string): boolean {
  return DATE_FIELD_PATTERNS.some((pattern) => pattern.test(fieldName));
}

/**
 * Check if a value looks like a date string.
 */
function isDateValue(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return ISO_DATE_PATTERN.test(value) || DATE_ONLY_PATTERN.test(value);
}

/**
 * Shift a date by the difference between recorded time and current time.
 * Preserves the time component if present.
 */
function shiftDate(originalDate: string, recordedAt: string): string {
  try {
    const original = new Date(originalDate);
    const recorded = new Date(recordedAt);
    const now = new Date();

    // Calculate the time difference in milliseconds
    const diff = now.getTime() - recorded.getTime();

    // Add the difference to the original date
    const shifted = new Date(original.getTime() + diff);

    // Preserve the original format
    if (DATE_ONLY_PATTERN.test(originalDate)) {
      return shifted.toISOString().split("T")[0];
    }

    return shifted.toISOString();
  } catch {
    return originalDate;
  }
}

/**
 * Recursively transform dynamic values in an object.
 */
function transformObject(obj: unknown, context: TransformContext, path: string = ""): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item, index) => transformObject(item, context, `${path}[${index}]`));
  }

  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const fieldPath = path ? `${path}.${key}` : key;

      // Check if this is a date field that needs transformation
      if (isDateField(key) && isDateValue(value) && context.recordedAt) {
        result[key] = shiftDate(value as string, context.recordedAt);
      } else {
        result[key] = transformObject(value, context, fieldPath);
      }
    }

    return result;
  }

  return obj;
}

/**
 * Replace placeholders in a value with actual values from context.
 */
function replacePlaceholders(value: string, context: TransformContext): string {
  let result = value;

  // Replace path params
  for (const [key, val] of Object.entries(context.requestParams)) {
    result = result.replace(new RegExp(`:${key}`, "g"), val);
  }

  return result;
}

/**
 * Dynamic Value Handler class.
 */
export class DynamicValueHandler {
  private transformDates: boolean;

  constructor(options: { transformDates?: boolean } = {}) {
    this.transformDates = options.transformDates ?? true;
  }

  /**
   * Transform a recorded response for the current request context.
   */
  transform(response: RecordedResponse, context: TransformContext): RecordedResponse {
    if (!this.transformDates) {
      return response;
    }

    const transformedBody = transformObject(response.body, context);

    return {
      ...response,
      body: transformedBody,
    };
  }
}

/**
 * Create a default DynamicValueHandler instance.
 */
export function createDynamicHandler(): DynamicValueHandler {
  return new DynamicValueHandler({
    transformDates: process.env.TRANSFORM_DATES !== "false",
  });
}
