/**
 * Common utility functions for e2e tests
 */

import { expect, Locator, Page } from "@playwright/test";

/**
 * CI timeout multiplier - same as playwright.config.ts
 * CI environments are slower so we need longer timeouts
 */
const IS_CI = !!process.env.CI;
const CI_TIMEOUT_MULTIPLIER = IS_CI ? 3 : 1;

/**
 * 30 sekunder for komplekse tester (45 sekunder i CI)
 * Note: This must be >= the default test timeout in playwright.config.ts
 * to actually extend the timeout for complex tests.
 */
export const TIMEOUT_FOR_COMPLEX_TESTS = 30000 * CI_TIMEOUT_MULTIPLIER;

/**
 * Generisk funksjon for å sette dato i et datofelt
 * @param feltNavn - Navn/label på datofeltet
 * @param dato - Dato i norsk format (DD.MM.YYYY)
 * @param scope - Page eller Locator å søke innenfor
 */
export async function setDatoFelt(feltNavn: string, dato: string, scope: Page | Locator): Promise<void> {
  const datoInput = scope.getByRole("textbox", { name: feltNavn });
  const count = await datoInput.count();
  expect(count, `Datofelt "${feltNavn}" skal finnes`).toBeGreaterThan(0);
  expect(count, `Datofelt "${feltNavn}" skal være unik - bruk smalere scope`).toBe(1);

  await expect(datoInput, `Datofelt "${feltNavn}" skal være synlig`).toBeVisible();
  await datoInput.fill(dato);
}

/**
 * Finn en knapp basert på label/navn og verifiser at den finnes og er unik
 * @param label - Knappens label/navn (synlig tekst eller aria-label)
 * @param scope - Page eller Locator å søke innenfor
 * @returns Locator for knappen (garantert å finnes og være unik)
 */
export async function finnKnapp(label: string, scope: Page | Locator): Promise<Locator> {
  const knapp = scope.getByRole("button", { name: label });
  const count = await knapp.count();

  expect(count, `Knapp "${label}" skal finnes`).toBeGreaterThan(0);
  expect(count, `Knapp "${label}" skal være unik - bruk smalere scope`).toBe(1);

  return knapp;
}

/**
 * Finn en checkbox basert på label/navn og verifiser at den finnes og er unik
 * @param label - Checkboxens label/navn (synlig tekst eller aria-label)
 * @param scope - Page eller Locator å søke innenfor
 * @returns Locator for checkboxen (garantert å finnes og være unik)
 */
export async function finnCheckbox(label: string, scope: Page | Locator): Promise<Locator> {
  const checkbox = scope.getByRole("checkbox", { name: label });
  const count = await checkbox.count();

  expect(count, `Checkbox "${label}" skal finnes`).toBeGreaterThan(0);
  expect(count, `Checkbox "${label}" skal være unik - bruk smalere scope`).toBe(1);

  return checkbox;
}

/**
 * Finn en checkbox-gruppe (fieldset med legend) og returner scoped locator
 * @param legend - Tekst i legend-elementet (kan være delvis match)
 * @param scope - Page eller Locator å søke innenfor
 * @returns Locator for fieldset-en (scoped til gruppen)
 */
export async function finnCheckboxGroup(legend: string, scope: Page | Locator): Promise<Locator> {
  const fieldset = scope.locator("fieldset").filter({
    has: scope.locator(`legend:has-text("${legend}")`),
  });
  const count = await fieldset.count();

  expect(count, `Checkbox-gruppe "${legend}" skal finnes`).toBeGreaterThan(0);
  expect(count, `Checkbox-gruppe "${legend}" skal være unik - bruk smalere scope`).toBe(1);

  return fieldset;
}

/**
 * Finn en radioknapp basert på label/navn og verifiser at den finnes og er unik
 * @param label - Radioknappens label/navn (synlig tekst eller aria-label)
 * @param scope - Page eller Locator å søke innenfor
 * @param timeout - Valgfri timeout i ms for å vente på at elementet skal dukke opp
 * @returns Locator for radioknappen (garantert å finnes og være unik)
 */
