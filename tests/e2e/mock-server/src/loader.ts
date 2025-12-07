/* eslint-disable no-console */
/**
 * Recording Loader
 *
 * Loads all recorded API responses from the recordings directory.
 * Supports both individual test recordings and shared recordings.
 */

import { readdirSync, readFileSync, existsSync, statSync } from "fs";
import { join, extname } from "path";
import type { Recording, RecordedExchange } from "./types";

/**
 * Recursively find all JSON files in a directory.
 */
function findJsonFiles(dir: string): string[] {
  const files: string[] = [];

  if (!existsSync(dir)) {
    return files;
  }

  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findJsonFiles(fullPath));
    } else if (extname(entry) === ".json" && entry !== "metadata.json" && entry !== "index.json") {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Parse a recording file and return the exchanges.
 */
function parseRecordingFile(filePath: string): RecordedExchange[] {
  try {
    const content = readFileSync(filePath, "utf-8");
    const recording: Recording = JSON.parse(content);

    if (!recording.exchanges || !Array.isArray(recording.exchanges)) {
      console.warn(`[Loader] Invalid recording format in ${filePath}`);
      return [];
    }

    return recording.exchanges;
  } catch (error) {
    console.error(`[Loader] Failed to parse ${filePath}:`, error);
    return [];
  }
}

/**
 * Load all recordings from the recordings directory.
 * Returns a flat array of all exchanges from all recording files.
 */
export function loadRecordings(recordingsPath: string): RecordedExchange[] {
  const exchanges: RecordedExchange[] = [];

  // Load shared recordings first (higher priority for common endpoints like kodeverk)
  const sharedPath = join(recordingsPath, "shared");
  if (existsSync(sharedPath)) {
    const sharedFiles = findJsonFiles(sharedPath);
    console.log(`[Loader] Loading ${sharedFiles.length} shared recording files`);

    for (const file of sharedFiles) {
      const fileExchanges = parseRecordingFile(file);
      exchanges.push(...fileExchanges);
    }
  }

  // Load spec recordings
  const specsPath = join(recordingsPath, "specs");
  if (existsSync(specsPath)) {
    const specFiles = findJsonFiles(specsPath);
    console.log(`[Loader] Loading ${specFiles.length} spec recording files`);

    for (const file of specFiles) {
      const fileExchanges = parseRecordingFile(file);
      exchanges.push(...fileExchanges);
    }
  }

  // Note: We do NOT deduplicate here because the matcher supports sequence-based matching.
  // When the same request is made multiple times in a test (e.g., GET before and after a POST),
  // we need to preserve all responses so the matcher can return them in order.

  console.log(`[Loader] Loaded ${exchanges.length} exchanges (preserving duplicates for sequence matching)`);

  return exchanges;
}

// Note: deduplicateExchanges was removed to support sequence-based matching.
// The matcher now handles duplicate requests by returning responses in recorded order.

/**
 * Load recording statistics for health endpoint.
 */
export function getRecordingStats(recordingsPath: string): {
  totalFiles: number;
  totalExchanges: number;
  sharedFiles: number;
  specFiles: number;
} {
  const sharedPath = join(recordingsPath, "shared");
  const specsPath = join(recordingsPath, "specs");

  const sharedFiles = existsSync(sharedPath) ? findJsonFiles(sharedPath).length : 0;
  const specFiles = existsSync(specsPath) ? findJsonFiles(specsPath).length : 0;

  const exchanges = loadRecordings(recordingsPath);

  return {
    totalFiles: sharedFiles + specFiles,
    totalExchanges: exchanges.length,
    sharedFiles,
    specFiles,
  };
}
