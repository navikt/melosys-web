import { expect, Locator, Page } from "@playwright/test";
import type { MottatteOpplysningerRequest } from "../../mocks/eosVurderUtpekingMock";

const OVERGANGSREGLER_LEGEND = "Overgangsregler gjelder";

/**
 * Page Object for «Vurder lovvalgsbeslutningen (A003)» (EU/EØS, vurdering av utpeking)
 */
export class EosVurderUtpekingPage {
  constructor(readonly page: Page) {}

  private get aktivtSteg(): Locator {
    return this.page.locator(".stegFane--aktiv");
  }

  private get overgangsregler(): Locator {
    return this.aktivtSteg.getByRole("group", { name: OVERGANGSREGLER_LEGEND, exact: true });
  }

  private get bekreftOgFortsettKnapp(): Locator {
    return this.aktivtSteg.getByRole("button", { name: "Bekreft og fortsett", exact: true });
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
    await expect(this.aktivtSteg.getByText("Vurder lovvalgsbeslutningen (A003)")).toBeVisible();
  }

  async velgVurdering(label: string): Promise<void> {
    await this.aktivtSteg.getByRole("radio", { name: label, exact: true }).check();
  }

  async kryssAvOvergangsregler(regler: string[]): Promise<void> {
    for (const regel of regler) {
      await this.overgangsregler.getByRole("checkbox", { name: regel, exact: true }).check();
    }
  }

  async fjernOvergangsregler(regler: string[]): Promise<void> {
    for (const regel of regler) {
      await this.overgangsregler.getByRole("checkbox", { name: regel, exact: true }).uncheck();
    }
  }

  /**
   * Verifiser at nøyaktig de oppgitte overgangsreglene er avkrysset
   */
  async verifiserAvkryssedeOvergangsregler(forventet: string[]): Promise<void> {
    await expect(this.overgangsregler).toBeVisible();
    await expect(this.overgangsregler.getByRole("checkbox", { checked: true })).toHaveCount(forventet.length);
    for (const regel of forventet) {
      await expect(this.overgangsregler.getByRole("checkbox", { name: regel, exact: true })).toBeChecked();
    }
  }

  async verifiserFeilmelding(tekst: string): Promise<void> {
    await expect(this.overgangsregler.getByText(tekst, { exact: true })).toBeVisible();
  }

  async verifiserIngenFeilmelding(tekster: string[]): Promise<void> {
    for (const tekst of tekster) {
      await expect(this.overgangsregler.getByText(tekst, { exact: true })).toHaveCount(0);
    }
  }

  async verifiserKanFortsette(): Promise<void> {
    await expect(this.bekreftOgFortsettKnapp).toBeEnabled();
  }

  async verifiserKanIkkeFortsette(): Promise<void> {
    await expect(this.bekreftOgFortsettKnapp).toBeDisabled();
  }

  /**
   * Klikk «Bekreft og fortsett» og returner det som sendes i POST /api/mottatteopplysninger/{id}
   */
  async bekreftOgHentMottatteOpplysninger(): Promise<MottatteOpplysningerRequest> {
    const request = this.page.waitForRequest(
      (req) => req.method() === "POST" && new URL(req.url()).pathname.startsWith("/api/mottatteopplysninger/"),
    );
    await this.bekreftOgFortsettKnapp.click();
    const payload = (await request).postDataJSON() as MottatteOpplysningerRequest;
    await expect(this.aktivtSteg.getByRole("heading", { name: "Godkjenn utpeking" })).toBeVisible();
    return payload;
  }
}
