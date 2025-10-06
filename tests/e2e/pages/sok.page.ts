import { expect, Locator, Page } from "@playwright/test";
import { getSakId } from "../utils/testUtils";

/**
 * Page Object Model for søkesiden
 */
export class SokPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Verifiser at vi er på søkesiden
   */
  async verifySearchResultsPage(): Promise<void> {
    await expect(this.page).toHaveURL("/melosys/sok");
    await expect(this.page.locator("h1:has-text('Saksoversikt')")).toBeVisible();
  }

  /**
   * Verifiser at siden viser korrekt info for en gyldig id
   * @param id - en gyldig id
   */
  async verifyValidSearchResults(id: string): Promise<void> {
    await this.verifySearchResultsPage();

    await expect(this.page.locator(`h2:has-text('Resultater for f.nr./d-nr. ${id}')`)).toBeVisible();

    // Sjekk om det finnes saker eller om "ingen saker funnet" meldingen vises
    const noResultsMessage = this.page.locator(`text=Fant ingen saker knyttet til f.nr./d-nr.`);
    const firstCase = this.page.locator(".fagsak").first();

    const hasResults = await firstCase.isVisible();
    const hasNoResultsMessage = await noResultsMessage.isVisible();

    // For en gyldig ID skal enten saker vises ELLER "ingen saker funnet" meldingen
    const hasValidState = hasResults || hasNoResultsMessage;
    expect(hasValidState, `For gyldig ID ${id} skal det enten være saker eller "ingen saker funnet" melding`).toBe(
      true,
    );

    // Hvis det er resultater, skal ikke "ingen saker funnet" meldingen vises
    if (hasResults) {
      await expect(noResultsMessage).not.toBeVisible();
    }
  }

  /**
   * Verifiser at siden viser korrekt info for en ugyldig id
   * @param id - en ugyldig id
   */
  async verifyInvalidSearchResults(id: string): Promise<void> {
    await this.verifySearchResultsPage();

    await expect(this.page.locator(`h2:has-text('Resultater for saksnummer ${id}')`)).toBeVisible();
    await expect(this.page.locator(`text=Fant ingen saker knyttet til saksnummer ${id}`)).toBeVisible();
  }

  /**
   * Finn sak med spesifikt saksnummer
   * @param saksnummer - saksnummer (f.eks. "MEL-123")
   * @returns Locator for saken med sakId lagt til
   */
  finnSakBySaksnummer(saksnummer: string): Locator {
    const sak = this.page.locator(`.fagsak:has-text("${saksnummer}")`).first();
    (sak as unknown as Record<string, unknown>)._sakId = saksnummer;
    return sak;
  }

  /**
   * Hent saksnummer fra en sak
   * @param sak - Sak-locator
   * @returns Saksnummer (f.eks. "MEL-123") eller "ukjent"
   */
  async getSaksnummer(sak: Locator): Promise<string> {
    // Prøv å finne saksnummer i href fra hvilken som helst link
    const linkWithMel = sak.locator("a[href*='/MEL-']").first();
    if ((await linkWithMel.count()) > 0) {
      const href = await linkWithMel.getAttribute("href", { timeout: 1000 });
      const saksnummer = href?.match(/MEL-\d+/)?.[0];
      if (saksnummer) return saksnummer;
    }

    // Prøv å finne saksnummer som tekst
    const text = await sak.textContent();
    const saksnummer = text?.match(/MEL-\d+/)?.[0];
    if (saksnummer) return saksnummer;

    return "ukjent";
  }

  /**
   * Klikk på "Vis behandling" knapp for en sak
   * @param sak - Sak-locator
   */
  async klikkVisBehandling(sak: Locator): Promise<void> {
    const sakId = getSakId(sak);
    const visBehandlingKnapp = sak.locator('button:has-text("Vis behandling")').first();

    try {
      await expect(visBehandlingKnapp).toBeVisible();
      await visBehandlingKnapp.click();
      await this.page.waitForLoadState("domcontentloaded");
    } catch (error) {
      throw new Error(`Kunne ikke klikke på "Vis behandling" for sak ${sakId}: ${error}`);
    }
  }

  /**
   * Finn alle åpne saker for en gitt sakstype
   * @param sakstype - "Avtaleland", "Utenfor avtaleland", eller "EU/EØS-land"
   * @param behandlingstype - Valgfri: "Årsavregning", "Førstegangsbehandling", etc.
   * @returns Locator for alle saker av den typen med åpen behandling
   */
  async finnÅpneSaker(
    sakstype: "Utenfor avtaleland" | "Avtaleland" | "EU/EØS-land",
    behandlingstype?: string,
  ): Promise<Locator[]> {
    // Vent på at minst én fagsak er lastet
    await expect(this.page.locator(".fagsak").first()).toBeVisible();

    let baseSelector = `.fagsak:has-text("${sakstype}")`;
    if (behandlingstype) {
      baseSelector += `:has-text("${behandlingstype}")`;
    }

    const opprettetSaker = this.page.locator(`${baseSelector}:has-text("Behandlingen er opprettet")`);
    const pågårSaker = this.page.locator(`${baseSelector}:has-text("Behandlingen pågår")`);

    const antallOpprettet = await opprettetSaker.count();
    const antallPågår = await pågårSaker.count();
    const result: Locator[] = [];

    for (let i = 0; i < antallOpprettet; i++) {
      const sak = opprettetSaker.nth(i);
      (sak as unknown as Record<string, unknown>)._sakId = await this.getSaksnummer(sak);
      result.push(sak);
    }

    for (let i = 0; i < antallPågår; i++) {
      const sak = pågårSaker.nth(i);
      (sak as unknown as Record<string, unknown>)._sakId = await this.getSaksnummer(sak);
      result.push(sak);
    }

    return result;
  }
}
