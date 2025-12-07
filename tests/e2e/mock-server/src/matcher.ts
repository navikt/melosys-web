/* eslint-disable no-console */
/**
 * Request Matcher
 *
 * Matches incoming requests to recorded exchanges using multiple strategies:
 * 1. Exact match: method + path + query + body
 * 2. Normalized path match: Replace IDs with placeholders
 * 3. GraphQL match: operationName + variables
 *
 * For stateful tests (write-then-read pattern), uses sequence-based matching:
 * - When multiple recordings match the same request signature, returns them in order
 * - Tracks which recordings have been "consumed" during playback
 * - Resets between tests via reset() method
 */

import { createHash } from "crypto";
import type { RecordedExchange, MatchRequest, GraphQLRequest } from "./types";
import { mutationTracker } from "./mutation-tracker";

// Patterns for normalizing paths (replace IDs with placeholders)
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

/**
 * Generate a hash for an object (used for body comparison).
 */
function hashObject(obj: unknown): string {
  const str = JSON.stringify(obj || "");
  return createHash("md5").update(str).digest("hex");
}

/**
 * Create an exact match key for a request.
 */
function createExactKey(request: MatchRequest): string {
  const queryString = Object.entries(request.query || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const bodyHash = hashObject(request.body);

  return `${request.method}:${request.pathname}:${queryString}:${bodyHash}`;
}

/**
 * Create a normalized key for a request (ignoring dynamic IDs).
 */
function createNormalizedKey(request: MatchRequest): string {
  const normalizedPath = normalizePath(request.pathname);
  return `${request.method}:${normalizedPath}`;
}

/**
 * Extract path parameters from a URL based on a normalized pattern.
 */
function extractPathParams(pathname: string, normalizedPattern: string): Record<string, string> {
  const params: Record<string, string> = {};

  const pathParts = pathname.split("/");
  const patternParts = normalizedPattern.split("/");

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      const paramName = patternParts[i].substring(1);
      params[paramName] = pathParts[i];
    }
  }

  return params;
}

/**
 * Recording Matcher - matches incoming requests to recorded exchanges.
 *
 * Supports per-worker sequence tracking for parallel test execution:
 * - Each worker has its own set of consumed exchanges
 * - Workers are identified by the X-Playwright-Worker-ID header
 * - Reset can be called per-worker or globally
 */
export class RecordingMatcher {
  private exactIndex: Map<string, RecordedExchange[]>; // Changed to array for sequence tracking
  private normalizedIndex: Map<string, RecordedExchange[]>;
  private graphqlIndex: Map<string, RecordedExchange[]>; // Changed to array for sequence tracking

  // Per-worker sequence tracking: tracks which exchanges have been consumed per worker
  // Key: worker ID (e.g., "worker-0", "worker-1", or "default")
  private consumedExchangesByWorker: Map<string, Set<RecordedExchange>>;

  // Current worker ID for the request being processed
  private currentWorkerId: string = "default";

  // Legacy sequence tracking for exact/graphql (kept for backwards compatibility)
  private exactConsumedCount: Map<string, number>;
  private graphqlConsumedCount: Map<string, number>;

  constructor(exchanges: RecordedExchange[]) {
    this.exactIndex = new Map();
    this.normalizedIndex = new Map();
    this.graphqlIndex = new Map();
    this.consumedExchangesByWorker = new Map();
    this.exactConsumedCount = new Map();
    this.graphqlConsumedCount = new Map();

    this.buildIndexes(exchanges);
  }

  /**
   * Set the current worker ID for the next request(s).
   * Call this before findMatch() or findGraphQLMatch() to ensure
   * sequence tracking is isolated per worker.
   */
  setWorkerId(workerId: string): void {
    this.currentWorkerId = workerId || "default";
  }

  /**
   * Get the current worker ID.
   */
  getWorkerId(): string {
    return this.currentWorkerId;
  }

  /**
   * Get the consumed exchanges set for the current worker.
   * Creates a new set if one doesn't exist for this worker.
   */
  private getConsumedExchanges(): Set<RecordedExchange> {
    if (!this.consumedExchangesByWorker.has(this.currentWorkerId)) {
      this.consumedExchangesByWorker.set(this.currentWorkerId, new Set());
    }
    return this.consumedExchangesByWorker.get(this.currentWorkerId)!;
  }

