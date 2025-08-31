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
/**
 * Verifiserer at en spesifikk field error er synlig
 * @param scope - Side eller locator-område å søke innenfor
 * @param errorText - Forventet feilmeldingstekst
 */
export async function assertFieldError(scope: Page | Locator, errorText: string | RegExp) {
  const fieldError = scope
    .locator('.feilmelding, [class*="error"]')
    .filter({
      hasText: errorText,
    })
    .first();
  await expect(fieldError).toBeVisible();
}

export async function assertSummaryErrors(scope: Page | Locator, errorTexts: (string | RegExp)[]) {
  const errorBox = scope.getByText("Følgende feil ble funnet");
  await expect(errorBox).toBeVisible();

  // Finn oppsummeringsboksen og hent alle faktiske feilmeldinger
  const summaryBox = errorBox.locator("..").first(); // Parent element
  const errorListItems = summaryBox.locator("li");
  const actualCount = await errorListItems.count();

  // Hent teksten fra alle faktiske feilmeldinger
  const actualErrors: string[] = [];
  for (let i = 0; i < actualCount; i++) {
    const text = await errorListItems.nth(i).textContent();
    if (text) actualErrors.push(text.trim());
  }

  // Sjekk om vi har riktig antall
  if (actualCount !== errorTexts.length) {
    const expectedStrings = errorTexts.map((e) => (typeof e === "string" ? e : e.toString()));
    const unexpected = actualErrors.filter(
      (actual) =>
        !errorTexts.some((expected) => (typeof expected === "string" ? actual === expected : expected.test(actual))),
    );
    const missing = expectedStrings.filter(
      (expected) =>
        !actualErrors.some((actual) =>
          typeof expected === "string" ? actual === expected : new RegExp(expected).test(actual),
        ),
    );

    let errorMsg = `Feil antall feilmeldinger i oppsummering. Forventet ${errorTexts.length}, fikk ${actualCount}.`;
    if (unexpected.length > 0) errorMsg += `\nUventede feilmeldinger: ${unexpected.map((e) => `"${e}"`).join(", ")}`;
    if (missing.length > 0) errorMsg += `\nManglende feilmeldinger: ${missing.map((e) => `"${e}"`).join(", ")}`;

    throw new Error(errorMsg);
  }

  // Verifiser hver forventet feilmelding
  for (const errorText of errorTexts) {
    const errorItem = summaryBox.getByText(errorText);
    await expect(errorItem).toBeVisible();
  }
}
