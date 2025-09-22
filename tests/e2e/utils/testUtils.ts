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
    .locator(
      ".navds-error-message, .feilmelding, .skjemaelement__feilmelding, [data-testid*='error'], .navds-alert--error",
    )
    .filter({
      hasText: errorText,
    })
    .first();
  await expect(fieldError).toBeVisible();
}

/**
 * Verifiserer at en feilmelding er knyttet til et spesifikt felt
 * @param scope - Side eller locator-område å søke innenfor
 * @param fieldLabel - Label/navn på feltet
 * @param errorText - Forventet feilmeldingstekst
 */
export async function assertFieldErrorWithLabel(
  scope: Page | Locator,
  fieldLabel: string | RegExp,
  errorText: string | RegExp,
) {
  // Først verifiser at feltet eksisterer - prøv først med exact match for input/select
  let field = scope.getByLabel(fieldLabel, { exact: true }).locator("input, select, textarea").first();

  // Hvis det ikke fungerer, prøv uten exact og ta første
  const fieldCount = await field.count();
  if (fieldCount === 0) {
    field = scope.getByLabel(fieldLabel).first();
  }

  await expect(field).toBeVisible({ timeout: 5000 });

  // Så verifiser at feilmeldingen eksisterer på siden
  const fieldError = scope
    .locator(
      ".navds-error-message, .feilmelding, .skjemaelement__feilmelding, [data-testid*='error'], .navds-alert--error",
    )
    .filter({
      hasText: errorText,
    })
    .first();

  await expect(fieldError).toBeVisible();

  // Valgfritt: Sjekk om feilmeldingen er nær feltet (innenfor 3 nivåer opp i DOM)
  // Dette sikrer at feilmeldingen er visuelt knyttet til feltet
  let container = field;
  for (let i = 0; i < 3; i++) {
    container = container.locator("..");
    const errorInContainer = await container
      .locator(
        ".navds-error-message, .feilmelding, .skjemaelement__feilmelding, [data-testid*='error'], .navds-alert--error",
      )
      .filter({ hasText: errorText })
      .count();

    if (errorInContainer > 0) {
      return; // Feilmeldingen er funnet nær feltet
    }
  }

  // Hvis vi kommer hit, eksisterer feilmeldingen men er ikke visuelt knyttet til feltet
  // Vi lager en soft assertion som informerer testeren
  expect
    .soft(
      false,
      `Feilmeldingen "${errorText}" ble funnet på siden, men ser ikke ut til å være visuelt knyttet til feltet "${fieldLabel}". ` +
        `Dette kan indikere at feilmeldingen vises et annet sted enn forventet i brukergrensesnittet.`,
    )
    .toBeTruthy();
}

/**
 * Verifiserer at BARE de spesifiserte field errors er synlige (ingen ekstra)
 * @param scope - Side eller locator-område å søke innenfor
 * @param errorTexts - Array med forventede feilmeldinger
 */
export async function assertFieldErrors(scope: Page | Locator, errorTexts: (string | RegExp)[]) {
  // Hent alle synlige field errors, ekskluder feiloppsummering
  const allFieldErrors = scope
    .locator(
      ".navds-error-message, .feilmelding, .skjemaelement__feilmelding, [data-testid*='error'], .navds-alert--error",
    )
    .and(scope.locator(':not(:has-text("Følgende feil ble funnet"))'));
  const actualCount = await allFieldErrors.count();

  const actualErrors: string[] = [];
  for (let i = 0; i < actualCount; i++) {
    const text = await allFieldErrors.nth(i).textContent();
    if (text) actualErrors.push(text.trim());
  }

  // Sjekk om vi har riktig antall
  if (actualCount !== errorTexts.length) {
    const expectedStrings = errorTexts.map((e) => (typeof e === "string" ? e : e.toString()));
    const unexpected = actualErrors.filter(
      (actual) =>
        !errorTexts.some((expected) =>
          typeof expected === "string" ? actual.includes(expected) : expected.test(actual),
        ),
    );
    const missing = expectedStrings.filter(
      (expected) =>
        !actualErrors.some((actual) =>
          typeof expected === "string" ? actual.includes(expected) : new RegExp(expected).test(actual),
        ),
    );

    let errorMsg = `Feil antall feltfeil. Forventet ${errorTexts.length}, fikk ${actualCount}.`;
    errorMsg += `\nFaktiske feltfeil: ${actualErrors.map((e) => `"${e}"`).join(", ")}`;
    errorMsg += `\nForventede feltfeil: ${expectedStrings.map((e) => `"${e}"`).join(", ")}`;
    if (unexpected.length > 0) errorMsg += `\nUventede feltfeil: ${unexpected.map((e) => `"${e}"`).join(", ")}`;
    if (missing.length > 0) errorMsg += `\nManglende feltfeil: ${missing.map((e) => `"${e}"`).join(", ")}`;

    throw new Error(errorMsg);
  }

  // Verifiser hver forventet field error
  for (const errorText of errorTexts) {
    await assertFieldError(scope, errorText);
  }
}

/**
 * Verifiserer både individuelle field errors og feiloppsummering
 * @param scope - Side eller locator-område å søke innenfor
 * @param errorTexts - Array med forventede feilmeldinger
 */
export async function assertErrors(scope: Page | Locator, errorTexts: (string | RegExp)[]) {
  // Verifiser at BARE de forventede field errors er synlige
  await assertFieldErrors(scope, errorTexts);

  // Verifiser at feiloppsummeringen inneholder samme feilmeldinger
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
    const missing = expectedStrings.filter((expected) => !actualErrors.some((actual) => actual === expected));

    let errorMsg = `Feil antall feilmeldinger i oppsummering. Forventet ${errorTexts.length}, fikk ${actualCount}.`;
    errorMsg += `\nFaktiske feilmeldinger: ${actualErrors.map((e) => `"${e}"`).join(", ")}`;
    errorMsg += `\nForventede feilmeldinger: ${expectedStrings.map((e) => `"${e}"`).join(", ")}`;
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
