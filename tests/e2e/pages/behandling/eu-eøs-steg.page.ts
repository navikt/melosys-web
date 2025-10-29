import { expect, Page } from "@playwright/test";

/**
 * Page Object Model for EU/EØS-stegvelger
 * Håndterer navigasjon gjennom stegene i EU/EØS-flyten
 */
export class EuEøsStegPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Klikk "Bekreft og fortsett" for å gå til neste steg
   */
  async klikkBekreftOgFortsett(saksnummer?: string): Promise<void> {
    const bekreftKnapp = this.page.getByRole("button", { name: "Bekreft og fortsett" });
    const sakId = saksnummer ? `for sak ${saksnummer}` : "";
    await expect(bekreftKnapp, `"Bekreft og fortsett"-knappen ${sakId} skal være synlig`).toBeVisible({
      timeout: 5000,
    });
    await expect(bekreftKnapp, `"Bekreft og fortsett"-knappen ${sakId} skal være aktivert`).toBeEnabled({
      timeout: 2000,
    });
    await bekreftKnapp.click();

    // Vent på at neste steg lastes
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForTimeout(500);
  }

  /**
   * Velg første virksomhet i Virksomhet-steget
   */
  async velgFørsteVirksomhet(saksnummer?: string): Promise<void> {
    // Finn første checkbox i virksomhetslisten (NAV Frontend skjuler input, så vi må bruke role)
    const førsteCheckbox = this.page.getByRole("checkbox").first();
    const sakId = saksnummer ? `for sak ${saksnummer}` : "";
    await expect(førsteCheckbox, `Første virksomhet-checkbox ${sakId} skal være synlig`).toBeVisible({ timeout: 5000 });
    await førsteCheckbox.check();
  }

  /**
   * Verifiser at vi er på periode-steget
   */
  async verifiserPeriodeSteg(saksnummer?: string): Promise<void> {
    const sakId = saksnummer ? `for sak ${saksnummer}` : "";
    // Verifiser stegtittel
    await expect(
      this.page.getByRole("heading", { name: "Lovvalgsbestemmelse og -periode" }),
      `Periode-steg tittel ${sakId} skal være synlig`,
    ).toBeVisible({
      timeout: 5000,
    });

    // Verifiser at nedtrekksmeny for lovvalgsbestemmelse finnes
    await expect(
      this.page.getByLabel("Velg en lovvalgsbestemmelse"),
      `Lovvalgsbestemmelse-nedtrekksmeny ${sakId} skal være synlig`,
    ).toBeVisible();
  }

  /**
   * Verifiser stegtittel
   */
  async verifiserStegtittel(tittel: string, saksnummer?: string): Promise<void> {
    const sakId = saksnummer ? `for sak ${saksnummer}` : "";
    await expect(
      this.page.getByRole("heading", { name: tittel }),
      `Stegtittel "${tittel}" ${sakId} skal være synlig`,
    ).toBeVisible();
  }

  /**
   * Verifiser at lovvalgsbestemmelse-nedtrekksmeny vises
   */
  async verifiserLovvalgsbestemmelseSelect(saksnummer?: string): Promise<void> {
    const select = this.page.getByLabel("Velg en lovvalgsbestemmelse");
    const sakId = saksnummer ? `for sak ${saksnummer}` : "";
    await expect(select, `Lovvalgsbestemmelse-nedtrekksmeny ${sakId} skal være synlig`).toBeVisible();
  }

  /**
   * Verifiser at et bestemt lovvalgsbestemmelse-alternativ finnes
   */
  async verifiserLovvalgsbestemmelseAlternativ(alternativTekst: string, saksnummer?: string): Promise<void> {
    // Option-elementer er teknisk "hidden" (inne i select), så vi sjekker kun at de finnes
    const sakId = saksnummer ? `for sak ${saksnummer}` : "";
    await expect(
      this.page.locator(`option:has-text("${alternativTekst}")`),
      `Lovvalgsbestemmelse-alternativ "${alternativTekst}" ${sakId} skal finnes`,
    ).toHaveCount(1);
  }

  /**
   * Verifiser at lovvalgsperiode-tekst vises
   */
  async verifiserLovvalgsperiodeVises(saksnummer?: string): Promise<void> {
    const sakId = saksnummer ? `for sak ${saksnummer}` : "";
    await expect(
      this.page.getByText("Lovvalgsperiode"),
      `Lovvalgsperiode-tekst ${sakId} skal være synlig`,
    ).toBeVisible();
  }

  /**
   * Verifiser at checkboks for kortere periode vises
   */
  async verifiserKorterePeriodeCheckboks(saksnummer?: string): Promise<void> {
    const checkboks = this.page.getByRole("checkbox", { name: "Lovvalget innvilges for en kortere periode" });
    const sakId = saksnummer ? `for sak ${saksnummer}` : "";
    await expect(checkboks, `Kortere periode-checkboks ${sakId} skal være synlig`).toBeVisible();
  }

  /**
   * Velg lovvalgsbestemmelse i periode-steget
   * @param bestemmelse - Kode for lovvalgsbestemmelse
   */
  async velgLovvalgsbestemmelse(
    bestemmelse: "FO_883_2004_ART11_3B" | "FO_883_2004_ART11_5",
    saksnummer?: string,
  ): Promise<void> {
    const select = this.page.getByLabel("Velg en lovvalgsbestemmelse");
    const sakId = saksnummer ? `for sak ${saksnummer}` : "";
    await expect(select, `Lovvalgsbestemmelse-nedtrekksmeny ${sakId} skal være synlig`).toBeVisible();
    await select.selectOption(bestemmelse);
  }

  /**
   * Huk av checkboks for kortere lovvalgsperiode
   */
  async hukAvKorterePeriode(saksnummer?: string): Promise<void> {
    const checkboks = this.page.getByRole("checkbox", { name: "Lovvalget innvilges for en kortere periode" });
    const sakId = saksnummer ? `for sak ${saksnummer}` : "";
    await expect(checkboks, `Kortere periode-checkboks ${sakId} skal være synlig`).toBeVisible();
    await checkboks.check();

    // Vent på at datofelter vises
    await expect(this.page.getByLabel("Startdato"), `Startdato-felt ${sakId} skal være synlig`).toBeVisible();
    await expect(this.page.getByLabel("Sluttdato"), `Sluttdato-felt ${sakId} skal være synlig`).toBeVisible();
  }

  /**
   * Verifiser at datofelter vises
   */
  async verifiserDatofelterVises(saksnummer?: string): Promise<void> {
    const sakId = saksnummer ? `for sak ${saksnummer}` : "";
    await expect(this.page.getByLabel("Startdato"), `Startdato-felt ${sakId} skal være synlig`).toBeVisible();
    await expect(this.page.getByLabel("Sluttdato"), `Sluttdato-felt ${sakId} skal være synlig`).toBeVisible();
  }

  /**
   * Fyll inn kun startdato (for testing av validering)
   */
  async fyllInnKunStartdato(fomDato: string): Promise<void> {
    await this.page.getByLabel("Startdato").fill(fomDato);
  }

  /**
   * Fyll inn kun sluttdato (for testing av validering)
   */
  async fyllInnKunSluttdato(tomDato: string): Promise<void> {
    await this.page.getByLabel("Sluttdato").fill(tomDato);
  }

  /**
   * Klikk "Bekreft og fortsett" uten å vente på suksess (for testing av validering)
   */
  async klikkBekreftOgFortsettUtenValidering(): Promise<void> {
    const bekreftKnapp = this.page.getByRole("button", { name: "Bekreft og fortsett" });
    await bekreftKnapp.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Verifiser at vi har navigert til vedtak-steg
   */
  async verifiserVedtakSteg(saksnummer?: string): Promise<void> {
    // Bruk heading-rolle for å unngå å matche dokumentlinker og knapper
    const sakId = saksnummer ? `for sak ${saksnummer}` : "";
    await expect(
      this.page.getByRole("heading", { name: /vedtak/i }),
      `Vedtak-steg heading ${sakId} skal være synlig`,
    ).toBeVisible({ timeout: 5000 });
  }

  /**
   * Fyll inn periode-datoer
   * @param fomDato - Startdato i format dd.mm.yyyy
   * @param tomDato - Sluttdato i format dd.mm.yyyy
   */
  async fyllInnPeriodeDatoer(fomDato: string, tomDato: string): Promise<void> {
    await this.page.getByLabel("Startdato").fill(fomDato);
    await this.page.getByLabel("Sluttdato").fill(tomDato);
  }

  /**
   * Fyll inn komplett periode-steg med lovvalgsbestemmelse og periode
   * @param bestemmelse - Kode for lovvalgsbestemmelse
   * @param korterePeriode - Om perioden skal forkortes
   * @param fomDato - Startdato (kun hvis korterePeriode er true)
   * @param tomDato - Sluttdato (kun hvis korterePeriode er true)
   */
  async fyllInnPeriodeSteg(
    bestemmelse: "FO_883_2004_ART11_3B" | "FO_883_2004_ART11_5",
    korterePeriode: boolean = false,
    fomDato?: string,
    tomDato?: string,
  ): Promise<void> {
    await this.verifiserPeriodeSteg();
    await this.velgLovvalgsbestemmelse(bestemmelse);

    if (korterePeriode && fomDato && tomDato) {
      await this.hukAvKorterePeriode();
      await this.fyllInnPeriodeDatoer(fomDato, tomDato);
    }
  }

  /**
   * Verifiser at valideringsfeil vises
   * @param feilmelding - Delvis tekst fra feilmeldingen
   */
  async verifiserValideringsfeil(feilmelding: string, saksnummer?: string): Promise<void> {
    const sakId = saksnummer ? `for sak ${saksnummer}` : "";
    await expect(
      this.page.getByText(new RegExp(feilmelding, "i")),
      `Valideringsfeil med tekst "${feilmelding}" ${sakId} skal være synlig`,
    ).toBeVisible({ timeout: 3000 });
  }

  /**
   * Verifiser at "Bekreft og fortsett"-knappen er disabled
   */
  async verifiserBekreftKnappErDisabled(saksnummer?: string): Promise<void> {
    const bekreftKnapp = this.page.getByRole("button", { name: "Bekreft og fortsett" });
    const sakId = saksnummer ? `for sak ${saksnummer}` : "";
    await expect(bekreftKnapp, `"Bekreft og fortsett"-knappen ${sakId} skal være deaktivert`).toBeDisabled();
  }

  /**
   * Verifiser at "Bekreft og fortsett"-knappen er enabled
   */
  async verifiserBekreftKnappErEnabled(saksnummer?: string): Promise<void> {
    const bekreftKnapp = this.page.getByRole("button", { name: "Bekreft og fortsett" });
    const sakId = saksnummer ? `for sak ${saksnummer}` : "";
    await expect(bekreftKnapp, `"Bekreft og fortsett"-knappen ${sakId} skal være aktivert`).toBeEnabled();
  }
}
