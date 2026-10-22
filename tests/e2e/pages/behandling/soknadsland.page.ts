import { expect, Locator, Page } from "@playwright/test";

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

  private valgte(): Locator {
    return this.land.getByRole("button", { name: / slett$/ });
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
    await this.landvelger.fill(søketekst);
    await this.page.getByRole("option", { name: land, exact: true }).click();
    await expect(this.valgte().filter({ hasText: land })).toHaveCount(1);
  }

  async fjern(land: string): Promise<void> {
    await this.land.getByRole("button", { name: `${land} slett`, exact: true }).click();
  }

  async fjernSisteMedBackspace(): Promise<void> {
    await this.landvelger.press("Backspace");
  }

  /**
   * Verifiser at nøyaktig de oppgitte landene er valgt, i valgt rekkefølge
   */
  async verifiserValgte(forventet: string[]): Promise<void> {
    await expect(this.valgte()).toHaveCount(forventet.length);
    for (const [i, land] of forventet.entries()) {
      await expect(this.valgte().nth(i)).toHaveAccessibleName(`${land} slett`);
    }
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
