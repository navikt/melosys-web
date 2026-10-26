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

  private get vurdering(): Locator {
    return this.skjema.getByRole("radiogroup", { name: "Vurder unntaksperiode", exact: true });
  }

  private get lagreKnapp(): Locator {
    return this.skjema.getByRole("button", { name: "Lagre", exact: true });
  }

  async velgVurdering(label: string): Promise<void> {
    await this.vurdering.getByRole("radio", { name: label, exact: true }).check();
  }

  /**
   * Verifiser hvilken vurdering som er valgt, eller at ingen er valgt (null)
   */
  async verifiserValgtVurdering(forventet: string | null): Promise<void> {
    if (forventet === null) {
      await expect(this.vurdering.getByRole("radio", { checked: true })).toHaveCount(0);
    } else {
      await expect(this.vurdering.getByRole("radio", { name: forventet, exact: true })).toBeChecked();
    }
  }

  async verifiserLagreDeaktivert(): Promise<void> {
    await expect(this.lagreKnapp).toBeDisabled();
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

  private get fritekst(): Locator {
    return this.skjema.getByLabel("Skriv inn begrunnelse for avslaget...");
  }

  async fyllUtFritekst(tekst: string): Promise<void> {
    await this.fritekst.fill(tekst);
  }

  async verifiserFritekst(tekst: string): Promise<void> {
    await expect(this.fritekst).toHaveValue(tekst);
  }

  async verifiserFritekstSynlig(): Promise<void> {
    await expect(this.fritekst).toBeVisible();
  }

  async verifiserFritekstSkjult(): Promise<void> {
    await expect(this.fritekst).toHaveCount(0);
  }

  async verifiserFeilmelding(tekst: string): Promise<void> {
    await expect(this.skjema.getByText(tekst, { exact: true })).toBeVisible();
  }

  async lagre(): Promise<void> {
    await this.lagreKnapp.click();
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
