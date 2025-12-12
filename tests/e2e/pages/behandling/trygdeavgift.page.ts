import { expect, Page } from "@playwright/test";
import { UI_TEXTS } from "../../config/ui-texts";
import { BehandlingPage } from "./behandling.page";
import { PrepopulertSaksnummer } from "../../utils/testdataUtils";

/**
 * Page Object Model for trygdeavgift-komponenten
 * Håndterer interaksjon med skatteforholdsperioder og inntektskilder
 */
export class TrygdeavgiftPage extends BehandlingPage {
  constructor(page: Page, saksnummer: PrepopulertSaksnummer) {
    super(page, saksnummer);
  }

  /**
   * Vent på at et spesifikt steg i trygdeavgift-komponenten er synlig
   */
  async verifiserSteg(stegnavn: string): Promise<void> {
    await expect(
      this.page.locator(`text=${stegnavn}`).first(),
      `${this.ctx}: Fant ikke steget "${stegnavn}"`,
    ).toBeVisible();
  }

  /**
   * Velg om personen er skattepliktig for en skatteforholdsperiode
   * @param indeks - Index til skatteforholdsperioden (0-basert)
   * @param erSkattepliktig - true for "Ja", false for "Nei"
   */
  async velgSkattepliktig(indeks: number, erSkattepliktig: boolean): Promise<void> {
    await this.verifiserSteg(UI_TEXTS.STEG.TRYGDEAVGIFT);

    // Radio-knappene har verdier "SKATTEPLIKTIG" (Ja) og "IKKE_SKATTEPLIKTIG" (Nei)
    const name = `skatteforholdsperioder[${indeks}].skatteplikttype`;
    const value = erSkattepliktig ? "SKATTEPLIKTIG" : "IKKE_SKATTEPLIKTIG";
    const valgtekst = erSkattepliktig ? "Ja" : "Nei";

    // Vent på at skatteforholdsperioder-delen er synlig før vi prøver å klikke
    const skatteforholdsHeading = this.page.locator("text=Oppgi informasjon om brukers skatteforhold");
    await expect(skatteforholdsHeading, `${this.ctx}: Fant ikke skatteforhold-seksjonen`).toBeVisible();

    // Finn fieldset-et for denne skatteforholdsperioden
    const fieldset = this.page.locator("fieldset.skatteforholdsperioder-radio-group").nth(indeks);
    await expect(fieldset, `${this.ctx}: Fant ikke skatteforholdsperiode ${indeks}`).toBeVisible();

    // Finn radio-input med riktig name og value
    const radioInput = fieldset.locator(`input[name="${name}"][type="radio"][value="${value}"]`);
    await expect(
      radioInput,
      `${this.ctx}: Fant ikke valget "${valgtekst}" for skatteforholdsperiode ${indeks}`,
    ).toBeVisible();

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
    expect(isit, `${this.ctx}: "Skattepliktig" er uventet valgt`).toBe(false);
  }

  /**
   * Verifiser at inntektskilder er synlige
   */
  async verifiserInntektskilderSynlige(synlig: boolean): Promise<void> {
    const heading = this.page.locator("h1.undertittel:has-text('Oppgi informasjon om brukers inntekt')");
    const val = await heading.isVisible({ timeout: 5000 }).catch(() => false);
    const feilmelding = synlig ? "Inntektskilder vises ikke" : "Inntektskilder vises uventet";
    expect(val, `${this.ctx}: ${feilmelding}`).toBe(synlig);
  }
}
