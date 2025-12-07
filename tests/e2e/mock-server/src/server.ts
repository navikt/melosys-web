/* eslint-disable no-console */
/**
 * melosys-api Mock Server
 *
 * A lightweight Express server that plays back recorded API responses.
 * Used for running E2E tests without the real melosys-api backend.
 *
 * Usage:
 *   npm start                           # Start with default settings
 *   RECORDINGS_PATH=./recordings npm start  # Custom recordings path
 *   PORT=8080 npm start                 # Custom port
 */

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { loadRecordings, getRecordingStats } from "./loader";
import { RecordingMatcher } from "./matcher";
import { createDynamicHandler, TransformContext } from "./dynamic-values";
import { mutationTracker } from "./mutation-tracker";
import type { GraphQLRequest } from "./types";

// Methods that are considered mutations (tracked for stateful responses)
const MUTATION_METHODS = ["POST", "PUT", "DELETE", "PATCH"];

// Configuration from environment
const PORT = parseInt(process.env.PORT || "8080", 10);
const RECORDINGS_PATH = process.env.RECORDINGS_PATH || "../recordings";
const LOG_REQUESTS = process.env.LOG_REQUESTS !== "false";

// Initialize Express app
const app = express();

// Middleware
app.use(cors());

// Custom body parser that handles both JSON and primitive values (like "false", "true", numbers)
app.use(
  express.json({
    limit: "10mb",
    strict: false, // Allow primitive values like "false", "true", numbers
  }),
);

// Fallback for text/plain bodies or primitive values that JSON parser couldn't handle
app.use(express.text({ type: "*/*", limit: "10mb" }));

// Request logging middleware
if (LOG_REQUESTS) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(`[${res.statusCode}] ${req.method} ${req.path} (${duration}ms)`);
    });
    next();
  });
}

// Load recordings and create matcher
console.log(`[Server] Loading recordings from: ${RECORDINGS_PATH}`);
const exchanges = loadRecordings(RECORDINGS_PATH);
const matcher = new RecordingMatcher(exchanges);
const dynamicHandler = createDynamicHandler();

// Store recording metadata for transformations
const recordingMetadata: { recordedAt?: string } = {};
try {
  // Try to extract recordedAt from first recording
  if (exchanges.length > 0) {
    // We'll use the current time as baseline since we don't have global recordedAt
    recordingMetadata.recordedAt = new Date().toISOString();
  }
} catch {
  // Ignore metadata loading errors
}

/**
 * Health check endpoint
 */
app.get("/health", (req: Request, res: Response) => {
  const stats = getRecordingStats(RECORDINGS_PATH);
  const matcherStats = matcher.getStats();

  res.json({
    status: "ok",
    mode: "playback",
    recordings: stats,
    matcher: matcherStats,
    uptime: process.uptime(),
  });
});

/**
 * Internal E2E test data reset endpoint
 * Resets sequence tracking and mutation state for test isolation.
 */
app.post("/internal/e2e/testdata/reset", (req: Request, res: Response) => {
  console.log("[Server] Test data reset called - resetting sequence tracking");
  matcher.reset();

  // Return empty metadata - the frontend should use recorded metadata
  res.json({});
});

/**
 * Mock server state reset endpoint
 * Call this between tests to reset sequence tracking and mutation state.
 */
app.post("/__reset", (req: Request, res: Response) => {
  console.log("[Server] State reset requested");
  matcher.reset();

  const stats = matcher.getStats();
  res.json({
    ok: true,
    message: "Sequence tracking and mutation state reset",
    stats,
  });
});

/**
 * Mock server state inspection endpoint (for debugging)
 */
app.get("/__state", (req: Request, res: Response) => {
  const stats = matcher.getStats();
  const mutations = mutationTracker.getMutations();

  res.json({
    mutations: mutations.map((m) => ({
      method: m.method,
      path: m.normalizedPath,
    })),
    matcherStats: stats,
  });
});

/**
 * GraphQL endpoint handler (supports both /graphql and /graphql/)
 */
const graphqlHandler = (req: Request, res: Response) => {
  const body = req.body as GraphQLRequest;

  if (!body || !body.query) {
    return res.status(400).json({
      errors: [{ message: "Missing GraphQL query" }],
    });
  }

  const match = matcher.findGraphQLMatch(body);

  if (!match) {
    console.warn(`[Server] No GraphQL recording for: ${body.operationName || "anonymous"}`);
    return res.status(404).json({
      errors: [
        {
          message: `No recording found for GraphQL operation: ${body.operationName || "anonymous"}`,
          hint: "Run tests in RECORD mode to capture this query",
        },
      ],
    });
  }

  // Transform dynamic values in response
  const context: TransformContext = {
    requestParams: {},
    requestQuery: req.query as Record<string, string>,
    requestBody: body,
    recordedAt: recordingMetadata.recordedAt,
  };

  const transformedResponse = dynamicHandler.transform(match.response, context);

  return res.status(transformedResponse.status).json(transformedResponse.body);
};

// Register GraphQL handler for both paths (with and without trailing slash)
app.post("/graphql", graphqlHandler);
app.post("/graphql/", graphqlHandler);

/**
 * Catch-all API endpoint handler
 */
app.all("/api/*", (req: Request, res: Response) => {
  // Track mutations for stateful response selection
  if (MUTATION_METHODS.includes(req.method)) {
    mutationTracker.recordMutation(req.method, req.path, req.body);
  }

  const matchRequest = {
    method: req.method,
    pathname: req.path,
    query: req.query as Record<string, string>,
    body: req.body,
  };

  const match = matcher.findMatch(matchRequest);

  if (!match) {
    console.warn(`[Server] No recording for: ${req.method} ${req.path}`);
    return res.status(404).json({
      error: "No recording found",
      method: req.method,
      path: req.path,
      hint: "Run tests in RECORD mode to capture this request",
    });
  }

  // Transform dynamic values in response
  const context: TransformContext = {
    requestParams: req.params,
    requestQuery: req.query as Record<string, string>,
    requestBody: req.body,
    recordedAt: recordingMetadata.recordedAt,
  };

  const transformedResponse = dynamicHandler.transform(match.response, context);

  // Set response headers
  const headers = transformedResponse.headers || {};
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== "content-length") {
      res.setHeader(key, value);
    }
  }

  return res.status(transformedResponse.status).json(transformedResponse.body);
});

/**
 * 404 handler for unmatched routes
 */
app.use((req: Request, res: Response) => {
  console.warn(`[Server] Unhandled route: ${req.method} ${req.path}`);
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.method} ${req.path} not handled by mock server`,
  });
});

/**
 * Error handler
 */
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`[Server] Error handling ${req.method} ${req.path}:`, err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           melosys-api Mock Server (Playback Mode)          ║
╠════════════════════════════════════════════════════════════╣
║  Port:        ${PORT.toString().padEnd(43)}║
║  Recordings:  ${RECORDINGS_PATH.padEnd(43)}║
║  Exchanges:   ${exchanges.length.toString().padEnd(43)}║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[Server] SIGTERM received, shutting down...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("[Server] SIGINT received, shutting down...");
  process.exit(0);
});
