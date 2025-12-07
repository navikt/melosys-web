/**
 * Type definitions for the mock server.
 * These types mirror the recording format from recorder.ts.
 */

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

export interface MatchRequest {
  method: string;
  pathname: string;
  query: Record<string, string>;
  body: unknown;
}

export interface GraphQLRequest {
  query: string;
  operationName?: string;
  variables?: Record<string, unknown>;
}

/**
 * Mutation context for stateful response selection.
 * Tracks which mutations preceded this exchange during recording.
 */
export interface MutationContext {
  /** Sequence number within the test (0-indexed) */
  sequenceNumber: number;
  /** Normalized paths of mutations that occurred before this exchange */
  precedingMutations: MutationRef[];
}

export interface MutationRef {
  method: string;
  pathPattern: string; // Normalized path
}

/**
 * Extended exchange with mutation context for stateful matching.
 */
export interface StatefulExchange extends RecordedExchange {
  mutationContext?: MutationContext;
}
