import { expect, Page } from "@playwright/test";

/**
 * Page Object Model for the search results page
 */
export class SearchResultsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Verify that we are on the search results page
   */
  async verifySearchResultsPage(): Promise<void> {
    await expect(this.page).toHaveURL("/melosys/sok");
    await expect(this.page.locator("h1:has-text('Saksoversikt')")).toBeVisible();
  }

  /**
   * Verify search results for a valid ID
   * @param id - The valid ID that was searched for
   */
  async verifyValidSearchResults(id: string): Promise<void> {
    // Verify that we're on the search results page
    await this.verifySearchResultsPage();

    await expect(this.page.locator(`h2:has-text('Resultater for f.nr./d-nr. ${id}')`)).toBeVisible();

    await expect(this.page.locator(`text=Fant ingen saker knyttet til f.nr./d-nr. ${id}`)).not.toBeVisible();

    await expect(this.page.locator(".fagsak")).toBeVisible();
  }

  /**
   * Verify search results for an invalid ID
   * @param id - The invalid ID that was searched for
   */
  async verifyInvalidSearchResults(id: string): Promise<void> {
    // Verify that we're on the search results page
    await this.verifySearchResultsPage();

    await expect(this.page.locator(`h2:has-text('Resultater for saksnummer ${id}')`)).toBeVisible();

    await expect(this.page.locator(`text=Fant ingen saker knyttet til saksnummer ${id}`)).toBeVisible();
  }
}
