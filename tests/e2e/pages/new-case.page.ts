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
    // Check for the radio button group "Hvem skal saken opprettes på?"
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
    // Check for the input field "Informasjon om bruker"
    await expect(this.page.locator(".opprettnysak .undertittel:has-text('Informasjon om bruker')")).toBeVisible();
    await expect(this.page.locator(".opprettnysak label:has-text('Brukers f.nr. eller d-nr.:')")).toBeVisible();
    await expect(this.page.locator(".opprettnysak input[name='brukerID']")).toBeVisible();
  }

  /**
   * Verify that the "Legg behandlingen i mine oppgaver" checkbox is displayed correctly
   */
  async verifyAssignmentCheckbox(): Promise<void> {
    // Check for the checkbox "Legg behandlingen i mine oppgaver" which should be unchecked
    await expect(this.page.locator(".navds-checkbox:has-text('Legg behandlingen i mine oppgaver')")).toBeVisible();
    await expect(this.page.locator("input[name='skalTilordnes']")).not.toBeChecked();
  }

  /**
   * Verify that the action buttons are displayed correctly
   */
  async verifyActionButtons(): Promise<void> {
    // Check for the primary button "Opprett ny behandling" and the tertiary button "Avbryt"
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

  /**
   * Fill in the user ID field
   * @param userId - The user ID to fill in
   */
  async fillUserID(userId: string): Promise<void> {
    await this.page.locator(".opprettnysak input[name='brukerID']").fill(userId);
  }

  /**
   * Toggle the "Legg behandlingen i mine oppgaver" checkbox
   */
  async toggleAssignmentCheckbox(): Promise<void> {
    await this.page.locator("input[name='skalTilordnes']").click();
  }

  /**
   * Click the "Opprett ny behandling" button
   */
  async clickCreateButton(): Promise<void> {
    await this.page.locator("button:has-text('Opprett ny behandling')").click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Click the "Avbryt" button
   */
  async clickCancelButton(): Promise<void> {
    await this.page.locator("button:has-text('Avbryt')").click();
    await this.page.waitForLoadState("networkidle");
  }
}
