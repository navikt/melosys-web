import { expect, Page } from "@playwright/test";

export const USER_ID_VALID = "30056928150";
export const USER_ID_INVALID = "INVALID123";
export const ORG_NUMBER_VALID = "999999999";

/**
 * Page Object Model (POM) for Melosys hovedside
 */
export class HovedsidePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigaer til hovedsiden
   */
  async goto(): Promise<void> {
    await this.page.goto("/", { waitUntil: "domcontentloaded", timeout: 30000 });
    await this.page.waitForSelector("h1", { state: "visible", timeout: 30000 });
  }

  /**
   * Verifiser at vi er på hovedsiden
   */
  async verifiserHovedside(): Promise<void> {
    await expect(this.page).toHaveURL("/melosys");
    await expect(this.page).toHaveTitle(/Melosys/);
    await expect(this.page.locator("h1:has-text('Mine oppgaver')")).toBeVisible();
    await expect(this.page.locator("text=/\\d+ oppgaver/")).toBeVisible();
  }

  /**
   * Klikk på "Opprett ny sak/behandling" button
   */
  async klikkOpprettNySakKnapp(): Promise<void> {
    const createButton = this.page.locator("button:has-text('Opprett ny sak/behandling')");
    await expect(createButton).toBeVisible();
    await createButton.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Søk etter en sak med gitt bruker-ID og klikk på første saken som inneholder gitt tekst
   * @param brukerId - Bruker-ID å søke etter
   * @param sakTekst - Tekst å finne i saken (f.eks. "Yrkesaktiv - Årsavregning")
   * @returns href attribute til taskens
   */
  async visSak(brukerId: string, sakTekst: string): Promise<string | null> {
    // Søk med bruker-ID for å få frem relevante saker
    await this.søk(brukerId);

    // Vent på at søkeresultatene blir lastet ved å sjekke overskriften
    await this.page.waitForSelector(`text=Resultater for f.nr./d-nr. ${brukerId}`, {
      state: "visible",
      timeout: 5000,
    });

    // Finn "Vis behandling" knappen for saken som inneholder gitt tekst
    const sakButton = this.page
      .locator(`:has-text('${sakTekst}')`)
      .locator("button:has-text('Vis behandling')")
      .first();

    // Ensure there is at least one task available
    await expect(sakButton, `No '${sakTekst}' tasks found for user ${brukerId}`).toHaveCount(1);

    await sakButton.click();
    await this.page.waitForLoadState("domcontentloaded");

    return null; // Siden vi ikke kan få href fra knappen
  }

  /**
   * Gi iput til søkefeltet og klikk på søkeknappen
   * @param input - søkestreng
   */
  async søk(input: string): Promise<void> {
    await expect(this.page.locator("form.sokeskjema")).toBeVisible();

    const searchInput = this.page.locator("form.sokeskjema input[type='text']");

    const searchInputCount = await searchInput.count();
    expect(searchInputCount > 0, "Search input field 'Søk sak:' not found").toBeTruthy();

    await searchInput.fill(input);

    const searchButton = this.page.locator("form.sokeskjema .sokeskjema__knapp button");

    const searchButtonCount = await searchButton.count();
    expect(searchButtonCount > 0, "Search button not found").toBeTruthy();

    await searchButton.click();

    await this.page.waitForLoadState("domcontentloaded");
  }
}
