import { expect, Locator, Page } from "@playwright/test";
import { OpprettNySakAssertions } from "./opprett-ny-sak-assertions.page";

const SELECT_TIMEOUT = 100; // Ventetid etter valg i dropdown for at avhengige felter skal oppdatere seg

// UI Constants
const SELECTORS = {
  OPPRETT_NY_BEHANDLING_BUTTON: "button:has-text('Opprett ny behandling')",
  AVBRYT_BUTTON: "button:has-text('Avbryt')",
  VIS_FLERE_SAKER_BUTTON: 'button:has-text("Vis flere saker")',
  CUSTOM_RADIO_PANEL_TITLE: ".customRadioPanelTittel",
} as const;

/**
 * Page Object Model for opprett ny sak - Actions only
 * This class contains all methods that perform actions (clicks, selections, inputs)
 */
export class OpprettNySakPage {
  readonly page: Page;
  readonly assertions: OpprettNySakAssertions;

  constructor(page: Page) {
    this.page = page;
    this.assertions = new OpprettNySakAssertions(page);
  }

  /**
   * Velg sak ved index
   */
  async velgSakVedIndex(index: number): Promise<void> {
    const sak = this.page.locator(".customRadioPanel").nth(index);
    await expect(sak).toBeVisible();
    await sak.click();
  }

