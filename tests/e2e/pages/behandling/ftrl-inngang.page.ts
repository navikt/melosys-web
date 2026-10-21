import { expect, Locator, Page, Request } from "@playwright/test";
import type { ArbeidslandRequest, MottatteOpplysningerRequest } from "../../mocks/ftrlInngangMock";

const ARBEIDSLAND = "Arbeidsland";
const AVTALELAND_ADVARSEL = "Ett eller flere av landene du har valgt er EØS- eller avtaleland";

export interface LagretInngang {
  mottatteOpplysninger: MottatteOpplysningerRequest;
  arbeidsland: ArbeidslandRequest;
}

/**
 * Page Object for Inngang-steget «Oppgi opplysninger fra søknaden» i FTRL (Utenfor avtaleland)
 */
export class FtrlInngangPage {
  constructor(readonly page: Page) {}

  private get aktivtSteg(): Locator {
    return this.page.locator(".stegFane--aktiv");
  }

  private get arbeidsland(): Locator {
    return this.aktivtSteg.getByRole("combobox", { name: ARBEIDSLAND, exact: true });
  }

  private get bekreftOgFortsettKnapp(): Locator {
    return this.aktivtSteg.getByRole("button", { name: "Bekreft og fortsett", exact: true });
  }

  private valgtLand(land: string): Locator {
    return this.aktivtSteg.getByRole("button", { name: `${land} slett`, exact: true });
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
    await expect(this.aktivtSteg.getByRole("heading", { name: "Oppgi opplysninger fra søknaden" })).toBeVisible();
  }

  /**
   * Søk etter landet i arbeidsland-listen og velg det
   */
  async velgArbeidsland(land: string, søketekst: string = land): Promise<void> {
    await this.arbeidsland.fill(søketekst);
    await this.page.getByRole("option", { name: land, exact: true }).click();
    await this.arbeidsland.press("Escape");
    await expect(this.valgtLand(land)).toBeVisible();
  }

  async fjernArbeidsland(land: string): Promise<void> {
    await this.valgtLand(land).click();
    await expect(this.valgtLand(land)).toHaveCount(0);
  }

  /**
   * Verifiser at nøyaktig de oppgitte landene er valgt
   */
  async verifiserValgteArbeidsland(forventet: string[]): Promise<void> {
    await expect(this.arbeidsland).toBeVisible();
    await expect(this.aktivtSteg.getByRole("button", { name: / slett$/ })).toHaveCount(forventet.length);
    for (const land of forventet) {
      await expect(this.valgtLand(land)).toBeVisible();
    }
  }

  async verifiserFeilmelding(tekst: string): Promise<void> {
    await expect(this.aktivtSteg.getByText(tekst, { exact: true })).toBeVisible();
  }

  async verifiserIngenFeilmelding(tekst: string): Promise<void> {
    await expect(this.aktivtSteg.getByText(tekst, { exact: true })).toHaveCount(0);
  }

  async verifiserAvtalelandAdvarsel(synlig: boolean): Promise<void> {
    await expect(this.aktivtSteg.getByText(AVTALELAND_ADVARSEL)).toHaveCount(synlig ? 1 : 0);
  }

  async verifiserKanFortsette(): Promise<void> {
    await expect(this.bekreftOgFortsettKnapp).toBeEnabled();
  }

  async verifiserKanIkkeFortsette(): Promise<void> {
    await expect(this.bekreftOgFortsettKnapp).toBeDisabled();
  }

  /**
   * Klikk «Bekreft og fortsett», vent til registeropplysninger er oppfrisket og Virksomhet-steget vises,
   * og returner siste lagring av mottatte opplysninger og arbeidsland
   */
  async bekreftOgHentLagring(): Promise<LagretInngang> {
    const poster: Request[] = [];
    const lytter = (request: Request) => {
      if (request.method() === "POST") poster.push(request);
    };
    this.page.on("request", lytter);

    await this.bekreftOgFortsettKnapp.click();
    await expect(this.aktivtSteg.getByRole("heading", { name: "Virksomhet", exact: true })).toBeVisible();
    this.page.off("request", lytter);

    const sisteMed = <T>(prefiks: string, suffiks = "") => {
      const treff = poster.filter((r) => {
        const { pathname } = new URL(r.url());
        return pathname.startsWith(prefiks) && pathname.endsWith(suffiks);
      });
      expect(treff.length, `Ingen POST til ${prefiks}…${suffiks}`).toBeGreaterThan(0);
      return treff[treff.length - 1].postDataJSON() as T;
    };

    return {
      mottatteOpplysninger: sisteMed<MottatteOpplysningerRequest>("/api/mottatteopplysninger/"),
      arbeidsland: sisteMed<ArbeidslandRequest>("/api/avklartefakta/", "/arbeidsland"),
    };
  }
}
