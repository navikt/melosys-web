/**
 * Path Normalization Utilities
 *
 * Shared between the API recorder and mock server matcher.
 * Normalizes URL paths by replacing dynamic segments (IDs, UUIDs, etc.) with placeholders.
 */

export interface PathNormalizationPattern {
  pattern: RegExp;
  replacement: string;
}

/**
 * Patterns for normalizing URL paths by replacing dynamic segments with placeholders.
 * Order matters - more specific patterns should come before generic ones.
 */
export const PATH_NORMALIZATION_PATTERNS: PathNormalizationPattern[] = [
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
export function normalizePath(pathname: string): string {
  let normalized = pathname;
  for (const { pattern, replacement } of PATH_NORMALIZATION_PATTERNS) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized;
}
