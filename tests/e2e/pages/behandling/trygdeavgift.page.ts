import { expect, Page } from "@playwright/test";
import { getSaksnummerFraUrl } from "../../utils/testUtils";

/**
 * Page Object Model for trygdeavgift-komponenten
 * Håndterer interaksjon med skatteforholdsperioder og inntektskilder
 */
export class TrygdeavgiftPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
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
  async verifiserSkattepliktigErIkkeValgt(saksnummer: string): Promise<void> {
    const name = `skatteforholdsperioder[0].skatteplikttype`;
    const radioInput = this.page.locator(`input[name="${name}"][type="radio"][value="SKATTEPLIKTIG"]`);
    const isit = await radioInput.isChecked().catch(() => false);
    expect(isit, `[${saksnummer}] Skattepliktig skal IKKE være valgt`).toBe(false);
  }

  /**
   * Sjekk om "Ikke skattepliktig" (Nei) er valgt for en skatteforholdsperiode
   */
  async erIkkeSkattepliktigValgt(indeks: number): Promise<boolean> {
    const name = `skatteforholdsperioder[${indeks}].skatteplikttype`;
    const radioInput = this.page.locator(`input[name="${name}"][type="radio"][value="IKKE_SKATTEPLIKTIG"]`);
    return await radioInput.isChecked().catch(() => false);
  }

  /**
   * Fyll inn fom-dato for skatteforholdsperiode
   */
  async fyllInnSkatteFomDato(indeks: number, dato: string): Promise<void> {
    const inputs = this.page.locator('input[name^="skatteforholdsperioder"][name$=".fomDato"]');
    await inputs.nth(indeks).fill(dato);
  }

  /**
   * Fyll inn tom-dato for skatteforholdsperiode
   */
  async fyllInnSkatteTomDato(indeks: number, dato: string): Promise<void> {
    const inputs = this.page.locator('input[name^="skatteforholdsperioder"][name$=".tomDato"]');
    await inputs.nth(indeks).fill(dato);
  }

  /**
   * Legg til ny skatteforholdsperiode
   */
  async leggTilSkatteforholdsperiode(): Promise<void> {
    const knapp = this.page.locator('button:has-text("Legg til skatteforholdsperiode")');
    await knapp.click();
  }

  /**
   * Velg inntektskildetype for en inntektskilde
   */
  async velgInntektskildetype(indeks: number, type: string): Promise<void> {
    // type kan være: "Arbeidsinntekt", "Næringsinntekt", "Pensjon", "Uføretrygd"
    const selects = this.page.locator('select[name^="inntektskilder"][name$=".inntektskildetype"]');
    await selects.nth(indeks).selectOption({ label: type });
  }

  /**
   * Fyll inn inntekt (beløp)
   */
  async fyllInnInntekt(indeks: number, beløp: string): Promise<void> {
    const inputs = this.page.locator('input[name^="inntektskilder"][name$=".inntekt"]');
    await inputs.nth(indeks).fill(beløp);
  }

  /**
   * Fyll inn fom-dato for inntektskilde
   */
  async fyllInnInntektFomDato(indeks: number, dato: string): Promise<void> {
    const inputs = this.page.locator('input[name^="inntektskilder"][name$=".fomDato"]');
    await inputs.nth(indeks).fill(dato);
  }

  /**
   * Fyll inn tom-dato for inntektskilde
   */
  async fyllInnInntektTomDato(indeks: number, dato: string): Promise<void> {
    const inputs = this.page.locator('input[name^="inntektskilder"][name$=".tomDato"]');
    await inputs.nth(indeks).fill(dato);
  }

  /**
   * Legg til ny inntektskilde
   */
  async leggTilInntektskilde(): Promise<void> {
    const knapp = this.page.locator('button:has-text("Legg til inntektskilde")');
    await knapp.click();
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
  async verifiserInntektskilderSynlige(saksnummer: string, synlig: boolean): Promise<void> {
    const heading = this.page.locator("h1.undertittel:has-text('Oppgi informasjon om brukers inntekt')");
    const val = await heading.isVisible({ timeout: 5000 }).catch(() => false);
    expect(val, `[${saksnummer}] Inntektskilder skal IKKE være synlig`).toBe(synlig);
  }

  /**
   * Verifiser at skatteforholdsperioder er synlige
   */
  async verifiserSkatteforholdsperioderSynlige(): Promise<boolean> {
    const heading = this.page.locator("text=Oppgi informasjon om brukers skatteforhold");
    return await heading.isVisible({ timeout: 2000 }).catch(() => false);
  }

  /**
   * Klikk "Bekreft og fortsett" for å gå til neste steg (kun i aktivt steg)
   */
  async klikkNeste(): Promise<void> {
    const knapp = this.page.locator(".stegFane--aktiv button.stegKnapper__bekreft");
    await knapp.waitFor({ state: "visible", timeout: 5000 });
    await knapp.click();
  }

  /**
   * Sjekk om "Bekreft og fortsett"-knappen er disabled (kun i aktivt steg)
   */
  async erNesteKnappDisabled(): Promise<boolean> {
    const knapp = this.page.locator(".stegFane--aktiv button.stegKnapper__bekreft");
    return await knapp.isDisabled();
  }
}
