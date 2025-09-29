import { expect, Page } from "@playwright/test";

/**
 * Page Object Model for søkesiden
 */
export class SokPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Verifiser at vi er på søkesiden
   */
  async verifySearchResultsPage(): Promise<void> {
    await expect(this.page).toHaveURL("/melosys/sok");
    await expect(this.page.locator("h1:has-text('Saksoversikt')")).toBeVisible();
  }

  /**
   * Verifiser at siden viser korrekt info for en gyldig id
   * @param id - en gyldig id
   */
  async verifyValidSearchResults(id: string): Promise<void> {
    await this.verifySearchResultsPage();

    await expect(this.page.locator(`h2:has-text('Resultater for f.nr./d-nr. ${id}')`)).toBeVisible();

    // Sjekk om det finnes saker eller om "ingen saker funnet" meldingen vises
    const noResultsMessage = this.page.locator(`text=Fant ingen saker knyttet til f.nr./d-nr.`);
    const firstCase = this.page.locator(".fagsak").first();

    const hasResults = await firstCase.isVisible();
    const hasNoResultsMessage = await noResultsMessage.isVisible();

    // For en gyldig ID skal enten saker vises ELLER "ingen saker funnet" meldingen
    if (!hasResults && !hasNoResultsMessage) {
      throw new Error(`For gyldig ID ${id} skal det enten være saker eller "ingen saker funnet" melding`);
    }

    // Hvis det er resultater, skal ikke "ingen saker funnet" meldingen vises
    if (hasResults) {
      await expect(noResultsMessage).not.toBeVisible();
    }
  }

  /**
   * Verifiser at siden viser korrekte søkeresultater for et organisasjonsnummer
   * @param orgNr - et gyldig organisasjonsnummer
   */
  async verifyValidOrgSearchResults(orgNr: string): Promise<void> {
    await this.verifySearchResultsPage();

    await expect(this.page.locator(`h2:has-text('Resultater for org.nr. ${orgNr}')`)).toBeVisible();
    await expect(this.page.locator(`text=Fant ingen saker knyttet til org.nr. ${orgNr}`)).not.toBeVisible();
    await expect(this.page.locator(".fagsak").first()).toBeVisible();
  }

  /**
   * Verifiser at siden viser korrekt info for en ugyldig id
   * @param id - en ugyldig id
   */
  async verifyInvalidSearchResults(id: string): Promise<void> {
    await this.verifySearchResultsPage();

    await expect(this.page.locator(`h2:has-text('Resultater for saksnummer ${id}')`)).toBeVisible();
    await expect(this.page.locator(`text=Fant ingen saker knyttet til saksnummer ${id}`)).toBeVisible();
  }
}