  /**
   * Reset sequence tracking between tests.
   * @param workerId - Optional worker ID to reset. If not provided, resets all workers.
   */
  reset(workerId?: string): void {
    if (workerId) {
      // Reset only the specified worker
      this.consumedExchangesByWorker.delete(workerId);
      console.log(`[Matcher] Reset sequence tracking for worker: ${workerId}`);
    } else {
      // Reset all workers (global reset)
      this.consumedExchangesByWorker.clear();
      this.exactConsumedCount.clear();
      this.graphqlConsumedCount.clear();
      mutationTracker.reset();
      console.log("[Matcher] Reset sequence tracking for all workers");
    }
  }

  /**
   * Mark an exchange as consumed (for per-worker sequence tracking).
   */
  private markConsumed(exchange: RecordedExchange): void {
    this.getConsumedExchanges().add(exchange);
  }

  /**
   * Filter out already-consumed exchanges from a list (for current worker).
   */
  private filterUnconsumed(exchanges: RecordedExchange[]): RecordedExchange[] {
    const consumed = this.getConsumedExchanges();
    return exchanges.filter((e) => !consumed.has(e));
  }

  /**
   * Build lookup indexes from exchanges.
   * Stores arrays to support sequence-based matching for duplicate requests.
   */
  private buildIndexes(exchanges: RecordedExchange[]): void {
    for (const exchange of exchanges) {
      const request = exchange.request;

      // Build exact index (array for sequence tracking)
      const exactKey = createExactKey({
        method: request.method,
        pathname: request.pathname,
        query: request.query,
        body: request.body,
      });
      if (!this.exactIndex.has(exactKey)) {
        this.exactIndex.set(exactKey, []);
      }
      this.exactIndex.get(exactKey)!.push(exchange);

      // Build normalized index
      const normalizedKey = createNormalizedKey({
        method: request.method,
        pathname: request.pathname,
        query: {},
        body: null,
      });

      if (!this.normalizedIndex.has(normalizedKey)) {
        this.normalizedIndex.set(normalizedKey, []);
      }
      this.normalizedIndex.get(normalizedKey)!.push(exchange);

      // Build GraphQL index (array for sequence tracking)
      if ((request.pathname === "/graphql" || request.pathname === "/graphql/") && request.body) {
        const graphqlBody = request.body as GraphQLRequest;
        if (graphqlBody.operationName) {
          const variablesHash = hashObject(graphqlBody.variables);
          const graphqlKey = `${graphqlBody.operationName}:${variablesHash}`;
          if (!this.graphqlIndex.has(graphqlKey)) {
            this.graphqlIndex.set(graphqlKey, []);
          }
          this.graphqlIndex.get(graphqlKey)!.push(exchange);
        }
      }
    }

    // Count total exchanges across all keys
    let exactCount = 0;
    for (const arr of this.exactIndex.values()) {
      exactCount += arr.length;
    }
    let graphqlCount = 0;
    for (const arr of this.graphqlIndex.values()) {
      graphqlCount += arr.length;
    }

    console.log(
      `[Matcher] Built indexes: ${this.exactIndex.size} exact keys (${exactCount} exchanges), ` +
        `${this.normalizedIndex.size} normalized, ${this.graphqlIndex.size} GraphQL keys (${graphqlCount} exchanges)`,
    );
  }

