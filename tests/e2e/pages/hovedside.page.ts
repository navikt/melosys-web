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
    await expect(
      this.page.locator("h1:has-text('Mine oppgaver')"),
      "Heading 'Mine oppgaver' skal være synlig",
    ).toBeVisible();
    await expect(this.page.locator("text=/\\d+ oppgaver/"), "Oppgaveteller skal være synlig").toBeVisible();
  }

  /**
   * Verifiser at "Opprett ny sak/behandling" button er synlig
   */
  async verifiserOpprettNySakKnapp(): Promise<void> {
    const createButton = this.page.locator("button:has-text('Opprett ny sak/behandling')");
    await expect(createButton, "Knapp 'Opprett ny sak/behandling' skal være synlig").toBeVisible();
  }

  /**
   * Klikk på "Opprett ny sak/behandling" button
   */
  async klikkOpprettNySakKnapp(): Promise<void> {
    const createButton = this.page.locator("button:has-text('Opprett ny sak/behandling')");
    await expect(createButton, "Knapp 'Opprett ny sak/behandling' skal være synlig").toBeVisible();
    await createButton.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Gi iput til søkefeltet og klikk på søkeknappen
   * @param input - søkestreng
   */
  async søk(input: string): Promise<void> {
    await expect(this.page.locator("form.sokeskjema"), "Søkeskjema skal være synlig").toBeVisible();

    const searchInput = this.page.locator("form.sokeskjema input[type='text']");

    const searchInputCount = await searchInput.count();
    expect(searchInputCount > 0, "Søkefeltet 'Søk sak:' ble ikke funnet").toBeTruthy();

    await searchInput.fill(input);

    const searchButton = this.page.locator("form.sokeskjema .sokeskjema__knapp button");

    const searchButtonCount = await searchButton.count();
    expect(searchButtonCount > 0, "Søkeknappen ble ikke funnet").toBeTruthy();

    // Wait for search API response to ensure recording captures it (prevents race condition)
    await Promise.all([
      this.page.waitForResponse((resp) => resp.url().includes("/api/fagsaker/sok")),
      searchButton.click(),
    ]);

    await this.page.waitForLoadState("domcontentloaded");
  }
}
