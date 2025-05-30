/**
 * Common utility functions for e2e tests
 */

/**
 * Sanitizes a filename by replacing characters that are invalid in file paths
 * with safe alternatives.
 *
 * @param filename - The filename to sanitize
 * @returns A sanitized filename that can be safely used in file paths
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[/\\?%*:|"<>]/g, "-") // Replace common invalid filename chars with hyphens
    .replace(/[']/g, "") // Remove apostrophes
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with a single hyphen
    .trim(); // Trim leading/trailing whitespace
}
