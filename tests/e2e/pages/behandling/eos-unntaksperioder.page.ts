import { expect, Locator, Page } from "@playwright/test";
import type { IkkeGodkjennRequest } from "../../mocks/eosRegistreringUnntakMock";

const BEGRUNNELSE_LEGEND = "Begrunnelse for ikke godkjent unntaksperiode";

/**
 * Page Object for «Registrering av unntaksperioder» (EU/EØS, mottatt A009/A010)
 */
export class EosUnntaksperioderPage {
  constructor(readonly page: Page) {}

  private get skjema(): Locator {
    return this.page.locator("form#registrering");
  }

  private get begrunnelser(): Locator {
    return this.skjema.getByRole("group", { name: BEGRUNNELSE_LEGEND, exact: true });
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
    await expect(this.skjema.getByText("Registrering av unntaksperioder")).toBeVisible();
  }

  async velgVurdering(label: string): Promise<void> {
    await this.skjema.getByRole("radio", { name: label, exact: true }).check();
  }

  async kryssAvBegrunnelser(begrunnelser: string[]): Promise<void> {
    for (const begrunnelse of begrunnelser) {
      await this.begrunnelser.getByRole("checkbox", { name: begrunnelse, exact: true }).check();
    }
  }

  async fjernBegrunnelser(begrunnelser: string[]): Promise<void> {
    for (const begrunnelse of begrunnelser) {
      await this.begrunnelser.getByRole("checkbox", { name: begrunnelse, exact: true }).uncheck();
    }
  }

  /**
   * Verifiser at nøyaktig de oppgitte begrunnelsene er avkrysset
   */
  async verifiserAvkryssedeBegrunnelser(forventet: string[]): Promise<void> {
    await expect(this.begrunnelser).toBeVisible();
    await expect(this.begrunnelser.getByRole("checkbox", { checked: true })).toHaveCount(forventet.length);
    for (const begrunnelse of forventet) {
      await expect(this.begrunnelser.getByRole("checkbox", { name: begrunnelse, exact: true })).toBeChecked();
    }
  }

  async verifiserBegrunnelserSkjult(): Promise<void> {
    await expect(this.begrunnelser).toHaveCount(0);
  }

  fritekst(): Locator {
    return this.skjema.getByLabel("Skriv inn begrunnelse for avslaget...");
  }

  async verifiserFeilmelding(tekst: string): Promise<void> {
    await expect(this.skjema.getByText(tekst, { exact: true })).toBeVisible();
  }

  async lagre(): Promise<void> {
    await this.skjema.getByRole("button", { name: "Lagre", exact: true }).click();
  }

  /**
   * Klikk "Lagre" og returner det som sendes i POST .../ikkegodkjenn
   */
  async lagreOgHentIkkeGodkjenn(): Promise<IkkeGodkjennRequest> {
    const request = this.page.waitForRequest(
      (req) => req.method() === "POST" && new URL(req.url()).pathname.endsWith("/ikkegodkjenn"),
    );
    await this.lagre();
    return (await request).postDataJSON() as IkkeGodkjennRequest;
  }
}
