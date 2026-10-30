import { expect, Locator, Page } from "@playwright/test";

const INNGANG = "Oppgi opplysninger fra søknaden";
const VIRKSOMHET = "Virksomhet";
const BESTEMMELSE = "Bestemmelse og vurdering";
const INGEN_FLYT_MELDING = "Du kan ikke gå videre, men:";

/**
 * Page Object for stegene Inngang, Virksomhet og Bestemmelse i en trygdeavtale-behandling (Avtaleland)
 */
export class TrygdeavtalePage {
  constructor(readonly page: Page) {}

  private get aktivtSteg(): Locator {
    return this.page.locator(".stegFane--aktiv");
  }

  private get fraOgMed(): Locator {
    return this.aktivtSteg.getByRole("textbox", { name: "Fra og med" });
  }

  private get tilOgMed(): Locator {
    return this.aktivtSteg.getByRole("textbox", { name: /^Til og med/ });
  }

  private get arbeidsland(): Locator {
    return this.aktivtSteg.getByRole("combobox", { name: /^Arbeidsland/ });
  }

  private get bestemmelse(): Locator {
    return this.aktivtSteg.getByRole("combobox", { name: "Velg bestemmelse" });
  }

  private get tilleggsbestemmelse(): Locator {
    return this.aktivtSteg.getByRole("checkbox");
  }

  private get bekreftOgFortsettKnapp(): Locator {
    return this.aktivtSteg.getByRole("button", { name: "Bekreft og fortsett", exact: true });
  }

  private get innhentRegisteropplysningerKnapp(): Locator {
    return this.aktivtSteg.getByRole("button", { name: "Innhent registeropplysninger", exact: true });
  }

  private async verifiserSteg(tittel: string): Promise<void> {
    await expect(this.aktivtSteg.getByRole("heading", { name: tittel, exact: true })).toBeVisible();
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
    await this.verifiserSteg(INNGANG);
  }

  // === Inngang ===

  async fyllPeriode(fom: string, tom: string): Promise<void> {
    await this.fraOgMed.fill(fom);
    await this.fraOgMed.press("Tab");
    await this.tilOgMed.fill(tom);
    await this.tilOgMed.press("Tab");
  }

  async velgArbeidsland(land: string): Promise<void> {
    await this.arbeidsland.selectOption({ label: land });
  }

  async verifiserInngang({ fom, tom, land }: { fom: string; tom: string; land: string }): Promise<void> {
    await expect(this.fraOgMed).toHaveValue(fom);
    await expect(this.tilOgMed).toHaveValue(tom);
    await expect(this.arbeidsland.locator("option:checked")).toHaveText(land);
  }

  /**
   * Verifiser at landet ikke har støtte i flyten: melding og «Innhent registeropplysninger» i stedet for «Bekreft og fortsett»
   */
  async verifiserLandUtenStøtte(): Promise<void> {
    await expect(this.aktivtSteg.getByText(INGEN_FLYT_MELDING)).toBeVisible();
    await expect(this.innhentRegisteropplysningerKnapp).toBeEnabled();
    await expect(this.bekreftOgFortsettKnapp).toHaveCount(0);
  }

  async bekreftInngang(): Promise<void> {
    await this.bekreftOgFortsettKnapp.click();
    await this.verifiserSteg(VIRKSOMHET);
  }

  // === Virksomhet ===

  async velgVirksomhet(navn: string): Promise<void> {
    await this.aktivtSteg.getByRole("radio", { name: navn }).check();
  }

  async verifiserValgtVirksomhet(navn: string): Promise<void> {
    await expect(this.aktivtSteg.getByRole("radio", { name: navn })).toBeChecked();
  }

  async verifiserVirksomhetIkkeValgt(navn: string): Promise<void> {
    await expect(this.aktivtSteg.getByRole("radio", { name: navn })).not.toBeChecked();
  }

  async bekreftVirksomhet(): Promise<void> {
    await this.bekreftOgFortsettKnapp.click();
    await this.verifiserSteg(BESTEMMELSE);
  }

  // === Bestemmelse ===

  async velgVedtak(vedtak: string): Promise<void> {
    await this.aktivtSteg.getByRole("radio", { name: vedtak }).check();
  }

  async velgBestemmelse(bestemmelse: string): Promise<void> {
    await this.bestemmelse.selectOption({ label: bestemmelse });
  }

  async velgTilleggsbestemmelse(): Promise<void> {
    await this.tilleggsbestemmelse.check();
  }

  async verifiserBestemmelse({
    vedtak,
    bestemmelse,
    tilleggsbestemmelse,
  }: {
    vedtak: string;
    bestemmelse?: string;
    tilleggsbestemmelse?: boolean;
  }): Promise<void> {
    await expect(this.aktivtSteg.getByRole("radio", { name: vedtak })).toBeChecked();
    if (bestemmelse === undefined) {
      await expect(this.bestemmelse).toHaveCount(0);
    } else {
      await expect(this.bestemmelse.locator("option:checked")).toHaveText(bestemmelse);
    }
    if (tilleggsbestemmelse === undefined) {
      await expect(this.tilleggsbestemmelse).toHaveCount(0);
    } else if (tilleggsbestemmelse) {
      await expect(this.tilleggsbestemmelse).toBeChecked();
    } else {
      await expect(this.tilleggsbestemmelse).not.toBeChecked();
    }
  }

  async verifiserIngenFlytMelding(synlig: boolean): Promise<void> {
    await expect(this.aktivtSteg.getByText(INGEN_FLYT_MELDING)).toHaveCount(synlig ? 1 : 0);
  }

  async verifiserKanFortsette(): Promise<void> {
    await expect(this.bekreftOgFortsettKnapp).toBeEnabled();
  }

  async verifiserKanIkkeFortsette(): Promise<void> {
    await expect(this.bekreftOgFortsettKnapp).toBeDisabled();
  }
}
