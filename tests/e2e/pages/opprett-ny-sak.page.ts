import { expect, Page } from "@playwright/test";

/**
 * Page Object Model for the ny sak
 */
export class OpprettNySakPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Verifiser at vi er på 'Opprett ny sak' siden
   */
  async verifyNewCasePage(): Promise<void> {
    await expect(this.page).toHaveURL("/melosys/opprettnysak");
    await expect(this.page.locator(".opprettnysak")).toBeVisible();
  }

  /**
   * Verifiser at "Hvem skal saken opprettes på?" seksjonen er vist korrekt
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
   * Verifiser at "Informasjon om bruker" seksjonen er vist korrekt
   */
  async verifyUserInfoSection(): Promise<void> {
    await expect(this.page.locator(".opprettnysak .undertittel:has-text('Informasjon om bruker')")).toBeVisible();
    await expect(this.page.locator(".opprettnysak label:has-text('Brukers f.nr. eller d-nr.:')")).toBeVisible();
    await expect(this.page.locator(".opprettnysak input[name='brukerID']")).toBeVisible();
  }

  /**
   * Verifiser at "Legg behandlingen i mine oppgaver" checkbox er vist korrekt
   */
  async verifyAssignmentCheckbox(): Promise<void> {
    await expect(this.page.locator(".navds-checkbox:has-text('Legg behandlingen i mine oppgaver')")).toBeVisible();
    await expect(this.page.locator("input[name='skalTilordnes']")).not.toBeChecked();
  }

  /**
   * Verifiser at action buttons er vist korrrekt
   */
  async verifyActionButtons(): Promise<void> {
    await expect(this.page.locator("button:has-text('Opprett ny behandling')")).toBeVisible();
    await expect(this.page.locator("button:has-text('Avbryt')")).toBeVisible();
  }

  /**
   * Fyll ut bruker f.nr. eller d-nr. felt
   */
  async fillUserID(userID: string): Promise<void> {
    const userIDInput = this.page.locator("input[name='brukerID']");
    await expect(userIDInput).toBeVisible();
    await userIDInput.fill(userID);
  }

  /**
   * Velg "Opprett ny sak" i "Knytt til eksisterende sak eller opprett ny" seksjonen
   */
  async selectOpprettNySak(): Promise<void> {
    await expect(
      this.page.locator(".opprettnysak .undertittel:has-text('Knytt til eksisterende sak eller opprett ny')"),
    ).toBeVisible();
    const opprettNySakRadio = this.page.locator(".navds-radio__content:has-text('Opprett ny sak')");
    await expect(opprettNySakRadio).toBeVisible();
    await opprettNySakRadio.click();
  }

  /**
   * Klikk på "Opprett ny behandling" knappen
   */
  async clickOpprettNyBehandling(): Promise<void> {
    const opprettButton = this.page.locator("button:has-text('Opprett ny behandling')");
    await expect(opprettButton).toBeVisible();
    await opprettButton.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async verifyManglendeBrukerIdErrors(): Promise<void> {
    await expect(this.page.locator("text=Følgende feil ble funnet")).toBeVisible();

    // Verifiser feilmelding på selve feltet (den røde teksten under input-feltet)
    await expect(
      this.page.locator(".navds-error-message:has-text('Skriv inn gyldig f.nr. eller d-nr.')"),
    ).toBeVisible();

    // Verifiser at samme feilmelding er først i oppsummeringen
    await expect(this.page.locator("ul li").first()).toHaveText("Skriv inn gyldig f.nr. eller d-nr.");
  }

  async verifyManglendeValgEksisterendaSakEllerOpprettNyErrors(): Promise<void> {
    // Denne funksjonen brukes for å verifisere feilmeldinger på neste side (behandlingsårsak)
    await expect(this.page.locator("text=Følgende feil ble funnet")).toBeVisible();

    // Verifiser behandlingsårsak feilmelding
    await expect(this.page.locator(".navds-error-message:has-text('Velg behandlingsårsak')")).toBeVisible();

    // Verifiser at samme feilmelding er i oppsummeringen
    await expect(this.page.locator("ul li:has-text('Velg behandlingsårsak')")).toBeVisible();
  }

  /**
   * Fyll ut f.nr og opprett ny sak - komplett arbeidsflyt
   */
  async fillUserIDAndCreateNewCase(userID: string): Promise<void> {
    await this.verifyNewCasePage();
    await this.fillUserID(userID);
    await this.selectOpprettNySak();
    await this.clickOpprettNyBehandling();
  }

  /**
   * Verifiser alle ellementer på "Opprett ny sak" siden
   */
  async verifyAllElements(): Promise<void> {
    await this.verifyNewCasePage();
    await this.verifyUserTypeSection();
    await this.verifyUserInfoSection();
    await this.verifyAssignmentCheckbox();
    await this.verifyActionButtons();
  }
}
