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
   * Vent på at trygdeavgift-steget blir synlig
   */
  async ventPaTrygdeavgiftSteg(timeout = 10000): Promise<void> {
    await this.page.waitForSelector("text=Trygdeavgift", { timeout });
  }

  /**
   * Velg om personen er skattepliktig for en skatteforholdsperiode
   * @param indeks - Index til skatteforholdsperioden (0-basert)
   * @param erSkattepliktig - true for "Ja", false for "Nei"
   */
  async velgSkattepliktig(indeks: number, erSkattepliktig: boolean): Promise<void> {
    await this.ventPaTrygdeavgiftSteg();

    // Finn radiogruppen for denne perioden
    // Strukturen er: fieldset med legend "Er personen skattepliktig til Norge i denne perioden?"
    const radioGrupper = this.page.locator('fieldset:has(legend:text("Er personen skattepliktig"))');
    const radioGruppe = radioGrupper.nth(indeks);

    const radioKnapp = erSkattepliktig
      ? radioGruppe.locator('input[type="radio"][value="true"]')
      : radioGruppe.locator('input[type="radio"][value="false"]');

    await radioKnapp.click();
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
    await this.ventPaTrygdeavgiftSteg();

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
  async verifiserInntektskilderSynlige(): Promise<boolean> {
    const heading = this.page.locator("h3:has-text('Inntektskilder')");
    return await heading.isVisible({ timeout: 2000 }).catch(() => false);
  }

  /**
   * Verifiser at skatteforholdsperioder er synlige
   */
  async verifiserSkatteforholdsperioderSynlige(): Promise<boolean> {
    const heading = this.page.locator("h3:has-text('Skatteforholdsperioder')");
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