  /**
   * Fyll inn bruker-ID
   */
  async fyllInnBrukerId(userID: string): Promise<void> {
    const userIdInput = this.page.locator("input[name='brukerID']");
    await expect(userIdInput).toBeVisible();
    await userIdInput.fill(userID);
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Fyll inn organisasjonsnummer
   */
  async fyllInnOrganisasjonsnummer(orgNumber: string): Promise<void> {
    const orgNumberInput = this.page.locator("input[name='virksomhetOrgnr']");
    await expect(orgNumberInput).toBeVisible();
    await orgNumberInput.fill(orgNumber);
  }

  /**
   * Velg "Opprett ny sak"
   */
  async velgOpprettNySak(): Promise<void> {
    const undertittel = this.page.locator(
      ".opprettnysak .undertittel:has-text('Knytt til eksisterende sak eller opprett ny')",
    );

    try {
      await expect(undertittel).toBeVisible({ timeout: 5000 });
    } catch {
      return;
    }

    // Vent på at siden har lastet ferdig (enten "Ingen saker" melding eller radioknappene)
    await this.page.waitForTimeout(1000);

    const ingenSakerMelding = this.page.locator(
      ".opprettnysak :text('Ingen eksisterende saker funnet. Du må opprette en ny sak.')",
    );
    const ingenSakerFinnes = await ingenSakerMelding.isVisible({ timeout: 2000 }).catch(() => false);

    if (ingenSakerFinnes) {
      return;
    }

    // Det finnes eksisterende saker - velg "Opprett ny sak" radioknapp
    const opprettNySakRadio = this.page.locator(".navds-radio__content:has-text('Opprett ny sak')");
    await expect(opprettNySakRadio, "Kunne ikke finne 'Opprett ny sak").toBeVisible({
      timeout: 10000,
    });
    await opprettNySakRadio.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Velg "Knytt til eksisterende sak"
   */
  async velgKnyttTilEksisterendeSak(): Promise<void> {
    await expect(
      this.page.locator(".opprettnysak .undertittel:has-text('Knytt til eksisterende sak eller opprett ny')"),
    ).toBeVisible();

    const ingenSakerMelding = this.page.locator(
      ".opprettnysak :text('Ingen eksisterende saker funnet. Du må opprette en ny sak.')",
    );
    const ingenSakerFinnes = await ingenSakerMelding.isVisible();

    if (ingenSakerFinnes) {
      throw new Error("Det ble ikke funnet noen noen eksisterende saker å knytte seg til");
    }

    const knyttTilEksSakRadio = this.page.locator(".navds-radio__content:has-text('Eksisterende sak')");
    await expect(knyttTilEksSakRadio).toBeVisible();
    await knyttTilEksSakRadio.click();

    // Klikk på "Vis flere saker" for å få tilgang til alle tilgjengelige saker
    await this.klikkVisFlereSaker();
  }

  /**
   * Klikk "Vis flere saker" knappen hvis den finnes
   */
  async klikkVisFlereSaker(): Promise<void> {
    const visFlereSakerKnapp = this.page.locator(SELECTORS.VIS_FLERE_SAKER_BUTTON);
    const harVisFlereSakerKnapp = await visFlereSakerKnapp.isVisible();
    if (harVisFlereSakerKnapp) {
      await visFlereSakerKnapp.click();
    }
  }

  /**
   * Generisk helper-funksjon for å finne en sak basert på kriterier
   */
  async finnSak(kriterier: {
    sakstype: "Utenfor avtaleland" | "Avtaleland" | "EU/EØS-land";
    behandlingstype?: "Førstegangsbehandling" | "Ny vurdering" | "Klage" | "Henvendelse" | "Årsavregning";
    behandlingsstatus?:
      | "Behandlingen er opprettet"
      | "Behandlingen pågår"
      | "Behandlingen er avsluttet"
      | "Søknaden er henlagt/trukket";
    resultattype?: string;
  }): Promise<Locator | null> {
    const saker = await this.assertions.finnAlleSaker({
      sakstype: kriterier.sakstype,
      behandlingsstatus: kriterier.behandlingsstatus,
      resultattype: kriterier.resultattype,
    });

    if (saker.length > 0) {
      return saker[0];
    }
    return null;
  }

  /**
   * Finn alle åpne saker for en gitt sakstype
   * Åpne saker er saker med behandlingsstatus "Behandlingen er opprettet" eller "Behandlingen pågår"
   */
  async finnÅpneSaker(sakstype: "Utenfor avtaleland" | "Avtaleland" | "EU/EØS-land"): Promise<Locator[]> {
    const åpneSaker: Locator[] = [];

    const opprettetSaker = await this.assertions.finnAlleSaker({
      sakstype,
      behandlingsstatus: "Behandlingen er opprettet",
    });

    const pågåendeSaker = await this.assertions.finnAlleSaker({
      sakstype,
      behandlingsstatus: "Behandlingen pågår",
    });

    åpneSaker.push(...opprettetSaker, ...pågåendeSaker);

    return åpneSaker;
  }

  /**
   * Finn sak med spesifikt saksnummer på knytt-til-eksisterende siden
   * @param saksnummer - saksnummer (f.eks. "MEL-123")
   * @returns Locator for saken med sakId lagt til
   */
  finnSakBySaksnummer(saksnummer: string): Locator {
    const sak = this.page.locator(`.customRadioPanel:has-text("${saksnummer}")`).first();
    (sak as unknown as Record<string, unknown>)._sakId = saksnummer;
    return sak;
  }

  /**
   * Velg første FTRL-sak
   * @param status Valgfri behandlingsstatus å filtrere på (f.eks. "Behandlingen er avsluttet", "pågår", "Behandlingen er opprettet")
   * @returns Det valgte sak-elementet for videre testing
   */
  async velgFørsteFTRLSak(status?: string): Promise<Locator> {
    let selector = '.customRadioPanel:has(.customRadioPanelTittel h1:has-text("Utenfor avtaleland"))';
    if (status) {
      selector += `:has(.behandlingsstatus__span:has-text("${status}"))`;
    }
    const sak = this.page.locator(selector).first();

    try {
      await expect(sak).toBeVisible({
        timeout: 10000,
      });
    } catch (error) {
      const statusText = status ? ` med status "${status}"` : "";
      throw new Error(`Fant ingen FTRL-sak (Utenfor avtaleland)${statusText}. Selector: ${selector}`);
    }

    // Hent sak-ID for bedre feilmeldinger
    const sakId = await sak.locator(".customRadioPanelTittel").textContent();
    const sakIdMatch = sakId?.match(/MEL-\d+/);
    const sakIdString = sakIdMatch ? sakIdMatch[0] : "ukjent";

    await sak.click();

    // Legg til sak-ID til alle påfølgende expect-meldinger
    (sak as any)._sakId = sakIdString;

    return sak;
  }

  /**
   * Velg første EU/EØS-sak
   * @param status Valgfri behandlingsstatus å filtrere på (f.eks. "Behandlingen er avsluttet", "pågår", "Behandlingen er opprettet")
   * @returns Det valgte sak-elementet for videre testing
   */
  async velgFørsteEOSSak(status?: string): Promise<Locator> {
    let selector = '.customRadioPanel:has(.customRadioPanelTittel h1:has-text("EU/EØS-land"))';
    if (status) {
      selector += `:has(.behandlingsstatus__span:has-text("${status}"))`;
    }
    const sak = this.page.locator(selector).first();

    try {
      await expect(sak).toBeVisible({
        timeout: 10000,
      });
    } catch (error) {
      const statusText = status ? ` med status "${status}"` : "";
      throw new Error(`Fant ingen EØS-sak (EU/EØS-land)${statusText}. Selector: ${selector}`);
    }

    // Hent sak-ID for bedre feilmeldinger
    const sakId = await sak.locator(".customRadioPanelTittel").textContent();
    const sakIdMatch = sakId?.match(/MEL-\d+/);
    const sakIdString = sakIdMatch ? sakIdMatch[0] : "ukjent";

    await sak.click();

    // Legg til sak-ID til alle påfølgende expect-meldinger
    (sak as any)._sakId = sakIdString;

    return sak;
  }

  /**
   * Velg første "Utenfor avtaleland"-sak (alias for FTRL)
   */
  async velgFørsteUtenforAvtalelandSak(): Promise<Locator> {
    return await this.velgFørsteFTRLSak();
  }

  /**
   * Velg første Avtaleland-sak
   * @param status Valgfri behandlingsstatus å filtrere på (f.eks. "Behandlingen er avsluttet", "Behandlingen pågår", "Behandlingen er opprettet")
   * @returns Det valgte sak-elementet for videre testing
   */
  async velgFørsteAvtalelandSak(
    status?: "Behandlingen er opprettet" | "Behandlingen pågår" | "Behandlingen er avsluttet" | "Søknaden er henlagt",
  ): Promise<Locator> {
    await this.page.waitForSelector(".customRadioPanel", { timeout: 10000 });

    let selector = '.customRadioPanel:has(.customRadioPanelTittel h1:has-text("Avtaleland"))';
    if (status) {
      selector += `:has(.behandlingsstatus__span:has-text("${status}"))`;
    }
    const sak = this.page.locator(selector).first();

    const statusText = status ? ` med status "${status}"` : "";
    await expect(sak, `Fant ingen Avtaleland-sak${statusText}.`).toBeVisible({
      timeout: 10000,
    });

    // Hent sak-ID for bedre feilmeldinger
    const sakId = await sak.locator(".customRadioPanelTittel").textContent();
    const sakIdMatch = sakId?.match(/MEL-\d+/);
    const sakIdString = sakIdMatch ? sakIdMatch[0] : "ukjent";

    await sak.click();

    // Legg til sak-ID til alle påfølgende expect-meldinger
    (sak as any)._sakId = sakIdString;

    return sak;
  }

  /**
   * Velg "Virksomhet" i "Hvem skal saken opprettes på?" seksjonen
   */
  async velgVirksomhet(): Promise<void> {
    const virksomhetRadio = this.page.locator(".navds-radio__content:has-text('Virksomhet')");
    await expect(virksomhetRadio).toBeVisible();
    await virksomhetRadio.click();
  }

  /**
   * Sett fra-dato i søknadsperiode
   */
  async setFraDato(dato: string): Promise<void> {
    const fraInput = this.page.getByRole("textbox", { name: "Fra" });
    const count = await fraInput.count();
    expect(count, "Fra-dato input skal finnes").toBeGreaterThan(0);

    // Hvis det finnes flere, bruk den første
    const input = count > 1 ? fraInput.first() : fraInput;
    await expect(input).toBeVisible();
    await input.fill(dato);
  }

  /**
   * Sett til-dato i søknadsperiode
   */
  async setTilDato(dato: string): Promise<void> {
    const tilInput = this.page.getByRole("textbox", { name: "Til" });
    const count = await tilInput.count();
    expect(count, "Til-dato input skal finnes").toBeGreaterThan(0);

    // Hvis det finnes flere, bruk den første
    const input = count > 1 ? tilInput.first() : tilInput;
    await expect(input).toBeVisible();
    await input.fill(dato);
  }

  /**
   * Klikk "Opprett ny behandling" knappen
   */
  async klikkOpprettNyBehandling(): Promise<void> {
    const opprettKnapp = this.page.locator(SELECTORS.OPPRETT_NY_BEHANDLING_BUTTON);
    await expect(opprettKnapp).toBeVisible();
    await opprettKnapp.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Velg sakstype
   */
  async velgSakstype(value: "Avtaleland" | "Utenfor avtaleland" | "EU/EØS-land"): Promise<void> {
    const sakstypeSelect = this.page.locator("select[name='sakstype']");

    // Vent på elementet med timeout, returner stille hvis det ikke kommer
    try {
      await expect(sakstypeSelect).toBeVisible({ timeout: 5000 });
    } catch {
      return;
    }

    const options = await sakstypeSelect.locator("option").all();
    let foundValue = null;
    for (const option of options) {
      const text = await option.textContent();
      if (text && text.trim() === value) {
        foundValue = await option.getAttribute("value");
        break;
      }
    }

    if (!foundValue) {
      throw new Error(`Fant ikke sakstype med tekst "${value}"`);
    }

    await sakstypeSelect.selectOption({ value: foundValue });
  }

  /**
   * Velg sakstema
   */
  async velgSakstema(value: "Medlemskap og lovvalg" | "Unntak" | "Trygdeavgift"): Promise<void> {
    await this.velgDropdownVerdi("sakstema", value, "Sakstema");
    await this.page.waitForTimeout(SELECT_TIMEOUT);
  }

  /**
   * Velg behandlingstema
   */
  async velgBehandlingstema(
    value:
      | "Yrkesaktiv"
      | "Ikke yrkesaktiv"
      | "Pensjonist/uføretrygdet"
      | "Forespørsel fra trygdemyndighet"
      | "Forespørsel om trygdetid"
      | "Anmodning om unntak"
      | "Registrering unntak"
      | "A1 / Anmodning om unntak på papir"
      | "Søknad om unntak fra folketrygden"
      | "Utstedt arbeidstaker / skip / direkte til artikkel 16"
      | "Utstedt selvstendig næringsdrivende / skip / direkte til artikkel 16"
      | "Arbeid og/eller selvstendig virksomhet i flere land"
      | "Offentlig tjenesteperson/flyvende personell"
      | "Arbeid kun i Norge"
      | "Virksomhet",
  ): Promise<void> {
    await this.velgDropdownVerdi("behandlingstema", value, "Behandlingstema");
    await this.page.waitForTimeout(SELECT_TIMEOUT);
  }

  /**
   * Velg behandlingstype
   */
  async velgBehandlingstype(
    value: "Førstegangsbehandling" | "Ny vurdering" | "Klage" | "Henvendelse" | "Årsavregning",
  ): Promise<void> {
    await this.velgDropdownVerdi("behandlingstype", value, "Behandlingstype");
    await this.page.waitForTimeout(SELECT_TIMEOUT);
  }

  /**
   * Velg behandlingsårsak
   */
  async velgBehandlingsaarsak(value: "Søknad" | "SED" | "Henvendelse"): Promise<void> {
    await this.velgDropdownVerdi("behandlingsaarsakType", value, "Behandlingsårsak");
    await this.page.waitForTimeout(SELECT_TIMEOUT);
  }

  /**
   * Private helper-funksjon for å velge verdi i dropdown
   * Alle dropdown-er bruker tekst for å finne riktig value-attributt
   */
  private async velgDropdownVerdi(selectName: string, value: string, fieldDisplayName: string): Promise<void> {
    const selectElement = this.page.locator(`select[name='${selectName}']`);
    await expect(selectElement).toBeVisible();

    // Vent på at dropdown har lastet inn options (mer enn bare "Velg...")
    // Noen dropdown-er (som behandlingsårsak) er avhengig av at andre felt er valgt først
    // Bruk Playwright's locator.count() i stedet for waitForFunction
    await this.page.waitForTimeout(200); // Kort pause for at dropdown skal begynne å laste

    const maxRetries = 50; // 50 * 200ms = 10 sekunder totalt
    let retries = 0;
    let optionCount = await selectElement.locator("option").count();

    while (optionCount <= 1 && retries < maxRetries) {
      await this.page.waitForTimeout(200);
      optionCount = await selectElement.locator("option").count();
      retries++;
    }

    if (optionCount <= 1) {
      throw new Error(
        `${fieldDisplayName} har ikke lastet inn verdier etter ${maxRetries * 200}ms. ` +
          `Dette kan bety at dropdown-en er avhengig av andre felt som ikke er valgt korrekt.`,
      );
    }

    // Finn option basert på tekstinnhold eller label attributt og hent verdien
    const options = await selectElement.locator("option").all();
    let foundValue = null;
    const availableOptions: string[] = [];

    for (const option of options) {
      // Sjekk både textContent og label attributt
      const text = await option.textContent();
      const label = await option.getAttribute("label");
      const displayText = (label || text || "").trim();

      if (displayText) {
        availableOptions.push(displayText);
        if (displayText === value) {
          foundValue = await option.getAttribute("value");
          break;
        }
      }
    }

    if (!foundValue) {
      throw new Error(
        `Fant ikke ${fieldDisplayName.toLowerCase()} med tekst "${value}". ` +
          `Tilgjengelige valg: ${availableOptions.filter((o) => o).join(", ")}`,
      );
    }

    await selectElement.selectOption({ value: foundValue });
  }

  /**
   * Velg land i land-dropdown (React Select multiselect)
   */
  async setLand(landNavn: string): Promise<void> {
    // Vent for at land-feltet skal vises etter behandlingsårsak er valgt
    // Feltet vises ikke for alle kombinasjoner av sakstype/tema
    const landFieldset = this.page.locator('fieldset:has-text("land")').first();
    await expect(landFieldset).toBeVisible({ timeout: 10000 });

    // Finn React Select combobox inne i fieldset
    const combobox = landFieldset.locator('[role="combobox"]').first();
    await expect(combobox).toBeVisible();

    // Klikk på dropdown-pilen for å åpne React Select
    const dropdownIndicator = landFieldset.locator(".css-1xc3v61-indicatorContainer").first();
    if ((await dropdownIndicator.count()) > 0) {
      await dropdownIndicator.click();
    } else {
      await combobox.click();
    }

    // Vent for at dropdown skal åpne og vise opsjoner, deretter velg land
    const landOption = this.page.locator('[role="option"]').filter({ hasText: landNavn }).first();
    await expect(landOption).toBeVisible();
    await landOption.click();

    // Vent på at valget er registrert - sjekk at dropdown har lukket seg
    await expect(this.page.locator('[role="option"]')).toHaveCount(0);
  }

  /**
   * Velg en spesifikk behandlingstype via radio button
   * @param behandlingstype - Navn på behandlingstypen (f.eks. "Årsavregning", "Henvendelse")
   */
  async velgBehandlingstypeRadio(behandlingstype: string): Promise<void> {
    const behandlingstypeGruppe = this.page.getByRole("group", { name: "Behandlingstype" });
    await expect(behandlingstypeGruppe).toBeVisible();

    const radioButton = behandlingstypeGruppe.getByRole("radio", { name: new RegExp(behandlingstype, "i") });
    await expect(radioButton).toBeVisible();
    await radioButton.click();
  }

  // ===== DELEGATION TO ASSERTIONS =====
  // These methods delegate to the assertions class for backward compatibility

  /**
   * Verifiser at alle nødvendige elementer er synlige på siden
   */
  async verifiserAlleElementer(): Promise<void> {
    return this.assertions.verifiserAlleElementer();
  }

  /**
   * Verifiser at sakstype-select er synlig og har riktig innhold
   */
  async verifiserSakstypeSelect(): Promise<void> {
    return this.assertions.verifiserSakstypeSelect();
  }

  /**
   * Verifiser hvilke behandlingstyper som er tilgjengelige for en valgt sak
   */
  async verifiserTilgjengeligeBehandlingstyper(valgtSak: Locator, forventedeBehandlingstyper: string[]): Promise<void> {
    return this.assertions.verifiserTilgjengeligeBehandlingstyper(valgtSak, forventedeBehandlingstyper);
  }

  /**
   * Sjekker om det finnes feilmeldinger på siden
   */
  async harFeilmelding(feilmelding?: string): Promise<boolean> {
    return this.assertions.harFeilmelding(feilmelding);
  }

  /**
   * Sjekk om behandlingstype-gruppen er synlig
   */
  async erBehandlingstypeGruppeSynlig(): Promise<boolean> {
    return this.assertions.erBehandlingstypeGruppeSynlig();
  }

  /**
   * Tell antall saker som vises
   */
  async tellAntallSaker(): Promise<number> {
    return this.assertions.tellAntallSaker();
  }

  /**
   * Sjekk om opprett-ny-sak siden er synlig
   */
  async erOpprettNySakSidenSynlig(): Promise<boolean> {
    return this.assertions.erOpprettNySakSidenSynlig();
  }
}
