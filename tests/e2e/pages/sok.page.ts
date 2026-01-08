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
    await expect(this.page.locator(`text=Fant ingen saker knyttet til f.nr./d-nr. ${id}.`)).not.toBeVisible();

    // Verifiser at minst én sak vises (kan være mange prepopulerte saker)
    const fagsakCount = await this.page.locator(".fagsak").count();
    expect(fagsakCount, `Skal finne minst én sak for ${id}`).toBeGreaterThan(0);
  }

  /**
   * Verifiser at siden viser korrekt info for en ugyldig id
   * @param id - en ugyldig id
   */
  async verifyInvalidSearchResults(id: string): Promise<void> {
    await this.verifySearchResultsPage();

    await expect(this.page.locator(`h2:has-text('Resultater for saksnummer ${id}')`)).toBeVisible();
    await expect(this.page.locator(`text=Fant ingen saker knyttet til saksnummer ${id}.`)).toBeVisible();
  }
}