  /**
   * Find a matching exchange for a request.
   * Uses sequence-based selection when multiple recordings match.
   */
  findMatch(request: MatchRequest): RecordedExchange | null {
    // 1. Try exact match first (with sequence tracking)
    const exactKey = createExactKey(request);
    const exactMatches = this.exactIndex.get(exactKey);

    if (exactMatches && exactMatches.length > 0) {
      // Filter out consumed exchanges for global sequence tracking
      const unconsumed = this.filterUnconsumed(exactMatches);
      if (unconsumed.length > 0) {
        const exchange = unconsumed[0];
        this.markConsumed(exchange);

        const consumedCount = exactMatches.length - unconsumed.length;
        if (exactMatches.length > 1) {
          console.log(
            `[Matcher] Exact match (sequence ${consumedCount + 1}/${exactMatches.length}): ${request.method} ${request.pathname}`,
          );
        } else {
          console.log(`[Matcher] Exact match: ${request.method} ${request.pathname}`);
        }
        return exchange;
      }
      // All exact matches consumed, fall through to return last one (sticky behavior)
      const exchange = exactMatches[exactMatches.length - 1];
      console.log(`[Matcher] Exact match (reusing last): ${request.method} ${request.pathname}`);
      return exchange;
    }

    // 2. Try normalized path match
    const normalizedKey = createNormalizedKey(request);
    const candidates = this.normalizedIndex.get(normalizedKey);

    if (candidates && candidates.length > 0) {
      // Find candidates with exact path match
      const exactPathCandidates = this.findCandidatesWithExactPath(candidates, request.pathname);

      // Check if this path has dynamic segments (MEL-XXXX, numeric IDs, UUIDs)
      const hasDynamicSegments = this.pathHasDynamicSegments(request.pathname);

      if (exactPathCandidates.length > 0) {
        // For GET requests with query params, try query matching FIRST
        // This handles endpoints like /api/behandlingstemaer where path is same but query differs
        if (request.method === "GET" && Object.keys(request.query || {}).length > 0) {
          const unconsumedForPath = this.filterUnconsumed(exactPathCandidates);
          const candidatesToSearch = unconsumedForPath.length > 0 ? unconsumedForPath : exactPathCandidates;

          const queryMatch = this.findBestQueryMatch(candidatesToSearch, request.query);
          if (queryMatch) {
            this.markConsumed(queryMatch);
            console.log(`[Matcher] Query match (exact path): ${request.method} ${request.pathname}`);
            return queryMatch;
          }
        }

        // For paths WITH dynamic segments (e.g., /api/fagsaker/MEL-1015/...),
        // use path-only matching with sequence tracking
        if (hasDynamicSegments) {
          const unconsumedForPath = this.filterUnconsumed(exactPathCandidates);
          const total = exactPathCandidates.length;

          if (unconsumedForPath.length > 0) {
            const exchange = unconsumedForPath[0];
            this.markConsumed(exchange);
            const consumed = total - unconsumedForPath.length;
            if (total > 1) {
              console.log(
                `[Matcher] Path segment match (sequence ${consumed + 1}/${total}): ${request.method} ${request.pathname}`,
              );
            } else {
              console.log(`[Matcher] Path segment match: ${request.method} ${request.pathname}`);
            }
            return exchange;
          } else {
            // All consumed - return last one (sticky behavior)
            const exchange = exactPathCandidates[exactPathCandidates.length - 1];
            console.log(`[Matcher] Path segment match (reusing last): ${request.method} ${request.pathname}`);
            return exchange;
          }
        }

        // For paths WITHOUT dynamic segments (e.g., /api/behandlingstemaer/...),
        // fall through to other matching strategies below
      }

      // No exact path match OR path has no dynamic segments - use other strategies
      const unconsumedCandidates = this.filterUnconsumed(candidates);
      const candidatesToSearch = unconsumedCandidates.length > 0 ? unconsumedCandidates : candidates;

      // For GET requests, try to find best query parameter match
      if (request.method === "GET") {
        const queryMatch = this.findBestQueryMatch(candidatesToSearch, request.query);
        if (queryMatch) {
          this.markConsumed(queryMatch);
          console.log(`[Matcher] Query match: ${request.method} ${request.pathname}`);
          return queryMatch;
        }
        // Fallback to first unconsumed or last consumed
        const fallback = unconsumedCandidates.length > 0 ? unconsumedCandidates[0] : candidates[candidates.length - 1];
        if (unconsumedCandidates.length > 0) {
          this.markConsumed(fallback);
        }
        console.log(`[Matcher] Normalized match (first): ${request.method} ${request.pathname}`);
        return fallback;
      }

      // For POST/PUT, try to match by body similarity
      const bodyMatch = this.findBestBodyMatch(candidatesToSearch, request.body);
      if (bodyMatch) {
        this.markConsumed(bodyMatch);
        console.log(`[Matcher] Body similarity match: ${request.method} ${request.pathname}`);
        return bodyMatch;
      }

      // Fallback to first unconsumed or last consumed
      const fallback = unconsumedCandidates.length > 0 ? unconsumedCandidates[0] : candidates[candidates.length - 1];
      if (unconsumedCandidates.length > 0) {
        this.markConsumed(fallback);
      }
      console.log(`[Matcher] Fallback match: ${request.method} ${request.pathname}`);
      return fallback;
    }

    console.log(`[Matcher] No match found: ${request.method} ${request.pathname}`);
    return null;
  }

