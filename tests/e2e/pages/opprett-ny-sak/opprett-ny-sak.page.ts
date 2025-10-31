import { expect, Locator, Page } from "@playwright/test";
import { OpprettNySakAssertions } from "./opprett-ny-sak-assertions.page";

const DROP_DOWN_SELECT_TIMEOUT = 100; // Ventetid etter valg i dropdown for at avhengige felter skal oppdatere seg

const SELECTORS = {
  OPPRETT_NY_BEHANDLING_BUTTON: "button:has-text('Opprett ny behandling')",
  AVBRYT_BUTTON: "button:has-text('Avbryt')",
  VIS_FLERE_SAKER_BUTTON: 'button:has-text("Vis flere saker")',
  CUSTOM_RADIO_PANEL_TITLE: ".customRadioPanelTittel",
} as const;

interface LocatorWithSakId extends Locator {
  _sakId?: string;
}

/**
 * Sett sakId på locator ved å hente den fra .customRadioPanelTittel
 * Denne funksjonen er spesifikk for opprett-ny-sak-siden
 * @param sak - Sak-locator
 */
export async function setSakId(sak: Locator): Promise<void> {
  const sakId = await sak.locator(".customRadioPanelTittel").textContent();
  const sakIdMatch = sakId?.match(/MEL-\d+/);
  (sak as LocatorWithSakId)._sakId = sakIdMatch ? sakIdMatch[0] : "ukjent";
}

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
   * Venter automatisk på at enten behandlingspanel eller feilmelding vises før den returnerer
   */
  async velgSakVedIndex(index: number): Promise<void> {
    const sak = this.page.locator(".customRadioPanel").nth(index);
    await expect(sak, "Fant ikke sak med index " + index).toBeVisible();
    await sak.click();

    // Vent på at enten panelramme eller behandlingspanel vises (data er lastet)
    await this.page
      .locator(".knyttTilSak__panelramme, .knyttTilSak__behandlingspanel")
      .first()
      .waitFor({ state: "visible", timeout: 5000 });
  }

  /**
   * Hent saks-ID ved index
   */
  async hentSakIdVedIndex(index: number): Promise<string> {
    const sak = this.page.locator(".customRadioPanel").nth(index);
    const sakIdElement = await sak.locator(".customRadioPanelTittel").textContent();
    const sakIdMatch = sakIdElement?.match(/MEL-\d+/);
    return sakIdMatch ? sakIdMatch[0] : `sak-${index}`;
  }

  /**
   * Fyll inn bruker-ID
   */
  async fyllInnBrukerId(userID: string): Promise<void> {
    const userIdInput = this.page.locator("input[name='brukerID']");
    await expect(userIdInput, "Fant ikke bruker med id " + userID).toBeVisible();
    await userIdInput.fill(userID);
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Fyll inn organisasjonsnummer
   */
  async fyllInnOrganisasjonsnummer(orgNumber: string): Promise<void> {
    const orgNumberInput = this.page.locator("input[name='virksomhetOrgnr']");
    await expect(orgNumberInput, "Fant ikke org nr input").toBeVisible();
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
      await expect(undertittel, "Fant ikke undertittel 'Knytt til eksisterende sak eller opprett ny'").toBeVisible({
        timeout: 5000,
      });
    } catch {
      return;
    }

    // Sjekk om det finnes eksisterende saker eller "Ingen saker" melding
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
      "Fant ikke undertittel 'Knytt til eksisterende sak eller opprett ny'",
    ).toBeVisible();

    const ingenSakerMelding = this.page.locator(
      ".opprettnysak :text('Ingen eksisterende saker funnet. Du må opprette en ny sak.')",
    );
    await expect(ingenSakerMelding).not.toBeVisible();

    const knyttTilEksSakRadio = this.page.locator(".navds-radio__content:has-text('Eksisterende sak')");
    await expect(knyttTilEksSakRadio, "Fant ikke radioknapp for 'Eksisterende sak'").toBeVisible();
    await knyttTilEksSakRadio.click();

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
    const saker = await this.finnAlleSaker({
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
   * Generisk funksjon for å finne alle saker basert på sakstype og kriterier
   */
  async finnAlleSaker(kriterier: {
    sakstype: "Utenfor avtaleland" | "Avtaleland" | "EU/EØS-land";
    behandlingsstatus?:
      | "Behandlingen er opprettet"
      | "Behandlingen pågår"
      | "Behandlingen er avsluttet"
      | "Søknaden er henlagt/trukket";
    resultattype?: string;
  }): Promise<Locator[]> {
    const alleSaker = this.page.locator(".customRadioPanel");
    const sakListe: Locator[] = [];

    for (let i = 0; i < (await alleSaker.count()); i++) {
      const sak = alleSaker.nth(i);
      const tittel = await sak.locator(".customRadioPanelTittel").textContent();

      if (!tittel?.startsWith(kriterier.sakstype)) {
        continue;
      }

      let oppfyllerKriterier = true;

      if (kriterier.behandlingsstatus) {
        const sakInnhold = await sak.textContent();
        const harStatus = sakInnhold?.includes(kriterier.behandlingsstatus) ?? false;

        if (!harStatus) {
          oppfyllerKriterier = false;
        }
      }

      if (kriterier.resultattype) {
        const sakInnhold = await sak.textContent();
        const harResultattype = sakInnhold?.includes(kriterier.resultattype) ?? false;
        if (!harResultattype) {
          oppfyllerKriterier = false;
        }
      }

      await setSakId(sak);

      if (oppfyllerKriterier) {
        sakListe.push(sak);
      }
    }

    return sakListe;
  }

  /**
   * Finn sak med spesifikt saksnummer på knytt-til-eksisterende siden
   * @param saksnummer - saksnummer (f.eks. "MEL-123")
   * @returns Locator for saken med sakId lagt til
   */
  finnSakBySaksnummer(saksnummer: string): Locator {
    const sak = this.page.locator(`.customRadioPanel:has-text("${saksnummer}")`).first();
    (sak as LocatorWithSakId)._sakId = saksnummer;
    return sak;
  }

  /**
   * Velg "Virksomhet" i "Hvem skal saken opprettes på?" seksjonen
   */
  async velgVirksomhet(): Promise<void> {
    const virksomhetRadio = this.page.locator(".navds-radio__content:has-text('Virksomhet')");
    await expect(virksomhetRadio, "Fant ikke radioknapp for 'Virksomhet'").toBeVisible();
    await virksomhetRadio.click();
  }

  /**
   * Sett fra-dato i søknadsperiode
   */
  async setFraDato(dato: string): Promise<void> {
    return this.setDatoFelt("Fra", dato);
  }

  /**
   * Sett til-dato i søknadsperiode
   */
  async setTilDato(dato: string): Promise<void> {
    return this.setDatoFelt("Til", dato);
  }

  /**
   * Klikk "Opprett ny behandling" knappen
   */
  async klikkOpprettNyBehandling(): Promise<void> {
    const opprettKnapp = this.page.locator(SELECTORS.OPPRETT_NY_BEHANDLING_BUTTON);
    await expect(opprettKnapp, "Fant ikke 'Opprett ny behandling' knappen").toBeVisible();
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
      await expect(sakstypeSelect, "Fant ikke sakstype dropdown").toBeVisible({ timeout: 5000 });
    } catch {
      return;
    }

    const options = await sakstypeSelect.locator("option").all();
    let foundValue: string | null = null;
    for (const option of options) {
      const text = await option.textContent();
      if (text && text.trim() === value) {
        foundValue = await option.getAttribute("value");
        break;
      }
    }

    expect(foundValue, `Fant ikke sakstype med tekst "${value}"`).not.toBeNull();
    if (!foundValue) return; // Type guard for TypeScript

    await sakstypeSelect.selectOption({ value: foundValue });
  }

  /**
   * Velg sakstema
   */
  async velgSakstema(value: "Medlemskap og lovvalg" | "Unntak" | "Trygdeavgift"): Promise<void> {
    await this.velgDropdownVerdi("sakstema", value, "Sakstema");
    // Vent på at behandlingstema-dropdown er lastet inn
    const behandlingstemaSelect = this.page.locator("select[name='behandlingstema']");
    await expect(behandlingstemaSelect, "Behandlingstema-select skal være synlig etter sakstema valgt").toBeVisible({
      timeout: 5000,
    });
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
    // Vent på at behandlingstype-dropdown er lastet inn
    const behandlingstypeSelect = this.page.locator("select[name='behandlingstype']");
    await expect(
      behandlingstypeSelect,
      "Behandlingstype-select skal være synlig etter behandlingstema valgt",
    ).toBeVisible({ timeout: 5000 });
  }

  /**
   * Velg behandlingstype
   */
  async velgBehandlingstype(
    value: "Førstegangsbehandling" | "Ny vurdering" | "Klage" | "Henvendelse" | "Årsavregning",
  ): Promise<void> {
    await this.velgDropdownVerdi("behandlingstype", value, "Behandlingstype");
    // Vent på at behandlingsårsak-dropdown er lastet inn
    const behandlingsaarsakSelect = this.page.locator("select[name='behandlingsaarsakType']");
    await expect(
      behandlingsaarsakSelect,
      "Behandlingsårsak-select skal være synlig etter behandlingstype valgt",
    ).toBeVisible({ timeout: 5000 });
  }

  /**
   * Velg behandlingsårsak
   */
  async velgBehandlingsaarsak(value: "Søknad" | "SED" | "Henvendelse"): Promise<void> {
    await this.velgDropdownVerdi("behandlingsaarsakType", value, "Behandlingsårsak");
    // Etter behandlingsårsak vises enten land-felt eller "Opprett ny behandling" knapp
    // Vent på at ett av disse er synlig
    const landFieldset = this.page.locator("fieldset:has-text('Land')");
    const opprettKnapp = this.page.locator(SELECTORS.OPPRETT_NY_BEHANDLING_BUTTON);
    await Promise.race([
      expect(landFieldset, "Land-fieldset skal være synlig")
        .toBeVisible({ timeout: 5000 })
        .catch(() => {}),
      expect(opprettKnapp, "Opprett-knapp skal være synlig")
        .toBeVisible({ timeout: 5000 })
        .catch(() => {}),
    ]);
  }

  /**
   * Velg land i land-dropdown (React Select multiselect)
   */
  async setLand(landNavn: string): Promise<void> {
    // Vent for at land-feltet skal vises etter behandlingsårsak er valgt
    // Feltet vises ikke for alle kombinasjoner av sakstype/tema
    const landFieldset = this.page.locator('fieldset:has-text("land")').first();
    await expect(landFieldset, "Fant ikke land-feltet").toBeVisible({ timeout: 10000 });

    const combobox = landFieldset.locator('[role="combobox"]').first();
    await expect(combobox, "Fant ikke land combobox").toBeVisible();

    const dropdownIndicator = landFieldset.locator(".css-1xc3v61-indicatorContainer").first();
    if ((await dropdownIndicator.count()) > 0) {
      await dropdownIndicator.click();
    } else {
      await combobox.click();
    }

    // Vent for at dropdown skal åpne og vise opsjoner, deretter velg land
    const landOption = this.page.locator('[role="option"]').filter({ hasText: landNavn }).first();
    await expect(landOption, `Fant ikke land "${landNavn}" i dropdown`).toBeVisible();
    await landOption.click();

    // Vent på at valget er registrert - sjekk at dropdown har lukket seg
    await expect(this.page.locator('[role="option"]'), "Land dropdown lukket seg ikke etter valg").toHaveCount(0);
  }

  /**
   * Velg en spesifikk behandlingstype via radio button
   * @param behandlingstype - Navn på behandlingstypen (f.eks. "Årsavregning", "Henvendelse")
   */
  async velgBehandlingstypeRadio(behandlingstype: string): Promise<void> {
    const behandlingstypeGruppe = this.page.getByRole("group", { name: "Behandlingstype" });
    await expect(behandlingstypeGruppe, "Fant ikke behandlingstype-gruppe").toBeVisible();

    const radioButton = behandlingstypeGruppe.getByRole("radio", { name: new RegExp(behandlingstype, "i") });
    await expect(radioButton, `Fant ikke radioknapp for behandlingstype "${behandlingstype}"`).toBeVisible();
    await radioButton.click();
  }

  /**
   * Generisk funksjon for å sette dato i et datofelt
   * @private
   */
  private async setDatoFelt(feltNavn: string, dato: string): Promise<void> {
    const datoInput = this.page.getByRole("textbox", { name: feltNavn });
    const count = await datoInput.count();
    expect(count, `${feltNavn}-dato input skal finnes`).toBeGreaterThan(0);

    // Hvis det finnes flere, bruk den første
    const input = count > 1 ? datoInput.first() : datoInput;
    await expect(input, `${feltNavn}-dato input skal være synlig`).toBeVisible();
    await input.fill(dato);
  }

  /**
   * Private helper-funksjon for å velge verdi i dropdown
   * Alle dropdown-er bruker tekst for å finne riktig value-attributt
   */
  private async velgDropdownVerdi(selectName: string, value: string, fieldDisplayName: string): Promise<void> {
    const selectElement = this.page.locator(`select[name='${selectName}']`);
    await expect(selectElement, "Fant ikke element i drop down: " + selectName).toBeVisible();

    // Vent på at dropdown har lastet inn options (mer enn bare "Velg...")
    // Noen dropdown-er (som behandlingsårsak) er avhengig av at andre felt er valgt først
    // Bruk Playwright's innebygde waitFor med poll-funksjon
    await this.page.waitForFunction(
      (selectName) => {
        const select = document.querySelector(`select[name='${selectName}']`) as HTMLSelectElement;
        return select && select.options.length > 1;
      },
      selectName,
      { timeout: 10000 },
    );

    // Finn option basert på tekstinnhold eller label attributt og hent verdien
    const allOptions = await selectElement.locator("option").all();
    let foundValue = null;
    const availableOptions: string[] = [];

    for (const option of allOptions) {
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

    expect(
      foundValue,
      `Fant ikke ${fieldDisplayName.toLowerCase()} med tekst "${value}". ` +
        `Tilgjengelige valg: ${availableOptions.filter((o) => o).join(", ")}`,
    ).not.toBeNull();
    if (!foundValue) return; // Type guard for TypeScript

    await selectElement.selectOption({ value: foundValue });
  }

  /**
   * Generisk funksjon for å velge første sak av en bestemt sakstype
   * @private
   */
  async velgFørsteSak(
    sakstype: "Utenfor avtaleland" | "EU/EØS-land" | "Avtaleland",
    status?: "Behandlingen er opprettet" | "Behandlingen pågår" | "Behandlingen er avsluttet" | "Søknaden er henlagt",
  ): Promise<Locator> {
    await this.page.waitForSelector(".customRadioPanel", { timeout: 10000 });

    let selector = `.customRadioPanel:has(.customRadioPanelTittel h1:has-text("${sakstype}"))`;
    if (status) {
      selector += `:has(.behandlingsstatus__span:has-text("${status}"))`;
    }
    const sak = this.page.locator(selector).first();

    await expect(
      sak,
      `Fant ingen ${sakstype}-sak ${status ? ` med status "${status}"` : ""}. Selector: ${selector}`,
    ).toBeVisible({ timeout: 10000 });

    await setSakId(sak);
    await sak.click();

    return sak;
  }

  /**
   * Sjekker om det finnes feilmeldinger på siden
   * @param feilmelding Valgfri spesifikk feilmelding å lete etter
   * @returns true hvis feilmelding finnes
   *
   * Note: Søker etter feilmeldingspanelet i knytt-til-sak konteksten
   */
  /**
   * Hent locator for feilmeldingspanel
   * @param feilmelding - Valgfri tekst å filtrere på
   * @param sakIndex - Valgfri index for å hente feilmelding rett etter spesifikk sak
   */
  hentFeilmeldingspanel(feilmelding?: string, sakIndex?: number): Locator {
    const selector = ".knyttTilSak__behandlingspanel";

    if (sakIndex !== undefined) {
      // Bruk XPath for å finne det neste sibling-elementet rett etter den spesifikke saken
      const nextError = this.page.locator(
        `xpath=(//label[contains(@class, 'customRadioPanel')])[${sakIndex + 1}]/following-sibling::div[contains(@class, 'knyttTilSak__behandlingspanel')][1]`,
      );

      if (feilmelding) {
        return nextError.filter({ hasText: feilmelding });
      }
      return nextError;
    }

    // Fallback til global sjekk (bakoverkompatibilitet)
    if (feilmelding) {
      return this.page.locator(selector).filter({ hasText: feilmelding });
    }

    return this.page.locator(selector);
  }

  /**
   * Sjekk om det er feilmelding
   * @param feilmelding - Valgfri tekst å sjekke etter i feilmeldingen
   * @param sakIndex - Valgfri index for å sjekke feilmelding rett etter spesifikk sak
   * @deprecated Bruk hentFeilmeldingspanel() og Playwright's expect().toBeVisible() i stedet
   */
  async harFeilmelding(feilmelding?: string, sakIndex?: number): Promise<boolean> {
    return await this.hentFeilmeldingspanel(feilmelding, sakIndex)
      .isVisible()
      .catch(() => false);
  }

  /**
   * Tell antall saker som vises
   */
  async tellAntallSaker(): Promise<number> {
    return await this.page.locator(".customRadioPanel").count();
  }

  /**
   * Sjekk om opprett-ny-sak siden er synlig
   */
  async erOpprettNySakSidenSynlig(): Promise<boolean> {
    return await this.page.locator(".opprettnysak").isVisible();
  }

  /**
   * Sjekk om behandlingstype-gruppen er synlig
   */
  async erBehandlingstypeGruppeSynlig(): Promise<boolean> {
    const behandlingstypeGruppe = this.page.getByRole("group", { name: "Behandlingstype" });
    return await behandlingstypeGruppe.isVisible().catch(() => false);
  }

  /**
   * Hent locator for behandlingspanel-rammen
   * Dette panelet inneholder "Velg tema og type for ny behandling"
   * @param sakIndex - Valgfri index for å hente panel rett etter spesifikk sak
   */
  hentBehandlingspanelRamme(sakIndex?: number): Locator {
    if (sakIndex !== undefined) {
      // Bruk XPath for å finne det neste sibling-elementet rett etter den spesifikke saken
      // Dette er mer robust enn CSS nth-of-type som kan telle feil hvis det er andre elementer
      return this.page.locator(
        `xpath=(//label[contains(@class, 'customRadioPanel')])[${sakIndex + 1}]/following-sibling::div[contains(@class, 'knyttTilSak__panelramme')][1]`,
      );
    }

    // Fallback til global sjekk (bakoverkompatibilitet)
    return this.page.locator(".knyttTilSak__panelramme");
  }

  /**
   * Sjekk om behandlingspanel-rammen er synlig
   * Dette panelet inneholder "Velg tema og type for ny behandling"
   * @param sakIndex - Valgfri index for å sjekke panel rett etter spesifikk sak
   * @deprecated Bruk hentBehandlingspanelRamme() og Playwright's expect().toBeVisible() i stedet
   */
  async erBehandlingspanelRammeSynlig(sakIndex?: number): Promise<boolean> {
    return await this.hentBehandlingspanelRamme(sakIndex)
      .isVisible()
      .catch(() => false);
  }

  /**
   * Tell antall behandlingstyper i behandlingspanel-rammen
   */
  async tellBehandlingstyperIPanel(): Promise<number> {
    const behandlingspanelRamme = this.page.locator(".knyttTilSak__panelramme");
    const behandlingstypeRadios = behandlingspanelRamme.locator(".navds-radio");
    return await behandlingstypeRadios.count();
  }

  /**
   * Sjekk om det vises error-meldinger på siden
   */
  async harErrorMelding(): Promise<boolean> {
    return await this.page
      .locator(".navds-alert--error")
      .isVisible()
      .catch(() => false);
  }

  /**
   * Hent behandlingstema-verdi
   */
  async hentBehandlingstemaVerdi(): Promise<string> {
    const behandlingstemaSelect = this.page.locator("select[name='behandlingstema']");
    return await behandlingstemaSelect.inputValue();
  }

  // ===== DELEGATION TO ASSERTIONS =====
  // These methods delegate to the assertion class for backward compatibility

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
   * Verifiser at behandlingstype-gruppen er synlig og har behandlingstyper
   */
  async verifiserBehandlingstypeGruppe(): Promise<void> {
    return this.assertions.verifiserBehandlingstypeGruppe();
  }

  /**
   * Verifiser at "Tidligere behandling er avsluttet" melding vises
   */
  async verifiserTidligereBehandlingAvsluttet(): Promise<void> {
    return this.assertions.verifiserTidligereBehandlingAvsluttet();
  }

  /**
   * Verifiser feilmelding for EØS-sak med aktiv behandling
   */
  async verifiserEosFeilmelding(): Promise<void> {
    return this.assertions.verifiserEosFeilmelding();
  }

  /**
   * Verifiser at behandlingstema-select er synlig
   */
  async verifiserBehandlingstemaSelectSynlig(): Promise<void> {
    return this.assertions.verifiserBehandlingstemaSelectSynlig();
  }

  /**
   * Verifiser at behandlingstype-gruppen IKKE er synlig
   */
  async verifiserBehandlingstypeGruppeIkkeSynlig(): Promise<void> {
    return this.assertions.verifiserBehandlingstypeGruppeIkkeSynlig();
  }
}
