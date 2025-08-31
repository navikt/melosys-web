/**
 * Common utility functions for e2e tests
 */

import { expect, Locator, Page } from "@playwright/test";

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
    .replace(/'/g, "") // Remove apostrophes
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with a single hyphen
    .trim(); // Trim leading/trailing whitespace
}

/**
 * Verifiserer at feiloppsummeringen inneholder nøyaktig de forventede feilmeldingene
 * @param scope - Side eller locator-område å søke innenfor
 * @param errorTexts - Array med forventede feilmeldinger
 */
export async function assertSummaryErrors(scope: Page | Locator, errorTexts: (string | RegExp)[]) {
  const errorBox = scope.getByText("Følgende feil ble funnet");
  await expect(errorBox).toBeVisible();

  // Finn oppsummeringsboksen og tell antall list items
  const summaryBox = errorBox.locator("..").first(); // Parent element
  const errorListItems = summaryBox.locator("li");
  const actualCount = await errorListItems.count();

  // Verifiser at vi har riktig antall feilmeldinger
  expect(actualCount).toBe(errorTexts.length);

  // Verifiser hver forventet feilmelding
  for (const errorText of errorTexts) {
    const errorItem = summaryBox.getByText(errorText);
    await expect(errorItem).toBeVisible();
  }
}
