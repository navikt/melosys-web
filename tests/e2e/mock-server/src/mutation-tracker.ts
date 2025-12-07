/* eslint-disable no-console */
/**
 * Mutation Tracker
 *
 * Tracks mutations (POST/PUT/DELETE/PATCH) during playback to enable
 * stateful response selection. When a request has multiple recorded
 * responses, the tracker helps select the appropriate variant based
 * on which mutations have occurred.
 *
 * Example flow:
 *   1. GET /api/fagsaker/sok → returns pre-mutation variant
 *   2. POST /api/behandlinger/:id/resultat/type → mutation tracked
 *   3. GET /api/fagsaker/sok → returns post-mutation variant (different!)
 */

// Path normalization patterns (same as matcher.ts)
const PATH_NORMALIZATION_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\/MEL-\d+/g, replacement: "/:saksnummer" },
  { pattern: /\/fagsaker\/\d+/g, replacement: "/fagsaker/:id" },
  { pattern: /\/behandlinger\/\d+/g, replacement: "/behandlinger/:behandlingId" },
  { pattern: /\/oppgaver\/\d+/g, replacement: "/oppgaver/:oppgaveId" },
  { pattern: /\/dokumenter\/\d+/g, replacement: "/dokumenter/:dokumentId" },
  { pattern: /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, replacement: "/:uuid" },
  { pattern: /\/\d{11}(?=\/|$)/g, replacement: "/:fnr" },
  { pattern: /\/\d+(?=\/|$)/g, replacement: "/:id" },
];

/**
 * Normalize a URL path by replacing dynamic segments with placeholders.
 */
function normalizePath(pathname: string): string {
  let normalized = pathname;
  for (const { pattern, replacement } of PATH_NORMALIZATION_PATTERNS) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized;
}

export interface MutationRecord {
  method: string;
  path: string;
  normalizedPath: string;
  body?: unknown;
  timestamp: number;
}

export interface MutationPattern {
  method: string;
  pathPattern: string; // Normalized path pattern
}

/**
 * Tracks mutations during test playback.
 *
 * Usage:
 *   // Record a mutation
 *   mutationTracker.recordMutation("POST", "/api/behandlinger/123/resultat/type");
 *
 *   // Check if mutation occurred
 *   mutationTracker.hasMutation({ method: "POST", pathPattern: "/api/behandlinger/:behandlingId/resultat/type" });
 *
 *   // Reset between tests
 *   mutationTracker.reset();
 */
export class MutationTracker {
  private mutations: MutationRecord[] = [];
  private sequenceCounter = 0;

  /**
   * Record that a mutation occurred.
   */
  recordMutation(method: string, path: string, body?: unknown): void {
    const record: MutationRecord = {
      method,
      path,
      normalizedPath: normalizePath(path),
      body,
      timestamp: Date.now(),
    };

    this.mutations.push(record);
    this.sequenceCounter++;

    console.log(`[MutationTracker] Recorded mutation #${this.sequenceCounter}: ${method} ${record.normalizedPath}`);
  }

  /**
   * Check if a mutation matching the pattern has occurred.
   */
  hasMutation(pattern: MutationPattern): boolean {
    return this.mutations.some(
      (m) => m.method === pattern.method && this.pathMatches(m.normalizedPath, pattern.pathPattern),
    );
  }

  /**
   * Count mutations matching a pattern.
   */
  countMutations(pattern: MutationPattern): number {
    return this.mutations.filter(
      (m) => m.method === pattern.method && this.pathMatches(m.normalizedPath, pattern.pathPattern),
    ).length;
  }

  /**
   * Get all mutations (for debugging and matching).
   */
  getMutations(): MutationRecord[] {
    return [...this.mutations];
  }

  /**
   * Get current sequence number (number of mutations so far).
   */
  getSequence(): number {
    return this.sequenceCounter;
  }

  /**
   * Reset mutation history (call between tests).
   */
  reset(): void {
    const count = this.mutations.length;
    this.mutations = [];
    this.sequenceCounter = 0;
    console.log(`[MutationTracker] Reset - cleared ${count} mutations`);
  }

  /**
   * Check if a path matches a pattern.
   * Both should be normalized paths.
   */
  private pathMatches(normalizedPath: string, pattern: string): boolean {
    // Direct equality check
    if (normalizedPath === pattern) {
      return true;
    }

    // Check if pattern is a prefix (for wildcard-style matching)
    if (pattern.endsWith("/*") && normalizedPath.startsWith(pattern.slice(0, -1))) {
      return true;
    }

    return false;
  }
}

// Singleton instance for the mock server
export const mutationTracker = new MutationTracker();
