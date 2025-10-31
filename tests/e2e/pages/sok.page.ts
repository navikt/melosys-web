import { expect, Locator, Page } from "@playwright/test";

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
   * Verifiser at siden viser korrekte søkeresultater for et organisasjonsnummer
   * @param orgNr - et gyldig organisasjonsnummer
   */
  async verifyValidOrgSearchResults(orgNr: string): Promise<void> {
    await this.verifySearchResultsPage();

    await expect(this.page.locator(`h2:has-text('Resultater for org.nr. ${orgNr}')`)).toBeVisible();
    await expect(this.page.locator(`text=Fant ingen saker knyttet til org.nr. ${orgNr}`)).not.toBeVisible();
    await expect(this.page.locator(".fagsak").first()).toBeVisible();
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
   * Vent på at søkeresultatene er lastet og stabile
   * @deprecated Use hovedsidePage.ventPåSøkeresultat() or hovedsidePage.søkOgVentPåResultat() instead
   * @param userId - bruker-ID som det ble søkt etter
   */
  async waitForSearchResults(userId: string): Promise<void> {
    await this.page.waitForSelector(`text=Resultater for f.nr./d-nr. ${userId}`, {
      state: "visible",
    });
    await this.page.waitForTimeout(500);
  }

  /**
   * Finn alle saker avhengig av sakstype og behandlingsstatus
   * @param sakstype - "Avtaleland", "Utenfor avtaleland", eller "EU/EØS-land"
   * @param behandlingsstatus - Valgfri status, f.eks. "Behandlingen er avsluttet" eller "Behandlingen pågår"
   * @returns Locator for alle saker av den typen med sakId lagt på
   */
  async finnSak(
    sakstype: "Utenfor avtaleland" | "Avtaleland" | "EU/EØS-land",
    behandlingsstatus?:
      | "Behandlingen er opprettet"
      | "Behandlingen pågår"
      | "Behandlingen er avsluttet"
      | "Søknaden er henlagt",
  ): Promise<Locator[]> {
    // Vent på at minst én fagsak er lastet
    await expect(this.page.locator(".fagsak").first()).toBeVisible();

    const baseSelector = `.fagsak:has-text("${sakstype}")`;
    const selector = behandlingsstatus ? `${baseSelector}:has-text("${behandlingsstatus}")` : baseSelector;

    const saker = this.page.locator(selector);
    const antall = await saker.count();
    const result: Locator[] = [];

    for (let i = 0; i < antall; i++) {
      const sak = saker.nth(i);
      (sak as unknown as Record<string, unknown>)._sakId = await this.getSaksnummer(sak);
      result.push(sak);
    }

    return result;
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
   * Sjekk om en sak har "Vis behandling" knapp
   * @param sak - Sak-locator
   * @returns true hvis knappen finnes
   */
  async sakHarVisBehandlingKnapp(sak: Locator): Promise<boolean> {
    return await sak
      .locator('button:has-text("Vis behandling")')
      .isVisible()
      .catch(() => false);
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
    const visBehandlingKnapp = sak.locator('button:has-text("Vis behandling")').first();

    await expect(visBehandlingKnapp).toBeVisible({ timeout: 10000 });
    await visBehandlingKnapp.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Sjekk om en sak har en bestemt behandlingsstatus
   * @param sak - Sak-locator
   * @param status - Status tekst å lete etter (f.eks. "Behandlingen er avsluttet")
   * @returns true hvis saken har den statusen
   */
  async harStatus(sak: Locator, status: string): Promise<boolean> {
    return await sak
      .locator(`:has-text("${status}")`)
      .isVisible()
      .catch(() => false);
  }

  /**
   * Hent "Vis behandling" knapp fra en sak
   * @param sak - Sak-locator
   * @returns Locator for knappen
   */
  getVisBehandlingKnapp(sak: Locator): Locator {
    return sak.locator('button:has-text("Vis behandling")');
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
