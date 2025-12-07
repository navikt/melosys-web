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
 */
export class RecordingMatcher {
  private exactIndex: Map<string, RecordedExchange[]>; // Changed to array for sequence tracking
  private normalizedIndex: Map<string, RecordedExchange[]>;
  private graphqlIndex: Map<string, RecordedExchange[]>; // Changed to array for sequence tracking

  // Sequence tracking: counts how many times each key has been consumed
  private exactConsumedCount: Map<string, number>;
  private graphqlConsumedCount: Map<string, number>;

  constructor(exchanges: RecordedExchange[]) {
    this.exactIndex = new Map();
    this.normalizedIndex = new Map();
    this.graphqlIndex = new Map();
    this.exactConsumedCount = new Map();
    this.graphqlConsumedCount = new Map();

    this.buildIndexes(exchanges);
  }

  /**
   * Reset sequence tracking between tests.
   * Call this when starting a new test to reset consumed counts.
   */
  reset(): void {
    this.exactConsumedCount.clear();
    this.graphqlConsumedCount.clear();
    mutationTracker.reset();
    console.log("[Matcher] Reset sequence tracking");
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
      const consumedCount = this.exactConsumedCount.get(exactKey) || 0;
      const index = Math.min(consumedCount, exactMatches.length - 1);
      const exchange = exactMatches[index];

      // Increment consumed count
      this.exactConsumedCount.set(exactKey, consumedCount + 1);

      if (exactMatches.length > 1) {
        console.log(
          `[Matcher] Exact match (sequence ${index + 1}/${exactMatches.length}): ${request.method} ${request.pathname}`,
        );
      } else {
        console.log(`[Matcher] Exact match: ${request.method} ${request.pathname}`);
      }
      return exchange;
    }

    // 2. Try normalized path match
    const normalizedKey = createNormalizedKey(request);
    const candidates = this.normalizedIndex.get(normalizedKey);

    if (candidates && candidates.length > 0) {
      // 2a. First, try to match by path segments (saksnummer, behandlingId, etc.)
      const pathMatch = this.findBestPathMatch(candidates, request.pathname);
      if (pathMatch) {
        console.log(`[Matcher] Path segment match: ${request.method} ${request.pathname}`);
        return pathMatch;
      }

      // For GET requests, try to find best query parameter match
      if (request.method === "GET") {
        const queryMatch = this.findBestQueryMatch(candidates, request.query);
        if (queryMatch) {
          console.log(`[Matcher] Query match: ${request.method} ${request.pathname}`);
          return queryMatch;
        }
        console.log(`[Matcher] Normalized match (first): ${request.method} ${request.pathname}`);
        return candidates[0];
      }

      // For POST/PUT, try to match by body similarity
      const bodyMatch = this.findBestBodyMatch(candidates, request.body);
      if (bodyMatch) {
        console.log(`[Matcher] Body similarity match: ${request.method} ${request.pathname}`);
        return bodyMatch;
      }

      // Fallback to first candidate
      console.log(`[Matcher] Fallback match: ${request.method} ${request.pathname}`);
      return candidates[0];
    }

    console.log(`[Matcher] No match found: ${request.method} ${request.pathname}`);
    return null;
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
      const consumedCount = this.graphqlConsumedCount.get(graphqlKey) || 0;
      const index = Math.min(consumedCount, exactMatches.length - 1);
      const exchange = exactMatches[index];

      // Increment consumed count
      this.graphqlConsumedCount.set(graphqlKey, consumedCount + 1);

      if (exactMatches.length > 1) {
        console.log(
          `[Matcher] GraphQL exact match (sequence ${index + 1}/${exactMatches.length}): ${body.operationName}`,
        );
      } else {
        console.log(`[Matcher] GraphQL exact match: ${body.operationName}`);
      }
      return exchange;
    }

    // Try matching without variables (less strict)
    for (const [key, exchanges] of this.graphqlIndex) {
      if (key.startsWith(`${body.operationName}:`) && exchanges.length > 0) {
        console.log(`[Matcher] GraphQL fuzzy match: ${body.operationName}`);
        return exchanges[0];
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

    return {
      exactKeys: this.exactIndex.size,
      exactExchanges,
      normalizedKeys: this.normalizedIndex.size,
      graphqlKeys: this.graphqlIndex.size,
      graphqlExchanges,
      consumedExact,
      consumedGraphql,
    };
  }
}
