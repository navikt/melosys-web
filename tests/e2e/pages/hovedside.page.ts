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
   * Naviger til hovedsiden og vent på at den er ferdig lastet
   */
  async goto(): Promise<void> {
    await this.page.goto("/", { waitUntil: "domcontentloaded" });
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
   * Verifiser at "Opprett ny sak/behandling" knapp er synlig
   */
  async verifiserOpprettNySakKnapp(): Promise<void> {
    await expect(this.page.locator("button:has-text('Opprett ny sak/behandling')")).toBeVisible();
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

    // Finn "Vis behandling" knappen for saken som inneholder gitt tekst og som er aktiv
    // Vi ser etter saker som har "Behandlingen pågår" status for å sikre at de kan sende brev
    const aktivSakButton = this.page
      .locator(".fagsak")
      .filter({ hasText: sakTekst })
      .filter({ hasText: "Behandlingen pågår" })
      .locator("button:has-text('Vis behandling')")
      .first();

    // Hvis vi ikke finner aktive saker, prøv å finne opprettede saker
    const opprettetSakButton = this.page
      .locator(".fagsak")
      .filter({ hasText: sakTekst })
      .filter({ hasText: "Behandlingen er opprettet" })
      .locator("button:has-text('Vis behandling')")
      .first();

    // Prøv først aktive saker, deretter opprettede saker
    let sakButton = aktivSakButton;
    const aktivSakCount = await aktivSakButton.count();

    if (aktivSakCount === 0) {
      sakButton = opprettetSakButton;
      await expect(
        sakButton,
        `Fant ingen aktive eller opprettede '${sakTekst}' saker for bruker ${brukerId}`,
      ).toHaveCount(1);
    }

    await sakButton.click();
    await this.page.waitForLoadState("domcontentloaded");

    return null;
  }

  /**
   * Gi iput til søkefeltet og klikk på søkeknappen
   * @param input - søkestreng
   */
  async søk(input: string): Promise<void> {
    await expect(this.page.locator("form.sokeskjema")).toBeVisible();

    const searchInput = this.page.locator("form.sokeskjema input[type='text']");

    const searchInputCount = await searchInput.count();
    expect(searchInputCount > 0, "Søkefeltet 'Søk sak:' ble ikke funnet").toBeTruthy();

    await searchInput.fill(input);

    const searchButton = this.page.locator("form.sokeskjema .sokeskjema__knapp button");

    const searchButtonCount = await searchButton.count();
    expect(searchButtonCount > 0, "Søkeknappen ble ikke funnet").toBeTruthy();

    await searchButton.click();

    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Vent på at søkeresultater vises for gitt bruker-ID
   * @param userID - Bruker f.nr./d-nr. som det søkes på
   */
  async ventPåSøkeresultat(userID: string): Promise<void> {
    await this.page.waitForSelector(`text=Resultater for f.nr./d-nr. ${userID}`, {
      state: "visible",
    });
  }

  /**
   * Utfør søk og vent på resultater
   * @param userID - Bruker f.nr./d-nr. som det søkes på
   */
  async søkOgVentPåResultat(userID: string): Promise<void> {
    await this.søk(userID);
    await this.ventPåSøkeresultat(userID);
  }
}