export async function finnRadioknapp(label: string, scope: Page | Locator, timeout?: number): Promise<Locator> {
  const radio = scope.getByRole("radio", { name: label });

  // Verifiser at radioknappen er synlig (med valgfri timeout)
  const options = timeout ? { timeout } : undefined;
  await expect(radio, `Radioknapp "${label}" skal være synlig`).toBeVisible(options);

  const count = await radio.count();
  expect(count, `Radioknapp "${label}" skal være unik - bruk smalere scope`).toBe(1);

  return radio;
}

/**
 * Finn og velg en radioknapp
 * @param navn - Navn/label på radioknappen
 * @param scope - Page eller Locator å søke innenfor
 * @param timeout - Valgfri timeout i ms for å vente på at elementet skal dukke opp
 */
export async function velgRadioknapp(navn: string, scope: Page | Locator, timeout?: number): Promise<void> {
  const radio = await finnRadioknapp(navn, scope, timeout);

  const isChecked = await radio.isChecked();
  if (!isChecked) {
    await radio.check();
  }
}

/**
 * Generisk funksjon for å velge verdi fra en combobox/select
 * @param navn - Navn/label på combobox/select
 * @param verdi - Verdien som skal velges (label)
 * @param scope - Page eller Locator å søke innenfor
 */
export async function velgFraListe(navn: string, verdi: string, scope: Page | Locator): Promise<void> {
  const select = scope.getByRole("combobox", { name: navn });
  const count = await select.count();
  expect(count, `Combobox "${navn}" skal finnes`).toBeGreaterThan(0);
  expect(count, `Combobox "${navn}" skal være unik - bruk smalere scope`).toBe(1);

  await expect(select, `Combobox "${navn}" skal være synlig`).toBeVisible();
  await select.selectOption({ label: verdi });
}

/**
 * Extended Locator interface with custom _sakId property
 */
export interface LocatorWithSakId extends Locator {
  _sakId?: string;
}

/**
 * Hent sakId fra locator
 * @param sak - Sak-locator
 * @returns sakId eller "ukjent"
 *
 * Note: This relies on custom _sakId property set by setSakId() in OpprettNySakPage
 */
export function getSaksnummerFraLocator(sak: Locator): string {
  return (sak as LocatorWithSakId)._sakId || "ukjent";
}

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

const ERROR_SELECTORS =
  ".navds-error-message, .feilmelding, .skjemaelement__feilmelding, [data-testid*='error'], .navds-alert--error";

/**
 * Verifiserer at en spesifikk field error er synlig
 * @param scope - Side eller locator-område å søke innenfor
 * @param errorText - Forventet feilmeldingstekst
 */
export async function assertFieldError(scope: Page | Locator, errorText: string | RegExp) {
  const fieldError = scope.locator(ERROR_SELECTORS).filter({ hasText: errorText }).first();
  await expect(fieldError, `Fant ikke feilmedingen: ${errorText}`).toBeVisible();
}

/**
 * Verifiserer at BARE de spesifiserte field errors er synlige (ingen ekstra)
 * @param scope - Side eller locator-område å søke innenfor
 * @param errorTexts - Array med forventede feilmeldinger
 */
export async function assertFieldErrors(scope: Page | Locator, errorTexts: (string | RegExp)[]) {
  // Hent alle synlige field errors, ekskluder feiloppsummering
  const allFieldErrors = scope
    .locator(ERROR_SELECTORS)
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
    const missing = expectedStrings.filter((expected) => !actualErrors.some((actual) => actual.includes(expected)));

    let errorMsg = `Feil antall feltfeil. Forventet ${errorTexts.length}, fikk ${actualCount}.`;
    errorMsg += `\nFaktiske feltfeil: ${actualErrors.map((e) => `"${e}"`).join(", ")}`;
    errorMsg += `\nForventede feltfeil: ${expectedStrings.map((e) => `"${e}"`).join(", ")}`;
    if (unexpected.length > 0) errorMsg += `\nUventede feltfeil: ${unexpected.map((e) => `"${e}"`).join(", ")}`;
    if (missing.length > 0) errorMsg += `\nManglende feltfeil: ${missing.map((e) => `"${e}"`).join(", ")}`;

    expect(actualCount, errorMsg).toBe(errorTexts.length);
  }

  // Verifiser hver forventet field error
  for (const errorText of errorTexts) {
    await assertFieldError(scope, errorText);
  }
}

