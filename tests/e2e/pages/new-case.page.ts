import { expect, Page } from "@playwright/test";

/**
 * Page Object Model for the new case page
 */
export class NewCasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Verify that we are on the new case page
   */
  async verifyNewCasePage(): Promise<void> {
    await expect(this.page).toHaveURL("/melosys/opprettnysak");
    await expect(this.page.locator(".opprettnysak")).toBeVisible();
  }

  /**
   * Verify that the "Hvem skal saken opprettes på?" section is displayed correctly
   */
  async verifyUserTypeSection(): Promise<void> {
    await expect(
      this.page.locator(".opprettnysak .undertittel:has-text('Hvem skal saken opprettes på?')"),
    ).toBeVisible();
    await expect(this.page.locator(".opprettnysak .navds-radio__content:has-text('Bruker')")).toBeVisible();
    await expect(this.page.locator(".opprettnysak .navds-radio__content:has-text('Virksomhet')")).toBeVisible();
    await expect(this.page.locator(".opprettnysak .navds-radio input[value='BRUKER']")).toBeChecked();
  }

  /**
   * Verify that the "Informasjon om bruker" section is displayed correctly
   */
  async verifyUserInfoSection(): Promise<void> {
    await expect(this.page.locator(".opprettnysak .undertittel:has-text('Informasjon om bruker')")).toBeVisible();
    await expect(this.page.locator(".opprettnysak label:has-text('Brukers f.nr. eller d-nr.:')")).toBeVisible();
    await expect(this.page.locator(".opprettnysak input[name='brukerID']")).toBeVisible();
  }

  /**
   * Verify that the "Legg behandlingen i mine oppgaver" checkbox is displayed correctly
   */
  async verifyAssignmentCheckbox(): Promise<void> {
    await expect(this.page.locator(".navds-checkbox:has-text('Legg behandlingen i mine oppgaver')")).toBeVisible();
    await expect(this.page.locator("input[name='skalTilordnes']")).not.toBeChecked();
  }

  /**
   * Verify that the action buttons are displayed correctly
   */
  async verifyActionButtons(): Promise<void> {
    await expect(this.page.locator("button:has-text('Opprett ny behandling')")).toBeVisible();
    await expect(this.page.locator("button:has-text('Avbryt')")).toBeVisible();
  }

  /**
   * Verify all elements on the new case page
   */
  async verifyAllElements(): Promise<void> {
    await this.verifyNewCasePage();
    await this.verifyUserTypeSection();
    await this.verifyUserInfoSection();
    await this.verifyAssignmentCheckbox();
    await this.verifyActionButtons();
  }
}
