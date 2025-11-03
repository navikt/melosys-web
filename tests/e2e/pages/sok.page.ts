import { expect, Locator, Page } from "@playwright/test";
import { getSaksnummerFraLocator } from "../utils/testUtils";

/**
 * Page Object Model for søkesiden
 */
export class SokPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
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
    await expect(this.page.locator(".fagsak").first(), "Minst én fagsak skal være synlig").toBeVisible();

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

    await expect(visBehandlingKnapp, `${getSaksnummerFraLocator(sak)}: "Vis behandling" knapp ikke funnet`).toBeVisible(
      {
        timeout: 10000,
      },
    );
    await visBehandlingKnapp.click();
    await this.page.waitForLoadState("domcontentloaded");
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
    await expect(this.page.locator(".fagsak").first(), "Minst én fagsak skal være synlig").toBeVisible();

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