  /**
   * Find all candidates that have the exact same path as the request.
   * This is used to ensure we return the correct sak's data when there are
   * multiple saks with recordings for the same normalized endpoint.
   */
  private findCandidatesWithExactPath(candidates: RecordedExchange[], requestPath: string): RecordedExchange[] {
    return candidates.filter((candidate) => candidate.request.pathname === requestPath);
  }

  /**
   * Check if a path contains dynamic segments (MEL-XXXX, numeric IDs, UUIDs).
   * Used to determine whether to use path-only matching (for sak-specific paths)
   * or query matching (for shared endpoints like /api/behandlingstemaer).
   */
  private pathHasDynamicSegments(pathname: string): boolean {
    const segments = pathname.split("/").filter(Boolean);
    return segments.some(
      (seg) =>
        /^MEL-\d+$/.test(seg) || // saksnummer
        /^\d+$/.test(seg) || // numeric ID
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg), // UUID
    );
  }

  /**
   * Find the best matching exchange based on path segment similarity.
   * This matches specific IDs (saksnummer, behandlingId, etc.) in the URL path.
   */
  private findBestPathMatch(candidates: RecordedExchange[], requestPath: string): RecordedExchange | null {
    // Extract all dynamic segments from the request path
    const requestSegments = requestPath.split("/").filter(Boolean);

    let bestMatch: RecordedExchange | null = null;
    let bestScore = 0;

    for (const candidate of candidates) {
      const candidatePath = candidate.request.pathname;
      const candidateSegments = candidatePath.split("/").filter(Boolean);

      // If segment counts don't match, skip
      if (requestSegments.length !== candidateSegments.length) {
        continue;
      }

      let matchingSegments = 0;
      let totalDynamicSegments = 0;

      for (let i = 0; i < requestSegments.length; i++) {
        const reqSeg = requestSegments[i];
        const candSeg = candidateSegments[i];

        // Check if this is a dynamic segment (ID, saksnummer, etc.)
        const isDynamic =
          /^MEL-\d+$/.test(reqSeg) || // saksnummer
          /^\d+$/.test(reqSeg) || // numeric ID
          /^[0-9a-f-]{36}$/i.test(reqSeg); // UUID

        if (isDynamic) {
          totalDynamicSegments++;
          if (reqSeg === candSeg) {
            matchingSegments++;
          }
        }
      }

      // Calculate score based on matching dynamic segments
      const score = totalDynamicSegments > 0 ? matchingSegments / totalDynamicSegments : 0;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
      }
    }

    // Require exact match of dynamic segments
    return bestScore === 1 ? bestMatch : null;
  }

  /**
   * Find the best matching exchange based on query parameter similarity.
   */
  private findBestQueryMatch(
    candidates: RecordedExchange[],
    requestQuery: Record<string, string>,
  ): RecordedExchange | null {
    if (!requestQuery || Object.keys(requestQuery).length === 0) {
      return null;
    }

    let bestMatch: RecordedExchange | null = null;
    let bestScore = 0;

    for (const candidate of candidates) {
      const candidateQuery = candidate.request.query || {};
      let matchingKeys = 0;
      let totalKeys = 0;

      // Count matching query parameters
      for (const [key, value] of Object.entries(requestQuery)) {
        totalKeys++;
        if (candidateQuery[key] === value) {
          matchingKeys++;
        }
      }

      // Calculate match score (percentage of matching keys)
      const score = totalKeys > 0 ? matchingKeys / totalKeys : 0;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
      }
    }

    // Require at least 50% query parameter match
    return bestScore >= 0.5 ? bestMatch : null;
  }

  /**
   * Find a matching exchange for a GraphQL request.
   * Uses sequence-based selection when multiple recordings match.
   */
  findGraphQLMatch(body: GraphQLRequest): RecordedExchange | null {
    if (!body.operationName) {
      console.log("[Matcher] GraphQL request without operationName");
      return null;
    }

    const variablesHash = hashObject(body.variables);
    const graphqlKey = `${body.operationName}:${variablesHash}`;

    const exactMatches = this.graphqlIndex.get(graphqlKey);
    if (exactMatches && exactMatches.length > 0) {
      // Use global sequence tracking
      const unconsumed = this.filterUnconsumed(exactMatches);
      if (unconsumed.length > 0) {
        const exchange = unconsumed[0];
        this.markConsumed(exchange);

        const consumedCount = exactMatches.length - unconsumed.length;
        if (exactMatches.length > 1) {
          console.log(
            `[Matcher] GraphQL exact match (sequence ${consumedCount + 1}/${exactMatches.length}): ${body.operationName}`,
          );
        } else {
          console.log(`[Matcher] GraphQL exact match: ${body.operationName}`);
        }
        return exchange;
      }
      // All consumed, return last one (sticky behavior)
      const exchange = exactMatches[exactMatches.length - 1];
      console.log(`[Matcher] GraphQL exact match (reusing last): ${body.operationName}`);
      return exchange;
    }

    // Try matching without variables (less strict)
    for (const [key, exchanges] of this.graphqlIndex) {
      if (key.startsWith(`${body.operationName}:`) && exchanges.length > 0) {
        const unconsumed = this.filterUnconsumed(exchanges);
        if (unconsumed.length > 0) {
          const exchange = unconsumed[0];
          this.markConsumed(exchange);
          console.log(`[Matcher] GraphQL fuzzy match: ${body.operationName}`);
          return exchange;
        }
        console.log(`[Matcher] GraphQL fuzzy match (reusing last): ${body.operationName}`);
        return exchanges[exchanges.length - 1];
      }
    }

    console.log(`[Matcher] GraphQL no match: ${body.operationName}`);
    return null;
  }

  /**
   * Find the best matching exchange based on body similarity.
   */
  private findBestBodyMatch(candidates: RecordedExchange[], requestBody: unknown): RecordedExchange | null {
    if (!requestBody) {
      return null;
    }

    const requestBodyStr = JSON.stringify(requestBody);
    let bestMatch: RecordedExchange | null = null;
    let bestScore = 0;

    for (const candidate of candidates) {
      if (!candidate.request.body) {
        continue;
      }

      const candidateBodyStr = JSON.stringify(candidate.request.body);
      const score = this.calculateSimilarity(requestBodyStr, candidateBodyStr);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
      }
    }

    // Require at least 50% similarity
    return bestScore >= 0.5 ? bestMatch : null;
  }

  /**
   * Calculate string similarity (simple approach).
   */
  private calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    if (!str1 || !str2) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    const longerLength = longer.length;
    if (longerLength === 0) return 1;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longerLength - editDistance) / longerLength;
  }

  /**
   * Calculate Levenshtein distance between two strings.
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    // Use a simple implementation for short strings
    if (m > 1000 || n > 1000) {
      // For long strings, use a simpler comparison
      return Math.abs(m - n);
    }

    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Get statistics about the matcher.
   */
  getStats(): {
    exactKeys: number;
    exactExchanges: number;
    normalizedKeys: number;
    graphqlKeys: number;
    graphqlExchanges: number;
    consumedExact: number;
    consumedGraphql: number;
    activeWorkers: number;
    consumedByWorker: Record<string, number>;
  } {
    let exactExchanges = 0;
    for (const arr of this.exactIndex.values()) {
      exactExchanges += arr.length;
    }
    let graphqlExchanges = 0;
    for (const arr of this.graphqlIndex.values()) {
      graphqlExchanges += arr.length;
    }

    let consumedExact = 0;
    for (const count of this.exactConsumedCount.values()) {
      consumedExact += count;
    }
    let consumedGraphql = 0;
    for (const count of this.graphqlConsumedCount.values()) {
      consumedGraphql += count;
    }

    // Count consumed exchanges per worker
    const consumedByWorker: Record<string, number> = {};
    for (const [workerId, consumed] of this.consumedExchangesByWorker) {
      consumedByWorker[workerId] = consumed.size;
    }

    return {
      exactKeys: this.exactIndex.size,
      exactExchanges,
      normalizedKeys: this.normalizedIndex.size,
      graphqlKeys: this.graphqlIndex.size,
      graphqlExchanges,
      consumedExact,
      consumedGraphql,
      activeWorkers: this.consumedExchangesByWorker.size,
      consumedByWorker,
    };
  }
}
