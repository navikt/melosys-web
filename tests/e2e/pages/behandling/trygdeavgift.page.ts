import { expect, Page } from "@playwright/test";
import { BehandlingPage } from "./behandling.page";

/**
 * Page Object Model for trygdeavgift-komponenten
 * Håndterer interaksjon med skatteforholdsperioder og inntektskilder
 */
export class TrygdeavgiftPage extends BehandlingPage {
  constructor(page: Page, saksnummer: string) {
    super(page, saksnummer);
  }

  /**
   * Vent på at et spesifikt steg i trygdeavgift-komponenten er synlig
   */
  async verifiserSteg(stegnavn: string, timeout = 10000): Promise<void> {
    await expect(
      this.page.locator(`text=${stegnavn}`).first(),
      `${this.saksnummer}: Steg "${stegnavn}" skal være synlig`,
    ).toBeVisible({ timeout });
  }

  /**
   * Velg om personen er skattepliktig for en skatteforholdsperiode
   * @param indeks - Index til skatteforholdsperioden (0-basert)
   * @param erSkattepliktig - true for "Ja", false for "Nei"
   */
  async velgSkattepliktig(indeks: number, erSkattepliktig: boolean): Promise<void> {
    await this.verifiserSteg("Trygdeavgift");

    // Radio-knappene har verdier "SKATTEPLIKTIG" (Ja) og "IKKE_SKATTEPLIKTIG" (Nei)
    const name = `skatteforholdsperioder[${indeks}].skatteplikttype`;
    const value = erSkattepliktig ? "SKATTEPLIKTIG" : "IKKE_SKATTEPLIKTIG";
    const valgtekst = erSkattepliktig ? "Ja" : "Nei";

    // Vent på at skatteforholdsperioder-delen er synlig før vi prøver å klikke
    const skatteforholdsHeading = this.page.locator("text=Oppgi informasjon om brukers skatteforhold");
    await expect(
      skatteforholdsHeading,
      `${this.saksnummer}: Overskrift 'Oppgi informasjon om brukers skatteforhold' skal være synlig`,
    ).toBeVisible({ timeout: 10000 });

    // Finn fieldset-et for denne skatteforholdsperioden
    const fieldset = this.page.locator("fieldset.skatteforholdsperioder-radio-group").nth(indeks);
    await expect(
      fieldset,
      `${this.saksnummer}: Fieldset for skatteforholdsperiode ${indeks} skal være synlig`,
    ).toBeVisible({ timeout: 10000 });

    // Finn radio-input med riktig name og value
    const radioInput = fieldset.locator(`input[name="${name}"][type="radio"][value="${value}"]`);
    await expect(
      radioInput,
      `${this.saksnummer}: Radio-knapp '${valgtekst}' for skatteforholdsperiode ${indeks} skal være synlig`,
    ).toBeVisible({ timeout: 10000 });

    // Bruk check() for å velge radio-knappen (Playwright sin anbefalte metode)
    await radioInput.check({ force: true });
  }

  /**
   * Sjekk om "Skattepliktig" (Ja) er valgt for en skatteforholdsperiode
   */
  async verifiserSkattepliktigErIkkeValgt(): Promise<void> {
    const name = `skatteforholdsperioder[0].skatteplikttype`;
    const radioInput = this.page.locator(`input[name="${name}"][type="radio"][value="SKATTEPLIKTIG"]`);
    const isit = await radioInput.isChecked().catch(() => false);
    expect(isit, `${this.saksnummer}: Skattepliktig skal IKKE være valgt`).toBe(false);
  }

  /**
   * Verifiser at inntektskilder er synlige
   */
  async verifiserInntektskilderSynlige(synlig: boolean): Promise<void> {
    const heading = this.page.locator("h1.undertittel:has-text('Oppgi informasjon om brukers inntekt')");
    const val = await heading.isVisible({ timeout: 5000 }).catch(() => false);
    const forventetTekst = synlig ? "skal være synlig" : "skal IKKE være synlig";
    expect(val, `${this.saksnummer}: Inntektskilder ${forventetTekst}`).toBe(synlig);
  }
}
