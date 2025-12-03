/* eslint-disable no-console */
/**
 * Request Matcher
 *
 * Matches incoming requests to recorded exchanges using multiple strategies:
 * 1. Exact match: method + path + query + body
 * 2. Normalized path match: Replace IDs with placeholders
 * 3. GraphQL match: operationName + variables
 */

import { createHash } from "crypto";
import type { RecordedExchange, MatchRequest, GraphQLRequest } from "./types";

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
  private exactIndex: Map<string, RecordedExchange>;
  private normalizedIndex: Map<string, RecordedExchange[]>;
  private graphqlIndex: Map<string, RecordedExchange>;

  constructor(exchanges: RecordedExchange[]) {
    this.exactIndex = new Map();
    this.normalizedIndex = new Map();
    this.graphqlIndex = new Map();

    this.buildIndexes(exchanges);
  }

  /**
   * Build lookup indexes from exchanges.
   */
  private buildIndexes(exchanges: RecordedExchange[]): void {
    for (const exchange of exchanges) {
      const request = exchange.request;

      // Build exact index
      const exactKey = createExactKey({
        method: request.method,
        pathname: request.pathname,
        query: request.query,
        body: request.body,
      });
      this.exactIndex.set(exactKey, exchange);

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

      // Build GraphQL index (for POST /graphql)
      if (request.pathname === "/graphql" && request.body) {
        const graphqlBody = request.body as GraphQLRequest;
        if (graphqlBody.operationName) {
          const variablesHash = hashObject(graphqlBody.variables);
          const graphqlKey = `${graphqlBody.operationName}:${variablesHash}`;
          this.graphqlIndex.set(graphqlKey, exchange);
        }
      }
    }

    console.log(
      `[Matcher] Built indexes: ${this.exactIndex.size} exact, ${this.normalizedIndex.size} normalized, ${this.graphqlIndex.size} GraphQL`,
    );
  }

  /**
   * Find a matching exchange for a request.
   */
  findMatch(request: MatchRequest): RecordedExchange | null {
    // 1. Try exact match first
    const exactKey = createExactKey(request);
    if (this.exactIndex.has(exactKey)) {
      console.log(`[Matcher] Exact match: ${request.method} ${request.pathname}`);
      return this.exactIndex.get(exactKey)!;
    }

    // 2. Try normalized path match
    const normalizedKey = createNormalizedKey(request);
    const candidates = this.normalizedIndex.get(normalizedKey);

    if (candidates && candidates.length > 0) {
      // For GET requests without body, return the first match
      if (request.method === "GET") {
        console.log(`[Matcher] Normalized match: ${request.method} ${request.pathname}`);
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
   * Find a matching exchange for a GraphQL request.
   */
  findGraphQLMatch(body: GraphQLRequest): RecordedExchange | null {
    if (!body.operationName) {
      console.log("[Matcher] GraphQL request without operationName");
      return null;
    }

    const variablesHash = hashObject(body.variables);
    const graphqlKey = `${body.operationName}:${variablesHash}`;

    if (this.graphqlIndex.has(graphqlKey)) {
      console.log(`[Matcher] GraphQL exact match: ${body.operationName}`);
      return this.graphqlIndex.get(graphqlKey)!;
    }

    // Try matching without variables (less strict)
    for (const [key, exchange] of this.graphqlIndex) {
      if (key.startsWith(`${body.operationName}:`)) {
        console.log(`[Matcher] GraphQL fuzzy match: ${body.operationName}`);
        return exchange;
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
  getStats(): { exactEntries: number; normalizedEntries: number; graphqlEntries: number } {
    return {
      exactEntries: this.exactIndex.size,
      normalizedEntries: this.normalizedIndex.size,
      graphqlEntries: this.graphqlIndex.size,
    };
  }
}
