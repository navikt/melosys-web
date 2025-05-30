import { expect, Page } from "@playwright/test";

export const USER_ID_VALID = "30056928150";
export const USER_ID_INVALID = "INVALID123";

/**
 * Page Object Model for the main page
 */
export class MainPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the main page
   */
  async goto(): Promise<void> {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Verify that we are on the main page
   */
  async verifyMainPage(): Promise<void> {
    await expect(this.page).toHaveURL("/melosys");
    await expect(this.page).toHaveTitle(/Melosys/);
    await expect(this.page.locator("h1:has-text('Mine oppgaver')")).toBeVisible();
    await expect(this.page.locator("text=/\\d+ oppgaver/")).toBeVisible();
  }

  /**
   * Get the "Opprett ny sak/behandling" button
   */
  getCreateNewCaseButton() {
    return this.page.locator("button:has-text('Opprett ny sak/behandling')");
  }

  /**
   * Click the "Opprett ny sak/behandling" button
   */
  async clickCreateNewCaseButton(): Promise<void> {
    const createButton = this.getCreateNewCaseButton();
    await expect(createButton).toBeVisible();
    await createButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Get the first task link
   */
  getFirstTaskLink() {
    return this.page.locator(".behandlingOppgave__link").first();
  }

  /**
   * Click on the first task link
   * @returns The href attribute of the clicked task link
   */
  async clickFirstTaskLink(): Promise<string | null> {
    const taskLink = this.getFirstTaskLink();

    // Ensure there is at least one task available
    await expect(taskLink, "No tasks available to test").toHaveCount(1);

    // Get the taskLink's href attribute
    const taskLinkHref = await taskLink.getAttribute("href");

    // Click on the task
    await taskLink.click();

    // Wait for navigation to complete
    await this.page.waitForLoadState("networkidle");

    return taskLinkHref;
  }

  /**
   * Search for an ID
   * @param id - The ID to search for
   */
  async search(id: string): Promise<void> {
    // Check that the search form is visible
    await expect(this.page.locator("form.sokeskjema")).toBeVisible();

    // Find the search input field and enter the search term
    const searchInput = this.page.locator("form.sokeskjema input[type='text']");

    // If the search input is not found, it's an error
    const searchInputCount = await searchInput.count();
    expect(searchInputCount > 0, "Search input field 'Søk sak:' not found").toBeTruthy();

    // Fill the search input with the provided ID
    await searchInput.fill(id);

    // Find the search button and click it
    const searchButton = this.page.locator("form.sokeskjema .sokeskjema__knapp button");

    // If the search button is not found, it's an error
    const searchButtonCount = await searchButton.count();
    expect(searchButtonCount > 0, "Search button not found").toBeTruthy();

    // Click the search button
    await searchButton.click();

    // Wait for the search results to load
    await this.page.waitForLoadState("networkidle");
  }
}
