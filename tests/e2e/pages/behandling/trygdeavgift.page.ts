import { expect, Page } from "@playwright/test";
import { getSaksnummerFraUrl } from "../../utils/testUtils";
import { BehandlingPage } from "./behandling.page";

/**
 * Page Object Model for trygdeavgift-komponenten
 * Håndterer interaksjon med skatteforholdsperioder og inntektskilder
 */
export class TrygdeavgiftPage extends BehandlingPage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Vent på at et spesifikt steg i trygdeavgift-komponenten er synlig
   */
  async verifiserSteg(stegnavn: string, timeout = 10000): Promise<void> {
    await this.page.waitForSelector(`text=${stegnavn}`, { timeout });
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

    // Vent på at skatteforholdsperioder-delen er synlig før vi prøver å klikke
    const skatteforholdsHeading = this.page.locator("text=Oppgi informasjon om brukers skatteforhold");
    await skatteforholdsHeading.waitFor({ state: "visible", timeout: 10000 });

    // Finn fieldset-et for denne skatteforholdsperioden
    const fieldset = this.page.locator("fieldset.skatteforholdsperioder-radio-group").nth(indeks);
    await fieldset.waitFor({ state: "visible", timeout: 10000 });

    // Finn radio-input med riktig name og value
    const radioInput = fieldset.locator(`input[name="${name}"][type="radio"][value="${value}"]`);
    await radioInput.waitFor({ state: "visible", timeout: 10000 });

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
    const saksnummer = getSaksnummerFraUrl(this.page);
    expect(isit, `[${saksnummer}] Skattepliktig skal IKKE være valgt`).toBe(false);
  }

  /**
   * Verifiser at trygdeavgiftsberegning vises
   */
  async verifiserBeregningVises(): Promise<void> {
    await this.verifiserSteg("Trygdeavgift");

    // Se etter tabell med beregning eller tekst som indikerer beregning
    const beregningElementer = [
      this.page.locator("text=Trygdeavgift skal ikke betales til NAV"),
      this.page.locator("table").filter({ hasText: "Trygdeavgift" }),
      this.page.locator("text=Beregnet trygdeavgift"),
    ];

    let funnet = false;
    for (const element of beregningElementer) {
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        funnet = true;
        break;
      }
    }

    expect(funnet, `${getSaksnummerFraUrl(this.page)}: Beregning av trygdeavgift skal vises`).toBe(true);
  }

  /**
   * Verifiser at inntektskilder er synlige
   */
  async verifiserInntektskilderSynlige(synlig: boolean): Promise<void> {
    const heading = this.page.locator("h1.undertittel:has-text('Oppgi informasjon om brukers inntekt')");
    const val = await heading.isVisible({ timeout: 5000 }).catch(() => false);
    const saksnummer = getSaksnummerFraUrl(this.page);
    expect(val, `[${saksnummer}] Inntektskilder skal IKKE være synlig`).toBe(synlig);
  }
}
