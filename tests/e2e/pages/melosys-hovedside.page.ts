import { expect, Page } from "@playwright/test";

export const USER_ID_VALID = "30056928150";
export const USER_ID_INVALID = "INVALID123";

/**
 * Page Object Model for Melosys hovedside
 */
export class MelosysHovedsidePage {
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
  async verifyMainPage(): Promise<void> {
    await expect(this.page).toHaveURL("/melosys");
    await expect(this.page).toHaveTitle(/Melosys/);
    await expect(this.page.locator("h1:has-text('Mine oppgaver')")).toBeVisible();
    await expect(this.page.locator("text=/\\d+ oppgaver/")).toBeVisible();
  }

  /**
   * Finn "Opprett ny sak/behandling" button
   */
  getCreateNewCaseButton() {
    return this.page.locator("button:has-text('Opprett ny sak/behandling')");
  }

  /**
   * Klikk på "Opprett ny sak/behandling" button
   */
  async clickCreateNewCaseButton(): Promise<void> {
    const createButton = this.getCreateNewCaseButton();
    await expect(createButton).toBeVisible();
    await createButton.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Finn den første saken i sakslista
   */
  getFirstTaskLink() {
    return this.page.locator(".behandlingOppgave__link").first();
  }

  /**
   * Klikk på den første saken in sakslista
   * @returns href attribute til taskens
   */
  async clickFirstTaskLink(): Promise<string | null> {
    const taskLink = this.getFirstTaskLink();

    // Ensure there is at least one task available
    await expect(taskLink, "No tasks available to test").toHaveCount(1);

    const taskLinkHref = await taskLink.getAttribute("href");
    await taskLink.click();
    await this.page.waitForLoadState("domcontentloaded");

    return taskLinkHref;
  }

  /**
   * Gi iput til søkefeltet og klikk på søkeknappen
   * @param input - søkestreng
   */
  async search(input: string): Promise<void> {
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
