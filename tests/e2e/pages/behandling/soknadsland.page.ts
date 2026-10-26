import { expect, Locator, Page } from "@playwright/test";
import { MultiSelectComponent } from "../komponenter/multiselect.component";

const PERIODE_OG_LAND = "Periode og land";
const FLERE_LAND_UKJENT_HVILKE = "Flere land. Ikke kjent hvilke.";

/**
 * Page Object for land i menypunktet «Periode og land» i menypanelet på en EU/EØS-behandling
 */
export class SoknadslandPage {
  constructor(readonly page: Page) {}

  private get panel(): Locator {
    return this.page.locator(`[id="${PERIODE_OG_LAND}"]`);
  }

  private get land(): Locator {
    return this.panel.locator(".soknadslandvelger");
  }

  private get landvelger(): Locator {
    return this.land.getByRole("combobox", { name: "Velg land", exact: true });
  }

  private get flereLandUkjentHvilke(): Locator {
    return this.land.getByRole("checkbox", { name: FLERE_LAND_UKJENT_HVILKE });
  }

  private get valgteLand(): MultiSelectComponent {
    return new MultiSelectComponent(this.page, this.landvelger, this.land);
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
    await this.page.getByRole("button", { name: PERIODE_OG_LAND, exact: true }).click();
    await expect(this.land).toBeVisible();
  }

  async verifiserLagredeLand(tekst: string): Promise<void> {
    await expect(this.landvelger).toHaveCount(0);
    await expect(this.land.getByText(tekst, { exact: true })).toBeVisible();
  }

  async rediger(): Promise<void> {
    await this.land.getByRole("button", { name: "Rediger", exact: true }).click();
    await expect(this.landvelger).toBeVisible();
  }

  /**
   * Søk etter landet og velg det
   */
  async velg(land: string, søketekst: string = land): Promise<void> {
    await this.valgteLand.velg(land, søketekst);
  }

  async fjern(land: string): Promise<void> {
    await this.valgteLand.fjern(land);
  }

  async fjernSisteMedBackspace(): Promise<void> {
    await this.valgteLand.fjernSisteMedBackspace();
  }

  /**
   * Verifiser at nøyaktig de oppgitte landene er valgt, i valgt rekkefølge
   */
  async verifiserValgte(forventet: string[]): Promise<void> {
    await this.valgteLand.verifiserValgte(forventet);
  }

  async klikkFlereLandUkjentHvilke(): Promise<void> {
    await this.flereLandUkjentHvilke.click();
  }

  async verifiserFlereLandUkjentHvilke(valgt: boolean): Promise<void> {
    await (valgt
      ? expect(this.flereLandUkjentHvilke).toBeChecked()
      : expect(this.flereLandUkjentHvilke).not.toBeChecked());
  }

  async verifiserLandvelgerAktiv(aktiv: boolean): Promise<void> {
    await (aktiv ? expect(this.landvelger).toBeEnabled() : expect(this.landvelger).toBeDisabled());
  }

  async lagre(): Promise<void> {
    await this.land.getByRole("button", { name: "Lagre", exact: true }).click();
  }

  async avbryt(): Promise<void> {
    await this.land.getByRole("button", { name: "Avbryt", exact: true }).click();
  }
}
