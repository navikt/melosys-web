import { expect, Locator, Page } from "@playwright/test";
import { getSaksnummerFraLocator, setDatoFelt, velgRadio } from "../../utils/testUtils";
import { UI_TEXTS } from "../../config/ui-texts";

const SELECTORS = {
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

  constructor(page: Page) {
    this.page = page;
  }

  // ===== ACTIONS (utfører handlinger på siden) =====

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

  // ===== QUERIES (henter data fra siden) =====

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
    // Vent på at backend svarer (enten sakstype-select vises, eller feilmelding kommer)
    await this.page.waitForTimeout(2000);
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
    await expect(
      ingenSakerMelding,
      "Fant ikke meldingen `Ingen eksisterende saker funnet. Du må opprette en ny sak.´",
    ).not.toBeVisible();

    const knyttTilEksSakRadio = this.page.locator(".navds-radio__content:has-text('Eksisterende sak')");
    await expect(knyttTilEksSakRadio, "Fant ikke radioknapp for 'Eksisterende sak'").toBeVisible();
    await knyttTilEksSakRadio.click();

    await this.klikkVisFlereSaker();
  }

  /**
   * Klikk "Vis flere saker" knappen hvis den finnes
   */
  async klikkVisFlereSaker(): Promise<void> {
    const visFlereSakerKnapp = this.page.getByRole("button", { name: UI_TEXTS.BUTTONS.VIS_FLERE_SAKER });
    const harVisFlereSakerKnapp = await visFlereSakerKnapp.isVisible();
    if (harVisFlereSakerKnapp) {
      await visFlereSakerKnapp.click();
    }
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
   * Klikk "Opprett ny behandling" knappen
   */
  async klikkOpprettNyBehandling(): Promise<void> {
    const opprettKnapp = this.page.getByRole("button", { name: UI_TEXTS.BUTTONS.OPPRETT_NY_BEHANDLING });
    await expect(opprettKnapp, `Fant ikke '${UI_TEXTS.BUTTONS.OPPRETT_NY_BEHANDLING}' knappen`).toBeVisible();
    await opprettKnapp.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Velg sakstype
   */
  async velgSakstype(value: "Avtaleland" | "Utenfor avtaleland" | "EU/EØS-land"): Promise<void> {
    const sakstypeSelect = this.page.locator("select[name='sakstype']");

    // Vent på at select er synlig
    try {
      await expect(sakstypeSelect, "Fant ikke sakstype dropdown").toBeVisible({ timeout: 5000 });
    } catch {
      return;
    }

    // Vent på at den ønskede option finnes (options kan lastes dynamisk)
    const targetOption = sakstypeSelect.locator(`option:text-is("${value}")`);
    await expect(targetOption, `Venter på at sakstype option "${value}" skal lastes`).toBeAttached({
      timeout: 5000,
    });

    const foundValue = await targetOption.getAttribute("value");

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
      | "Utsendt arbeidstaker / skip / direkte til artikkel 16"
      | "Utsendt selvstendig næringsdrivende / skip / direkte til artikkel 16"
      | "Arbeid og/eller selvstendig virksomhet i flere land"
      | "Offentlig tjenesteperson/flyvende personell"
      | "Arbeid kun i Norge"
      | "Yrkesaktiv"
      | "Ikke yrkesaktiv"
      | "Pensjonist/uføretrygdet"
      | "Forespørsel fra trygdemyndighet"
      | "Forespørsel om trygdetid"
      | "Virksomhet", // Gjelder kun for virksomhet-saker
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
    await this.velgDropdownVerdi("behandlingstype", value, UI_TEXTS.LABELS.BEHANDLINGSTYPE);
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
    const behandlingstypeGruppe = this.page.getByRole("group", { name: UI_TEXTS.LABELS.BEHANDLINGSTYPE });
    await expect(behandlingstypeGruppe, "Fant ikke behandlingstype-gruppe").toBeVisible();
    await velgRadio(behandlingstype, behandlingstypeGruppe);
  }

  /**
   * Sett fra-dato i søknadsperiode
   */
  async setFraDato(dato: string): Promise<void> {
    return setDatoFelt("Fra", dato, this.page);
  }

  /**
   * Sett til-dato i søknadsperiode
   */
  async setTilDato(dato: string): Promise<void> {
    return setDatoFelt("Til", dato, this.page);
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
    behandlingstema?: string,
  ): Promise<Locator> {
    await this.page.waitForSelector(".customRadioPanel", { timeout: 10000 });

    // Bygg tittel-søk basert på sakstype og behandlingstema
    const tittelSok: string = behandlingstema ? `${sakstype} - ${behandlingstema}` : sakstype;

    let selector = `.customRadioPanel:has(.customRadioPanelTittel h1:has-text("${tittelSok}"))`;
    if (status) {
      selector += `:has(.behandlingsstatus__span:has-text("${status}"))`;
    }
    const sak = this.page.locator(selector).first();

    await expect(
      sak,
      `Fant ingen ${sakstype}-sak ${behandlingstema ? `med tema "${behandlingstema}" ` : ""}${status ? ` med status "${status}"` : ""}. Selector: ${selector}`,
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
    if (sakIndex !== undefined) {
      // Finn saken først, deretter neste sibling behandlingspanel
      const sak = this.page.locator(".customRadioPanel").nth(sakIndex);
      const nextError = sak.locator("~ .knyttTilSak__behandlingspanel").first();

      if (feilmelding) {
        return nextError.filter({ hasText: feilmelding });
      }
      return nextError;
    }

    // Fallback til global sjekk (bakoverkompatibilitet)
    const selector = ".knyttTilSak__behandlingspanel";
    if (feilmelding) {
      return this.page.locator(selector).filter({ hasText: feilmelding });
    }

    return this.page.locator(selector);
  }

  /**
   * Sjekk om det er feilmelding
   * @param feilmelding - Valgfri tekst å sjekke etter i feilmeldingen
   * @param sakIndex - Valgfri index for å sjekke feilmelding rett etter spesifikk sak
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
    const behandlingstypeGruppe = this.page.getByRole("group", { name: UI_TEXTS.LABELS.BEHANDLINGSTYPE });
    return await behandlingstypeGruppe.isVisible().catch(() => false);
  }

  /**
   * Hent locator for behandlingspanel-rammen
   * Dette panelet inneholder "Velg tema og type for ny behandling"
   * @param sakIndex - Valgfri index for å hente panel rett etter spesifikk sak
   */
  hentBehandlingspanelRamme(sakIndex?: number): Locator {
    if (sakIndex !== undefined) {
      // Finn saken først, deretter neste sibling panelramme
      const sak = this.page.locator(".customRadioPanel").nth(sakIndex);
      return sak.locator("~ .knyttTilSak__panelramme").first();
    }

    // Fallback til global sjekk (bakoverkompatibilitet)
    return this.page.locator(".knyttTilSak__panelramme");
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
   * Hent behandlingstema-verdi
   */
  async hentBehandlingstemaVerdi(): Promise<string> {
    const behandlingstemaSelect = this.page.locator("select[name='behandlingstema']");
    return await behandlingstemaSelect.inputValue();
  }

  // ===== ASSERTIONS (verifiserer tilstand) =====

  /**
   * Verifiser at "Hvem skal saken opprettes på?" seksjonen er vist korrekt
   */
  private async verifiserBrukertypeValg(): Promise<void> {
    await expect(
      this.page.locator(".opprettnysak .undertittel:has-text('Hvem skal saken opprettes på?')"),
      "Undertittel 'Hvem skal saken opprettes på?' skal være synlig",
    ).toBeVisible();
    await expect(
      this.page.locator(".opprettnysak .navds-radio__content:has-text('Bruker')"),
      "Radio-valg 'Bruker' skal være synlig",
    ).toBeVisible();
    await expect(
      this.page.locator(".opprettnysak .navds-radio__content:has-text('Virksomhet')"),
      "Radio-valg 'Virksomhet' skal være synlig",
    ).toBeVisible();
    await expect(this.page.locator(".opprettnysak .navds-radio input[value='BRUKER']")).toBeChecked();
  }

  /**
   * Verifiser at "Informasjon om bruker" seksjonen er vist korrekt
   */
  private async verifiserBrukerInfoValg(): Promise<void> {
    await expect(
      this.page.locator(".opprettnysak .undertittel:has-text('Informasjon om bruker')"),
      "Undertittel 'Informasjon om bruker' skal være synlig",
    ).toBeVisible();
    await expect(
      this.page.locator(".opprettnysak label:has-text('Brukers f.nr. eller d-nr.:')"),
      "Label 'Brukers f.nr. eller d-nr.' skal være synlig",
    ).toBeVisible();
    await expect(
      this.page.locator(".opprettnysak input[name='brukerID']"),
      "Input-felt for brukerID skal være synlig",
    ).toBeVisible();
  }

  /**
   * Verifiser at "Legg behandlingen til en eksisterende sak?" checkbox er synlig
   */
  private async verifiserLeggBehandlingenCheckbox(): Promise<void> {
    await expect(
      this.page.locator(".navds-checkbox:has-text('Legg behandlingen i mine oppgaver')"),
      "Checkbox 'Legg behandlingen i mine oppgaver' skal være synlig",
    ).toBeVisible();
    await expect(this.page.locator("input[name='skalTilordnes']")).not.toBeChecked();
  }

  /**
   * Verifiser at aksjonsknappene er synlige
   */
  private async verifiserAksjonsKnapper(): Promise<void> {
    await expect(
      this.page.locator("button:has-text('Opprett ny behandling')"),
      "Knapp 'Opprett ny behandling' skal være synlig",
    ).toBeVisible();
    await expect(this.page.locator("button:has-text('Avbryt')"), "Knapp 'Avbryt' skal være synlig").toBeVisible();
  }

  /**
   * Verifiser at alle nødvendige elementer er synlige på siden
   */
  async verifiserAlleElementer(): Promise<void> {
    await expect(this.page).toHaveURL("/melosys/opprettnysak");
    await expect(this.page.locator(".opprettnysak"), "Opprett ny sak-container skal være synlig").toBeVisible();
    await this.verifiserBrukertypeValg();
    await this.verifiserBrukerInfoValg();
    await this.verifiserLeggBehandlingenCheckbox();
    await this.verifiserAksjonsKnapper();
    //await this.verifiserSakstypeSelect();
  }

  /**
   * Verifiser at sakstype-select er synlig og har riktig innhold
   */
  async verifiserSakstypeSelect(): Promise<void> {
    await expect(
      this.page.locator("select[name='sakstype']"),
      "Select-felt for sakstype skal være synlig",
    ).toBeVisible();
  }

  /**
   * Verifiser hvilke behandlingstyper som er tilgjengelige for en valgt sak
   * @param valgtSak Den valgte saken
   * @param forventedeBehandlingstyper Array med forventede behandlingstyper
   * @param saksnummer Optional saksnummer for feilmeldinger (hvis ikke oppgitt, hentes fra locator)
   */
  async verifiserTilgjengeligeBehandlingstyper(
    valgtSak: Locator,
    forventedeBehandlingstyper: string[],
    saksnummer?: string,
  ): Promise<void> {
    const sakId = saksnummer || getSaksnummerFraLocator(valgtSak!);
    await expect(
      this.page.getByRole("group", { name: UI_TEXTS.LABELS.BEHANDLINGSTYPE }),
      `Behandlingstype-gruppe for sak ${sakId} skal være synlig`,
    ).toBeVisible({ timeout: 10000 });

    // Hent alle faktiske radiobuttons som er tilstede
    let alleRadioButtons = this.page.getByRole("group", { name: UI_TEXTS.LABELS.BEHANDLINGSTYPE }).getByRole("radio");
    let antallRadioButtons = await alleRadioButtons.count();

    // Prøv alternative selektorer hvis ingen radiobuttons finnes
    if (antallRadioButtons === 0) {
      const alternativeRadios = await this.page
        .getByRole("group", { name: UI_TEXTS.LABELS.BEHANDLINGSTYPE })
        .locator("input[type='radio']")
        .count();
      const navdsRadios = await this.page
        .getByRole("group", { name: UI_TEXTS.LABELS.BEHANDLINGSTYPE })
        .locator(".navds-radio")
        .count();

      // Bruk alternative selektorer hvis de finner radiobuttons
      if (alternativeRadios > 0) {
        alleRadioButtons = this.page
          .getByRole("group", { name: UI_TEXTS.LABELS.BEHANDLINGSTYPE })
          .locator("input[type='radio']");
        antallRadioButtons = alternativeRadios;
      } else if (navdsRadios > 0) {
        alleRadioButtons = this.page
          .getByRole("group", { name: UI_TEXTS.LABELS.BEHANDLINGSTYPE })
          .locator(".navds-radio input");
        antallRadioButtons = navdsRadios;
      }
    }

    const faktiskeTilgjengeligeBehandlingstyper: string[] = [];
    for (let i = 0; i < antallRadioButtons; i++) {
      const radio = alleRadioButtons.nth(i);
      const isVisible = await radio.isVisible();

      if (isVisible) {
        const label = await radio.getAttribute("aria-labelledby");

        let behandlingstype: string | null = null;

        if (label) {
          const labelElement = this.page.locator(`#${label}`);
          behandlingstype = await labelElement.textContent();
        }

        if (!behandlingstype) {
          // Prøv alternative metoder for å finne teksten
          const radioValue = await radio.getAttribute("value");
          const siblingLabel = await radio
            .locator("+ label")
            .textContent()
            .catch(() => null);
          const parentLabel = await radio
            .locator("..")
            .locator("label")
            .textContent()
            .catch(() => null);

          // Prøv ulike måter å finne behandlingstypen
          behandlingstype = siblingLabel || parentLabel || radioValue;
        }

        if (behandlingstype) {
          faktiskeTilgjengeligeBehandlingstyper.push(behandlingstype.trim());
        }
      }
    }

    // Sammenlign faktiske vs forventede behandlingstyper
    const manglendeBehandlingstyper = forventedeBehandlingstyper.filter(
      (type) => !faktiskeTilgjengeligeBehandlingstyper.includes(type),
    );

    const uventedeBehandlingstyper = faktiskeTilgjengeligeBehandlingstyper.filter(
      (type) => !forventedeBehandlingstyper.includes(type),
    );

    expect(
      manglendeBehandlingstyper.length,
      `Sak ${sakId}: Manglende behandlingstyper: ${manglendeBehandlingstyper.join(", ")}. Faktiske: ${faktiskeTilgjengeligeBehandlingstyper.join(", ")}`,
    ).toBe(0);

    expect(
      uventedeBehandlingstyper.length,
      `Sak ${sakId}: Uventede behandlingstyper: ${uventedeBehandlingstyper.join(", ")}. Forventede: ${forventedeBehandlingstyper.join(", ")}`,
    ).toBe(0);
  }

  /**
   * Verifiser at behandlingstype-gruppen er synlig og har behandlingstyper
   */
  async verifiserBehandlingstypeGruppe(): Promise<void> {
    const behandlingstypeGruppe = this.page.getByRole("group", { name: UI_TEXTS.LABELS.BEHANDLINGSTYPE });
    await expect(behandlingstypeGruppe, "Behandlingstype-gruppe skal være synlig").toBeVisible();

    const behandlingstypeRadios = behandlingstypeGruppe.locator(".navds-radio");
    const antallBehandlingstyper = await behandlingstypeRadios.count();
    expect(antallBehandlingstyper, "Minst én behandlingstype skal være tilgjengelig").toBeGreaterThan(0);
  }

  /**
   * Verifiser at "Tidligere behandling er avsluttet" melding vises
   */
  async verifiserTidligereBehandlingAvsluttet(): Promise<void> {
    await expect(
      this.page.locator(".tidligereBehandlingAvsluttet", {
        hasText: "Tidligere behandling er avsluttet",
      }),
      "Melding 'Tidligere behandling er avsluttet' skal være synlig",
    ).toBeVisible();
  }

  /**
   * Verifiser feilmelding for EØS-sak med aktiv behandling
   */
  async verifiserEosFeilmelding(): Promise<void> {
    await expect(
      this.page.locator(".feilmelding_innrykk").filter({
        hasText: "Du kan ikke opprette en ny behandling på eksisterende sak med en aktiv/pågående behandling",
      }),
      "Varselmelding om aktiv behandling skal være synlig",
    ).toBeVisible();
  }

  /**
   * Verifiser at behandlingstema-select er synlig
   */
  async verifiserBehandlingstemaSelectSynlig(): Promise<void> {
    const behandlingstemaSelect = this.page.locator("select[name='behandlingstema']");
    await expect(behandlingstemaSelect, "Select-felt for behandlingstema skal være synlig").toBeVisible();
  }

  /**
   * Verifiser at behandlingstype-gruppen IKKE er synlig
   */
  async verifiserBehandlingstypeGruppeIkkeSynlig(): Promise<void> {
    const behandlingstypeGruppe = this.page.getByRole("group", { name: UI_TEXTS.LABELS.BEHANDLINGSTYPE });
    await expect(behandlingstypeGruppe, "Behandlingstype-gruppe skal ikke være synlig").not.toBeVisible();
  }
}
