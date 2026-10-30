import { expect, Locator, Page } from "@playwright/test";

/**
 * Page Object Model for «Send brev»-fanen i sidedialogen, for bruk mot mocket backend
 * (se mocks/sendBrevMock.ts). Avhenger ikke av prepopulerte saker, i motsetning til SendBrevPage.
 */
export class SendBrevPanelPage {
  constructor(readonly page: Page) {}

  private fane(navn: string): Locator {
    return this.page.locator(`button[role="tab"][id$="--tab-${navn}"]`);
  }

  private get panel(): Locator {
    return this.page.locator('[id$="--tabpanel-brevbestilling"]');
  }

  private get dokumenterPanel(): Locator {
    return this.page.locator('[id$="--tabpanel-dokumenter"]');
  }

  private get mottakerSelect(): Locator {
    return this.panel.locator('select[name="mottaker"]');
  }

  private get brevmalSelect(): Locator {
    return this.panel.getByRole("combobox", { name: "Velg brevmal" });
  }

  // Editorene har ikke label-kobling, så vi finner første editor etter feltets label/legend.
  private editor(label: string): Locator {
    return this.panel
      .getByText(label, { exact: true })
      .first()
      .locator("xpath=following::div[contains(@class,'ql-editor')][1]");
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
    await expect(this.page.locator(".informasjonlinje"), "Fant ikke behandlingssiden").toBeVisible();
  }

  async åpneSendBrev(): Promise<void> {
    await this.fane("brevbestilling").click();
    await expect(this.mottakerSelect).toBeVisible();
  }

  async velgMottaker(label: string): Promise<void> {
    await this.mottakerSelect.selectOption({ label });
  }

  async velgBrevmal(label: string): Promise<void> {
    await this.brevmalSelect.selectOption({ label });
  }

  async velgIListe(label: string, alternativ: string): Promise<void> {
    await this.panel.getByRole("combobox", { name: label, exact: true }).selectOption({ label: alternativ });
  }

  async velgRadio(label: string): Promise<void> {
    await this.panel.getByRole("radio", { name: label, exact: true }).check();
  }

  async huk(label: string): Promise<void> {
    await this.panel.getByRole("checkbox", { name: label, exact: true }).check();
  }

  async skrivTekst(label: string, tekst: string): Promise<void> {
    await this.panel.getByRole("textbox", { name: label }).fill(tekst);
  }

  // For tekstfelt uten egen label, f.eks. fritekst-overskrift (felt.BREV_TITTEL).
  async skrivFeltverdi(feltkode: string, tekst: string): Promise<void> {
    await this.panel.locator(`input[name="felt.${feltkode}.feltVerdi"]`).fill(tekst);
  }

  async skrivFritekst(label: string, tekst: string): Promise<void> {
    await this.editor(label).fill(tekst);
  }

  async skrivOrganisasjonsnummer(orgnr: string, forventetNavn: string): Promise<void> {
    await this.panel.getByRole("textbox", { name: "Org.nr." }).fill(orgnr);
    await expect(this.panel.getByText(forventetNavn)).toBeVisible();
  }

  async sendBrev(): Promise<void> {
    await this.panel.getByRole("button", { name: "Send brev" }).click();
    await expect(this.panel.getByText("Brevet er bestilt.", { exact: false })).toBeVisible();
  }

  async lagreUtkast(): Promise<void> {
    await this.panel.getByRole("button", { name: "Lagre utkast" }).click();
  }

  async forkastBrev(): Promise<void> {
    await this.panel.getByRole("button", { name: "Forkast brev" }).click();
  }

  async åpneUtkast(tittel: string): Promise<void> {
    await this.panel.getByRole("button", { name: tittel }).click();
  }

  async åpneUtkastFraDokumenter(tittel: string): Promise<void> {
    await this.fane("dokumenter").click();
    await this.dokumenterPanel.getByRole("button", { name: tittel }).click();
    await expect(this.mottakerSelect).toBeVisible();
  }

  async verifiserLagredeUtkast(titler: string[]): Promise<void> {
    await expect(this.panel.locator(".lagredeUtkast__utkast")).toHaveText(titler);
  }

  async verifiserValgtMottaker(label: string): Promise<void> {
    await expect(this.mottakerSelect.locator("option:checked")).toHaveText(label);
  }

  async verifiserValgtBrevmal(label: string): Promise<void> {
    await expect(this.brevmalSelect.locator("option:checked")).toHaveText(label);
  }

  async verifiserBrevmalIkkeValgt(): Promise<void> {
    await expect(this.brevmalSelect.locator("option:checked")).toHaveText("Velg...");
  }

  async verifiserFritekst(label: string, tekst: string): Promise<void> {
    await expect(this.editor(label)).toHaveText(tekst);
  }

  async verifiserTekst(label: string, tekst: string): Promise<void> {
    await expect(this.panel.getByRole("textbox", { name: label })).toHaveValue(tekst);
  }
}
