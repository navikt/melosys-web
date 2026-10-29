import { expect, Page } from "@playwright/test";

/**
 * Page Object Model (POM) for saksplukkeren («Behandle sak») på forsiden
 */
export class SaksplukkerPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get panel() {
    return this.page.locator(".saksplukker");
  }

  private get sakstype() {
    return this.panel.getByLabel("Sakstype");
  }

  private get sakstema() {
    return this.panel.getByLabel("Sakstema");
  }

  private get behandlingstema() {
    return this.panel.getByLabel("Behandlingstema");
  }

  private get ingenSakerFunnet() {
    return this.panel.getByText(/Det fins ingen saker for valgt type\/tema kombinasjon/);
  }

  async velgSakstype(term: string): Promise<void> {
    await this.sakstype.selectOption({ label: term });
  }

  async velgSakstema(term: string): Promise<void> {
    await this.sakstema.selectOption({ label: term });
  }

  async velgBehandlingstema(term: string): Promise<void> {
    await this.behandlingstema.selectOption({ label: term });
  }

  async velg(sakstype: string, sakstema: string, behandlingstema: string): Promise<void> {
    await this.velgSakstype(sakstype);
    await this.velgSakstema(sakstema);
    await this.velgBehandlingstema(behandlingstema);
  }

  async klikkBehandleSak(): Promise<void> {
    await this.panel.getByRole("button", { name: "Behandle sak" }).click();
  }

  async klikkNullstill(): Promise<void> {
    await this.panel.getByRole("button", { name: "Nullstill" }).click();
  }

  async verifiserValgteVerdier(verdier: { sakstype: string; sakstema: string; behandlingstema: string }) {
    await expect(this.sakstype, "Valgt sakstype").toHaveValue(verdier.sakstype);
    await expect(this.sakstema, "Valgt sakstema").toHaveValue(verdier.sakstema);
    await expect(this.behandlingstema, "Valgt behandlingstema").toHaveValue(verdier.behandlingstema);
  }

  async verifiserAntallFeilmeldinger(antall: number): Promise<void> {
    await expect(this.panel.getByText("Må fylles ut"), `Forventet ${antall} feilmeldinger`).toHaveCount(antall);
  }

  async verifiserIngenSakerFunnet(antallOppgaver: number): Promise<void> {
    await expect(this.ingenSakerFunnet).toBeVisible();
    await expect(this.ingenSakerFunnet).toContainText(`blant de ${antallOppgaver} eldste sakene`);
  }

  async verifiserIngenSakerFunnetSkjult(): Promise<void> {
    await expect(this.ingenSakerFunnet).toBeHidden();
  }
}
