import { expect, Page } from "@playwright/test";
import { UI_TEXTS } from "../../config/ui-texts";
import { PrepopulertSaksnummer } from "../../utils/testdataUtils";
import { velgFraListe } from "../../utils/testUtils";
import { StegvelgerPage } from "./stegvelger.page";

/**
 * Page Object Model for trygdeavgift-komponenten
 * Håndterer interaksjon med skatteforholdsperioder, inntektskilder og beregningsresultat
 */
export class TrygdeavgiftPage extends StegvelgerPage {
  constructor(page: Page, saksnummer: PrepopulertSaksnummer) {
    super(page, saksnummer);
  }

  /**
   * Vent på at Trygdeavgift-steget er lastet (heading synlig).
   * Brukes etter navigasjon fra Inngang — oppfrisk-dialog kan ta opptil 30 sekunder.
   */
  async ventPåSideLastet(): Promise<void> {
    await expect(
      this.page.getByRole("heading", { name: "Trygdeavgift", level: 1 }),
      `${this.ctx}: Trygdeavgift-steget lastet ikke`,
    ).toBeVisible({ timeout: 30000 });
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

  // === Skatteforhold ===

  /**
   * Velg om personen er skattepliktig for en skatteforholdsperiode
   * @param indeks - Index til skatteforholdsperioden (0-basert)
   * @param erSkattepliktig - true for "Ja", false for "Nei"
   */
  async velgSkattepliktig(indeks: number, erSkattepliktig: boolean): Promise<void> {
    await this.verifiserSteg(UI_TEXTS.STEG.TRYGDEAVGIFT);

    const name = `skatteforholdsperioder[${indeks}].skatteplikttype`;
    const value = erSkattepliktig ? "SKATTEPLIKTIG" : "IKKE_SKATTEPLIKTIG";
    const valgtekst = erSkattepliktig ? "Ja" : "Nei";

    const skatteforholdsHeading = this.page.locator("text=Oppgi informasjon om brukers skatteforhold");
    await expect(skatteforholdsHeading, `${this.ctx}: Fant ikke skatteforhold-seksjonen`).toBeVisible();

    const fieldset = this.page.locator("fieldset.skatteforholdsperioder-radio-group").nth(indeks);
    await expect(fieldset, `${this.ctx}: Fant ikke skatteforholdsperiode ${indeks}`).toBeVisible();

    const radioInput = fieldset.locator(`input[name="${name}"][type="radio"][value="${value}"]`);
    await expect(
      radioInput,
      `${this.ctx}: Fant ikke valget "${valgtekst}" for skatteforholdsperiode ${indeks}`,
    ).toBeVisible();

    // Retry-loop: useEffect([lovvalgsperiode]) kan resette skatteforholdsperioder
    // etter at radio er klikket. Vi prøver opptil 5 ganger med økende ventetid.
    const maxRetries = 5;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await radioInput.check({ force: true });
      await this.page.waitForTimeout(attempt * 300);
      if (await radioInput.isChecked()) break;
      if (attempt === maxRetries) {
        throw new Error(
          `${this.ctx}: Klarte ikke velge "${valgtekst}" for skatteforholdsperiode ${indeks} etter ${maxRetries} forsøk`,
        );
      }
    }
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

  // === Inntektskilder ===

  /**
   * Verifiser at inntektskilder er synlige
   */
  async verifiserInntektskilderSynlige(synlig: boolean): Promise<void> {
    const heading = this.page.locator("h1.undertittel:has-text('Oppgi informasjon om brukers inntekt')");
    const val = await heading.isVisible({ timeout: 5000 }).catch(() => false);
    const feilmelding = synlig ? "Inntektskilder vises ikke" : "Inntektskilder vises uventet";
    expect(val, `${this.ctx}: ${feilmelding}`).toBe(synlig);
  }

  /**
   * Velg inntektskilde fra dropdown (første rad)
   */
  async velgInntektskilde(label: string): Promise<void> {
    await velgFraListe("Inntektskilde", label, this.page);
  }

  /**
   * Legg til en ekstra inntektskilde
   */
  async leggTilInntekt(): Promise<void> {
    await this.page.getByRole("button", { name: "Legg til inntekt" }).click();
  }

  /**
   * Velg inntektskilde for en spesifikk rad (0-basert)
   */
  async velgInntektskildeNr(indeks: number, label: string): Promise<void> {
    await this.page.locator(`select[name="inntektskilder[${indeks}].kildetype"]`).selectOption({ label });
  }

  /**
   * Fyll inn bruttoinntekt for en spesifikk rad (0-basert)
   */
  async fyllInnBruttoinntektNr(indeks: number, beløp: string): Promise<void> {
    const field = this.page.locator(`input[name="inntektskilder[${indeks}].bruttoInntekt"]`);
    await field.click();
    await field.fill(beløp);
  }

  /**
   * Fyll inn bruttoinntekt (første rad) og vent på beregning-respons fra API.
   * Venter på at "Foreløpig beregnet trygdeavgift"-heading vises.
   */
  async fyllInnBruttoinntektOgVentPåBeregning(beløp: string): Promise<void> {
    const beregningResponse = this.page.waitForResponse(
      (resp) =>
        (resp.url().includes("eos-pensjonist/beregning") || resp.url().includes("trygdeavgift/beregning")) &&
        resp.status() === 200,
      { timeout: 15000 },
    );
    const field = this.page.getByLabel("Bruttoinntekt");
    await field.click();
    await field.fill(beløp);
    await field.press("Tab");
    await beregningResponse;
    await expect(this.page.getByRole("heading", { name: "Foreløpig beregnet trygdeavgift" })).toBeVisible({
      timeout: 15000,
    });
  }

  /**
   * Fyll inn bruttoinntekt for andre inntektskilde og vent på beregning.
   */
  async fyllInnBruttoinntektNrOgVentPåBeregning(indeks: number, beløp: string): Promise<void> {
    const beregningResponse = this.page.waitForResponse(
      (resp) =>
        (resp.url().includes("eos-pensjonist/beregning") || resp.url().includes("trygdeavgift/beregning")) &&
        resp.status() === 200,
      { timeout: 15000 },
    );
    await this.fyllInnBruttoinntektNr(indeks, beløp);
    await this.page.locator(`input[name="inntektskilder[${indeks}].bruttoInntekt"]`).press("Tab");
    await beregningResponse;
    await expect(this.page.getByRole("heading", { name: "Foreløpig beregnet trygdeavgift" })).toBeVisible({
      timeout: 15000,
    });
  }

  // === Beregningsresultat-verifisering ===

  /**
   * Verifiser at infomelding for minstebeløp vises
   */
  async verifiserInfomeldingMinstebeløpSynlig(): Promise<void> {
    await expect(
      this.page.getByText("Trygdeavgift skal ikke betales da inntekten er under minstebeløpet."),
    ).toBeVisible();
  }

  /**
   * Verifiser at infomelding for minstebeløp IKKE vises
   */
  async verifiserInfomeldingMinstebeløpIkkeSynlig(): Promise<void> {
    await expect(
      this.page.getByText("Trygdeavgift skal ikke betales da inntekten er under minstebeløpet."),
    ).not.toBeVisible();
  }

  /**
   * Verifiser at beregningsresultat-tabellen vises
   */
  async verifiserTrygdeavgiftsTabellSynlig(): Promise<void> {
    await expect(this.page.getByRole("columnheader", { name: "Trygdeperiode" })).toBeVisible();
  }

  /**
   * Verifiser at beregningsresultat-tabellen IKKE vises
   */
  async verifiserTrygdeavgiftsTabellIkkeSynlig(): Promise<void> {
    await expect(this.page.getByRole("columnheader", { name: "Trygdeperiode" })).not.toBeVisible();
  }

  /**
   * Verifiser at * (25%-regel) vises i sats-kolonnen med fotnote
   */
  async verifiser25ProsentRegel(): Promise<void> {
    await this.verifiserTrygdeavgiftsTabellSynlig();
    await expect(this.page.getByRole("cell", { name: "*" })).toBeVisible();
    await expect(this.page.getByText("* Beregnet etter 25 %-regelen")).toBeVisible();
  }

  /**
   * Verifiser at *** (sammenslåtte inntektskilder) vises med fotnote
   */
  async verifiserSammenslåtteInntektskilder(): Promise<void> {
    await this.verifiserTrygdeavgiftsTabellSynlig();
    await expect(this.page.getByRole("cell", { name: "***" })).toBeVisible();
    await expect(this.page.getByText("*** Mer enn en inntektskilde")).toBeVisible();
  }

  /**
   * Verifiser at Dekning-kolonnen viser Helsedel og Pensjonsdel
   */
  async verifiserHelsePensjonsdel(): Promise<void> {
    await expect(this.page.getByRole("columnheader", { name: "Dekning" })).toBeVisible();
    await expect(this.page.getByRole("cell", { name: "Helsedel" })).toBeVisible();
    await expect(this.page.getByRole("cell", { name: "Pensjonsdel" })).toBeVisible();
  }
}
