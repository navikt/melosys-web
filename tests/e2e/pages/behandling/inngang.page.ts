import { expect, Page } from "@playwright/test";
import { setDatoFelt } from "../../utils/testUtils";

/**
 * Page Object Model for Inngang-steget
 */
export class InngangPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Vent på at Inngang-steget er synlig
   */
  async ventPaInngangSteg(timeout = 10000): Promise<void> {
    await this.page.waitForSelector("text=Kontroller inngangsvilkår", { timeout });
  }

  /**
   * Vent på at Inngang-steget er synlig
   */
  async ventPaInngangStegEØS(timeout = 10000): Promise<void> {
    await this.page.waitForSelector("text=Oppgi opplysninger fra attest / S1", { timeout });
  }

  /**
   * Generisk funksjon for å sette dato i et datofelt
   * @private
   */
  async setDatoFelt(feltNavn: string, dato: string): Promise<void> {
    const datoInput = this.page.getByRole("textbox", { name: feltNavn });
    const count = await datoInput.count();
    expect(count, `${feltNavn}-dato input skal finnes`).toBeGreaterThan(0);

    // Hvis det finnes flere, bruk den første
    const input = count > 1 ? datoInput.first() : datoInput;
    await expect(input, `${feltNavn}-dato input skal være synlig`).toBeVisible();
    await input.fill(dato);
  }

  /**
   * Sett fra-dato i søknadsperiode
   */
  async setFraOgMedDato(dato: string): Promise<void> {
    return setDatoFelt("Fra og med", dato, this.page);
  }

  /**
   * Sett til-dato i søknadsperiode
   */
  async setTilOgMedDato(dato: string): Promise<void> {
    return setDatoFelt("Til og med", dato, this.page);
  }

  /**
   * Velg bostedsland for EØS pensjonist-saker
   * @param landkode - Landkode (f.eks. "SE" for Sverige, "DK" for Danmark)
   */
  async velgLand(landkode: string): Promise<void> {
    const landSelect = this.page.getByLabel("Bostedsland");
    await landSelect.selectOption({ value: landkode });
    // Vent litt slik at endringen lagres (debounced)
    await this.page.waitForTimeout(500);
  }

  /**
   * Klikk på Bekreft-knappen i Inngang-steget (kun i aktivt steg)
   */
  async klikkBekreftOgFortsett(): Promise<void> {
    const bekreftKnapp = this.page.locator(".stegFane--aktiv button.stegKnapper__bekreft");
    await bekreftKnapp.waitFor({ state: "visible", timeout: 5000 });
    await bekreftKnapp.click();
  }
}
