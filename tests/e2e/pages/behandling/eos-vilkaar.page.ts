import { expect, Locator, Page } from "@playwright/test";
import { finnKnapp } from "../../utils/testUtils";
import { UI_TEXTS } from "../../config/ui-texts";
import type { Vilkaar } from "../../mocks/eosBehandlingMock";

/**
 * Page Object for vilkårssteg i EU/EØS-stegvelgeren
 * (Forutgående medlemskap, Vesentlig virksomhet og Vurdering arbeidstaker / Art. 12.x)
 */
export class EosVilkaarPage {
  constructor(readonly page: Page) {}

  private get aktivtSteg(): Locator {
    return this.page.locator(".stegFane--aktiv");
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
    await expect(this.page.locator(".informasjonlinje"), "Fant ikke behandlingssiden").toBeVisible();
  }

  /**
   * Klikk på et fullført steg i progressbaren, f.eks. "Forutg. medl."
   */
  async gåTilSteg(stegnavn: string, forventetTittel: string): Promise<void> {
    await this.page.locator(".stegIkon").filter({ hasText: stegnavn }).click();
    await expect(this.aktivtSteg.locator("h1.stegvelgertittel")).toHaveText(forventetTittel);
  }

  async velgSvar(label: string): Promise<void> {
    await this.aktivtSteg.getByRole("radio", { name: label, exact: true }).check();
  }

  private async hentBegrunnelsesgruppe(legend: string): Promise<Locator> {
    const gruppe = this.aktivtSteg.getByRole("group", { name: legend, exact: true });
    await expect(gruppe, `Fant ikke checkbox-gruppen "${legend}"`).toBeVisible();
    return gruppe;
  }

  async kryssAvBegrunnelser(legend: string, begrunnelser: string[]): Promise<void> {
    const gruppe = await this.hentBegrunnelsesgruppe(legend);
    for (const begrunnelse of begrunnelser) {
      await gruppe.getByRole("checkbox", { name: begrunnelse, exact: true }).check();
    }
  }

  async fjernBegrunnelser(legend: string, begrunnelser: string[]): Promise<void> {
    const gruppe = await this.hentBegrunnelsesgruppe(legend);
    for (const begrunnelse of begrunnelser) {
      await gruppe.getByRole("checkbox", { name: begrunnelse, exact: true }).uncheck();
    }
  }

  /**
   * Verifiser at nøyaktig de oppgitte begrunnelsene er avkrysset i gruppen
   */
  async verifiserAvkryssedeBegrunnelser(legend: string, forventet: string[]): Promise<void> {
    const gruppe = await this.hentBegrunnelsesgruppe(legend);
    const avkrysset = gruppe.getByRole("checkbox", { checked: true });
    await expect(avkrysset, `Feil avkryssede begrunnelser i "${legend}"`).toHaveCount(forventet.length);
    for (const begrunnelse of forventet) {
      await expect(gruppe.getByRole("checkbox", { name: begrunnelse, exact: true })).toBeChecked();
    }
  }

  async verifiserBegrunnelsesgruppeSkjult(legend: string): Promise<void> {
    await expect(this.aktivtSteg.getByRole("group", { name: legend, exact: true })).toHaveCount(0);
  }

  async fyllUtFritekst(label: string, tekst: string): Promise<void> {
    await this.aktivtSteg.getByLabel(label).fill(tekst);
  }

  async verifiserFeltSynlig(label: string): Promise<void> {
    await expect(this.aktivtSteg.getByLabel(label)).toBeVisible();
  }

  /**
   * Klikk "Bekreft og fortsett" og returner vilkårene som sendes i POST /api/vilkaar
   */
  async bekreftOgHentLagredeVilkaar(): Promise<Vilkaar[]> {
    const vilkaarRequest = this.page.waitForRequest(
      (req) => req.method() === "POST" && /\/api\/vilkaar\/\d+$/.test(new URL(req.url()).pathname),
    );
    const knapp = await finnKnapp(UI_TEXTS.BUTTONS.BEKREFT_OG_FORTSETT, this.aktivtSteg);
    await knapp.click();
    return (await vilkaarRequest).postDataJSON() as Vilkaar[];
  }
}
