import { expect, Page } from "@playwright/test";
import { UI_TEXTS } from "../config/ui-texts";

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

  private get createButton() {
    return this.page.getByRole("button", { name: UI_TEXTS.BUTTONS.OPPRETT_NY_SAK });
  }

  private get searchForm() {
    return this.page.locator("form.sokeskjema");
  }

  private get searchInput() {
    return this.searchForm.locator("input[type='text']");
  }

  private get searchButton() {
    return this.searchForm.locator(".sokeskjema__knapp button");
  }

  /**
   * Naviger til hovedsiden og vent på at den er ferdig lastet
   */
  async goto(): Promise<void> {
    await this.page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(this.page).toHaveURL("/melosys");
    await expect(this.page).toHaveTitle(/Melosys/);
    await expect(
      this.page.getByRole("heading", { name: UI_TEXTS.HEADINGS.MINE_OPPGAVER, level: 1 }),
      `Heading '${UI_TEXTS.HEADINGS.MINE_OPPGAVER}' skal være synlig`,
    ).toBeVisible();
    await expect(this.page.locator("text=/\\d+ oppgaver/"), "Oppgaveteller skal være synlig").toBeVisible();
  }

  /**
   * Verifiser at "Opprett ny sak/behandling" button er synlig
   */
  async verifiserOpprettNySakKnapp(): Promise<void> {
    await expect(this.createButton, `Knapp '${UI_TEXTS.BUTTONS.OPPRETT_NY_SAK}' skal være synlig`).toBeVisible();
  }

  /**
   * Klikk på "Opprett ny sak/behandling" button
   */
  async klikkOpprettNySakKnapp(): Promise<void> {
    await expect(this.createButton, `Knapp '${UI_TEXTS.BUTTONS.OPPRETT_NY_SAK}' skal være synlig`).toBeVisible();
    await this.createButton.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Gi input til søkefeltet og klikk på søkeknappen
   * @param input - søkestreng
   */
  async søk(input: string): Promise<void> {
    await expect(this.searchForm, "Søkeskjema skal være synlig").toBeVisible();
    await expect(this.searchInput, "Søkefeltet skal være synlig").toBeVisible();
    await this.searchInput.fill(input);
    await expect(this.searchButton, "Søkeknappen skal være synlig").toBeVisible();
    await this.searchButton.click();

    await expect(
      this.page.locator("section.sokresultat").getByRole("heading", { name: UI_TEXTS.HEADINGS.SAKSOVERSIKT, level: 1 }),
      `Forventet at søkeresultatsiden med '${UI_TEXTS.HEADINGS.SAKSOVERSIKT}' vises etter klikk på Søk-knappen`,
    ).toBeVisible({ timeout: 15000 });
  }
}