/**
 * Verifiserer både individuelle field errors og feiloppsummering
 * @param scope - Side eller locator-område å søke innenfor
 * @param errorTexts - Array med forventede feilmeldinger. Tom array betyr ingen feil forventes.
 */
export async function assertErrors(scope: Page | Locator, errorTexts: (string | RegExp)[]) {
  // Hvis tom array, sjekk at INGEN feilmeldinger vises
  if (errorTexts.length === 0) {
    const allFieldErrors = scope
      .locator(ERROR_SELECTORS)
      .and(scope.locator(':not(:has-text("Følgende feil ble funnet"))'));

    // Sjekk også for tekniske feilmeldinger
    const tekniskeFeil = scope.getByText(/Teknisk feil/);

    const actualCount = await allFieldErrors.count();
    const tekniskFeilCount = await tekniskeFeil.count();

    if (actualCount > 0 || tekniskFeilCount > 0) {
      const actualErrors: string[] = [];
      const seenErrors = new Set<string>();

      // Samle vanlige feilmeldinger
      for (let i = 0; i < actualCount; i++) {
        const text = await allFieldErrors.nth(i).textContent();
        if (text) {
          const cleanText = text.trim().replace(/^Feil/, "").trim();
          if (cleanText && !seenErrors.has(cleanText)) {
            actualErrors.push(cleanText);
            seenErrors.add(cleanText);
          }
        }
      }

      // Samle tekniske feilmeldinger
      for (let i = 0; i < tekniskFeilCount; i++) {
        const text = await tekniskeFeil.nth(i).textContent();
        if (text) {
          const cleanText = text.trim();
          if (cleanText && !seenErrors.has(cleanText)) {
            actualErrors.push(cleanText);
            seenErrors.add(cleanText);
          }
        }
      }

      expect(
        actualErrors.length,
        `Uventede feilmeldinger funnet:\n${actualErrors.map((e, i) => `  ${i + 1}. ${e}`).join("\n")}`,
      ).toBe(0);
    }

    // Sjekk også at det ikke er feiloppsummering
    const errorBox = scope.getByText("Følgende feil ble funnet");
    if (await errorBox.isVisible()) {
      // Hent innholdet i feiloppsummeringen for å vise hvilke feil som faktisk er der
      const summaryBox = errorBox.locator("..").first();
      const errorListItems = summaryBox.locator("li");
      const summaryErrorCount = await errorListItems.count();

      if (summaryErrorCount > 0) {
        const summaryErrors: string[] = [];
        for (let i = 0; i < summaryErrorCount; i++) {
          const text = await errorListItems.nth(i).textContent();
          if (text) summaryErrors.push(text.trim());
        }
        expect(
          summaryErrorCount,
          `Uventet "Følgende feil ble funnet" melding: ${summaryErrors.map((e) => `"${e}"`).join(", ")}`,
        ).toBe(0);
      } else {
        expect(false, 'Uventet "Følgende feil ble funnet" melding: (tom oppsummering)').toBe(true);
      }
    }

    return; // Ingen feil funnet, som forventet
  }

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

    expect(actualCount, errorMsg).toBe(errorTexts.length);
  }

  // Verifiser hver forventet feilmelding
  for (const errorText of errorTexts) {
    const errorItem = summaryBox.getByText(errorText);
    await expect(errorItem).toBeVisible();
  }
}

/**
 * Verifiserer at en ny behandling ble opprettet vellykket ved å sjekke:
 * 1. Ingen feilmeldinger på ny-sak-siden
 * 2. Navigasjon til hovedsiden
 * 3. Ingen feilmeldinger på hovedsiden
 * @param page - Playwright page objekt
 */
export async function assertNyBehandlingOpprettet(page: Page) {
  // Sjekk først om vi fortsatt er på ny-sak-siden og har feilmeldinger
  if (page.url().includes("/opprettnysak")) {
    // Vi er fortsatt på ny-sak-siden, sjekk for feilmeldinger
    await assertErrors(page, []);
  }

  // Vent på at navigasjonen til hovedsiden fullføres
  await page.waitForURL(/\/melosys\/$/);

  // Verifiser at det ikke vises feilmeldinger på hovedsiden
  await assertErrors(page, []);
}
