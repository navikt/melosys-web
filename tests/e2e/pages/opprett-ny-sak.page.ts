import { expect, Locator, Page } from "@playwright/test";

const SELECT_TIMEOUT = 100; // Ventetid etter valg i dropdown for at avhengige felter skal oppdatere seg

/**
 * Page Object Model for the ny sak
 */
export class OpprettNySakPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  /**
   * Verifiser at "Hvem skal saken opprettes på?" seksjonen er vist korrekt
   */
  async verifiserBrukertypeValg(): Promise<void> {
    await expect(
      this.page.locator(".opprettnysak .undertittel:has-text('Hvem skal saken opprettes på?')"),
    ).toBeVisible();
    await expect(this.page.locator(".opprettnysak .navds-radio__content:has-text('Bruker')")).toBeVisible();
    await expect(this.page.locator(".opprettnysak .navds-radio__content:has-text('Virksomhet')")).toBeVisible();
    await expect(this.page.locator(".opprettnysak .navds-radio input[value='BRUKER']")).toBeChecked();
  }

  /**
   * Verifiser at "Informasjon om bruker" seksjonen er vist korrekt
   */
  async verifiserBrukerInfoValg(): Promise<void> {
    await expect(this.page.locator(".opprettnysak .undertittel:has-text('Informasjon om bruker')")).toBeVisible();
    await expect(this.page.locator(".opprettnysak label:has-text('Brukers f.nr. eller d-nr.:')")).toBeVisible();
    await expect(this.page.locator(".opprettnysak input[name='brukerID']")).toBeVisible();
  }

  /**
   * Verifiser at "Legg behandlingen i mine oppgaver" checkbox er vist korrekt
   */
  async verifiserLeggBehandlingenCheckbox(): Promise<void> {
    await expect(this.page.locator(".navds-checkbox:has-text('Legg behandlingen i mine oppgaver')")).toBeVisible();
    await expect(this.page.locator("input[name='skalTilordnes']")).not.toBeChecked();
  }

  /**
   * Verifiser at action buttons er vist korrrekt
   */
  async verifiserAksjonsKnapper(): Promise<void> {
    await expect(this.page.locator("button:has-text('Opprett ny behandling')")).toBeVisible();
    await expect(this.page.locator("button:has-text('Avbryt')")).toBeVisible();
  }

  /**
   * Fyll ut bruker f.nr. eller d-nr. felt
   */
  async fyllInnBrukerId(userID: string): Promise<void> {
    const userIDInput = this.page.locator("input[name='brukerID']");
    await expect(userIDInput).toBeVisible();
    await userIDInput.fill(userID);
  }

  /**
   * Fyll ut organisasjonsnummer felt
   */
  async fyllInnOrganisasjonsnummer(orgNumber: string): Promise<void> {
    const orgNumberInput = this.page.locator("input[name='virksomhetOrgnr']");
    await expect(orgNumberInput).toBeVisible();
    await orgNumberInput.fill(orgNumber);
  }

  /**
   * Velg "Opprett ny sak" i "Knytt til eksisterende sak eller opprett ny" seksjonen
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

    const ingenSakerMelding = this.page.locator(
      ".opprettnysak :text('Ingen eksisterende saker funnet. Du må opprette en ny sak.')",
    );
    const ingenSakerFinnes = await ingenSakerMelding.isVisible();

    if (ingenSakerFinnes) {
      return;
    }

    // Det finnes eksisterende saker - velg "Opprett ny sak" radioknapp
    const opprettNySakRadio = this.page.locator(".navds-radio__content:has-text('Opprett ny sak')");
    await expect(opprettNySakRadio).toBeVisible({
      timeout: 5000,
    });
    await opprettNySakRadio.click();
  }

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
    await this.visFlereeSaker();
  }

  /**
   * Klikk på "Vis flere saker" knappen for å vise alle tilgjengelige saker
   */
  async visFlereeSaker(): Promise<void> {
    const visFlereKnapp = this.page.locator('button:has-text("Vis flere saker")');
    try {
      await visFlereKnapp.click({ timeout: 2000 });
      // Vent litt for at sakene skal laste inn
      await this.page.waitForTimeout(1000);
    } catch {
      // Hvis knappen ikke finnes eller ikke kan klikkes, fortsett uten feil
      // Dette kan skje hvis alle saker allerede vises
    }
  }

  /**
   * Verifiser at kun de spesifiserte behandlingstypene er tilgjengelige
   * Tester i kontekst av valgt sak - behandlingstype-området som aktiveres av sak-valget
   * @param valgtSak - Den valgte saken (Locator) som kontekst for testingen
   * @param forventedeBehandlingstyper - Liste over behandlingstyper som skal være tilgjengelige
   */
  async verifiserTilgjengeligeBehandlingstyper(valgtSak: Locator, forventedeBehandlingstyper: string[]): Promise<void> {
    // Hent sak-ID for bedre feilmeldinger
    const sakId = (valgtSak as any)._sakId || "ukjent";

    // Først verifiser at saken er valgt (skal være synlig)
    await expect(valgtSak, `Sak ${sakId} skal være synlig`).toBeVisible();

    // Behandlingstype-gruppen som aktiveres av sak-valget
    const behandlingstypeGruppe = this.page.getByRole("group", { name: "Behandlingstype" });
    await expect(behandlingstypeGruppe, `Behandlingstype-gruppe for sak ${sakId} skal være synlig`).toBeVisible({
      timeout: 5000,
    });

    // Hent alle faktiske radiobuttons som er tilstede
    const alleRadioButtons = behandlingstypeGruppe.getByRole("radio");
    const antallRadioButtons = await alleRadioButtons.count();

    const faktiskeTilgjengeligeBehandlingstyper: string[] = [];
    for (let i = 0; i < antallRadioButtons; i++) {
      const radio = alleRadioButtons.nth(i);
      const isVisible = await radio.isVisible();
      if (isVisible) {
        const label = await radio.getAttribute("aria-labelledby");
        if (label) {
          const labelElement = this.page.locator(`#${label}`);
          const behandlingstype = await labelElement.textContent();
          if (behandlingstype) {
            faktiskeTilgjengeligeBehandlingstyper.push(behandlingstype.trim());
          }
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

    if (manglendeBehandlingstyper.length > 0) {
      throw new Error(
        `Sak ${sakId}: Manglende behandlingstyper: ${manglendeBehandlingstyper.join(", ")}. Faktiske: ${faktiskeTilgjengeligeBehandlingstyper.join(", ")}`,
      );
    }

    if (uventedeBehandlingstyper.length > 0) {
      throw new Error(
        `Sak ${sakId}: Uventede behandlingstyper: ${uventedeBehandlingstyper.join(", ")}. Forventede: ${forventedeBehandlingstyper.join(", ")}`,
      );
    }
  }

  /**
   * Velg første sak i listen over eksisterende saker
   */
  async velgForsteSakIListe(): Promise<void> {
    const fosteSak = this.page.locator(".customRadioPanel").first();
    await expect(fosteSak).toBeVisible();
    await fosteSak.click();
  }

  /**
   * Velg første sak i listen over eksisterende saker og returner sak-elementet
   * @returns Det valgte sak-elementet for videre testing
   */
  async velgForsteSakIListeMedRetur(): Promise<Locator> {
    const fosteSak = this.page.locator(".customRadioPanel").first();
    await expect(fosteSak).toBeVisible();
    await fosteSak.click();
    return fosteSak;
  }

  /**
   * Velg sak av bestemt type (søker etter sakstype i heading)
   */
  async velgSakAvType(sakstype: string): Promise<void> {
    const sak = this.page.locator(`.customRadioPanel:has(.customRadioPanelTittel h1:has-text("${sakstype}"))`).first();
    await expect(sak).toBeVisible();
    await sak.click();
  }

  /**
   * Velg sak med Årsavregning behandling
   */
  async velgSakMedAarsavregning(): Promise<void> {
    const sak = this.page.locator('.customRadioPanel:has(.behandling-tittel:has-text("Årsavregning"))').first();
    await expect(sak).toBeVisible();
    await sak.click();
  }

  /**
   * Velg sak med Førstegangsbehandling
   */
  async velgSakMedForstegangsbehandling(): Promise<void> {
    const sak = this.page
      .locator('.customRadioPanel:has(.behandling-tittel:has-text("Førstegangsbehandling"))')
      .first();
    await expect(sak).toBeVisible();
    await sak.click();
  }

  /**
   * Velg sak med Henvendelse behandling
   */
  async velgSakMedHenvendelse(): Promise<void> {
    const sak = this.page.locator('.customRadioPanel:has(.behandling-tittel:has-text("Henvendelse"))').first();
    await expect(sak).toBeVisible();
    await sak.click();
  }

  /**
   * Velg første FTRL-sak (Utenfor avtaleland)
   * @param status Valgfri behandlingsstatus å filtrere på (f.eks. "er avsluttet", "pågår", "er opprettet")
   * @returns Det valgte sak-elementet for videre testing
   */
  async velgFirstFTRLSak(status?: string): Promise<Locator> {
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
   * Velg første EØS-sak
   * @param status Valgfri behandlingsstatus å filtrere på (f.eks. "er avsluttet", "pågår", "er opprettet")
   * @returns Det valgte sak-elementet for videre testing
   */
  async velgFirstEOSSak(status?: string): Promise<Locator> {
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
   * Velg første Avtaleland-sak
   * @param status Valgfri behandlingsstatus å filtrere på (f.eks. "er avsluttet", "pågår", "er opprettet")
   * @returns Det valgte sak-elementet for videre testing
   */
  async velgFirstAvtalelandSak(status?: string): Promise<Locator> {
    // Wait for case list to load
    await this.page.waitForSelector(".customRadioPanel", { timeout: 10000 });

    let selector = '.customRadioPanel:has(.customRadioPanelTittel h1:has-text("Avtaleland"))';
    if (status) {
      selector += `:has(.behandlingsstatus__span:has-text("${status}"))`;
    }
    const sak = this.page.locator(selector).first();

    try {
      await expect(sak).toBeVisible({ timeout: 10000 });
    } catch (error) {
      const statusText = status ? ` med status "${status}"` : "";
      throw new Error(`Fant ingen Avtaleland-sak${statusText}. Selector: ${selector}`);
    }

    // Hent sak-ID for bedre feilmeldinger
    const sakId = await sak.locator(".customRadioPanelTittel").textContent();
    const sakIdMatch = sakId?.match(/MEL-\d+/);
    const sakIdString = sakIdMatch ? sakIdMatch[0] : "ukjent";

    await sak.click();

    // Wait for the click to register and form to update
    await this.page.waitForTimeout(1000);

    // Legg til sak-ID til alle påfølgende expect-meldinger
    (sak as any)._sakId = sakIdString;

    return sak;
  }

  /**
   * Velg Utenfor avtaleland-sak (FTRL)
   * @returns Det valgte sak-elementet for videre testing
   */
  async velgUtenforAvtalelandSak(): Promise<Locator> {
    const selector = '.customRadioPanel:has(.customRadioPanelTittel h1:has-text("Utenfor avtaleland"))';
    const sak = this.page.locator(selector).first();

    try {
      await expect(sak).toBeVisible({
        timeout: 10000,
      });
    } catch (error) {
      throw new Error(`Fant ingen Utenfor avtaleland-sak. Selector: ${selector}`);
    }

    await sak.click();
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
    if (count === 0) {
      return;
    }
    if (count !== 1) {
      throw new Error(`Forventet nøyaktig 1 'Fra' datofelt, fant ${count}.`);
    }
    await expect(fraInput).toBeVisible();
    await fraInput.click();
    await fraInput.clear();
    await fraInput.fill(dato);
    await fraInput.blur();
    await expect(fraInput).toHaveValue(dato);
  }

  /**
   * Sett til-dato i søknadsperiode
   */
  async setTilDato(dato: string): Promise<void> {
    const tilInput = this.page.getByRole("textbox", { name: "Til" });
    const count = await tilInput.count();
    if (count !== 1) {
      throw new Error(`Forventet nøyaktig 1 'Til' datofelt, fant ${count}.`);
    }
    await expect(tilInput).toBeVisible();
    await tilInput.click();
    await tilInput.clear();
    await tilInput.fill(dato);
    await tilInput.blur();
    await expect(tilInput).toHaveValue(dato);
  }

  /**
   * Klikk på "Opprett ny behandling" knappen
   */
  async klikkOpprettNyBehandling(): Promise<void> {
    const opprettButton = this.page.locator("button:has-text('Opprett ny behandling')");
    await expect(opprettButton).toBeVisible();
    await opprettButton.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Verifiser at vi er på 'Opprett ny sak' siden og alle forventede ellementer finnes
   */
  async verifiserAlleElementer(): Promise<void> {
    await expect(this.page).toHaveURL("/melosys/opprettnysak");
    await expect(this.page.locator(".opprettnysak")).toBeVisible();
    await this.verifiserBrukertypeValg();
    await this.verifiserBrukerInfoValg();
    await this.verifiserLeggBehandlingenCheckbox();
    await this.verifiserAksjonsKnapper();
  }

  /**
   * Velg sakstype i dropdown. Tom string velger første tilgjengelige element.
   */
  async velgSakstype(valueOrEmpty: string = ""): Promise<void> {
    const sakstypeSelect = this.page.locator("select[name='sakstype']");

    // Vent på elementet med timeout, returner stille hvis det ikke kommer
    try {
      await expect(sakstypeSelect).toBeVisible({ timeout: 5000 });
    } catch {
      return;
    }

    if (valueOrEmpty === "") {
      const options = await this.getSelectOptions("sakstype");
      if (options.length === 0) {
        throw new Error("Ingen sakstype opsjoner funnet");
      }
      await sakstypeSelect.selectOption({ value: options[0] });
    } else {
      const options = await sakstypeSelect.locator("option").all();
      let foundValue = null;
      for (const option of options) {
        const text = await option.textContent();
        if (text && text.trim() === valueOrEmpty) {
          foundValue = await option.getAttribute("value");
          break;
        }
      }

      if (!foundValue) {
        throw new Error(`Fant ikke sakstype med tekst "${valueOrEmpty}"`);
      }

      await sakstypeSelect.selectOption({ value: foundValue });
    }
  }

  /**
   * Velg sakstema i dropdown. Tom string velger første tilgjengelige element.
   */
  async velgSakstema(valueOrEmpty: string = ""): Promise<void> {
    await this.velgDropdownVerdi("sakstema", valueOrEmpty, "Sakstema");
    await this.page.waitForTimeout(SELECT_TIMEOUT);
  }

  /**
   * Velg behandlingstema i dropdown. Tom string velger første tilgjengelige element.
   */
  async velgBehandlingstema(valueOrEmpty: string = ""): Promise<void> {
    await this.velgDropdownVerdi("behandlingstema", valueOrEmpty, "Behandlingstema");
    await this.page.waitForTimeout(SELECT_TIMEOUT);
  }

  /**
   * Velg behandlingstype i dropdown. Tom string velger første tilgjengelige element.
   */
  async velgBehandlingstype(valueOrEmpty: string = ""): Promise<void> {
    await this.velgDropdownVerdi("behandlingstype", valueOrEmpty, "Behandlingstype");
    await this.page.waitForTimeout(SELECT_TIMEOUT);
  }

  /**
   * Velg behandlingsårsak i dropdown. Tom string velger første tilgjengelige element.
   */
  async velgBehandlingsaarsak(valueOrEmpty: string = ""): Promise<void> {
    await this.velgDropdownVerdi("behandlingsaarsakType", valueOrEmpty, "Behandlingsårsak");
  }

  /**
   * Generisk metode for å velge verdier i dropdown-felter
   * @param selectName - Name-attributtet til select-elementet
   * @param valueOrEmpty - Verdi å velge, eller tom string for første tilgjengelige
   * @param fieldDisplayName - Lesbart navn på feltet for feilmeldinger
   */
  private async velgDropdownVerdi(selectName: string, valueOrEmpty: string, fieldDisplayName: string): Promise<void> {
    const selectElement = this.page.locator(`select[name='${selectName}']`);
    await expect(selectElement).toBeVisible();

    if (valueOrEmpty === "") {
      const options = await this.getSelectOptions(selectName);
      if (options.length === 0) {
        throw new Error(`Ingen ${fieldDisplayName.toLowerCase()} opsjoner funnet`);
      }
      await selectElement.selectOption({ value: options[0] });
    } else {
      // Sjekk om vi skal finne verdi basert på tekst (for enkelte felter)
      if (selectName === "sakstype" || selectName === "behandlingstype") {
        // Find option by text content and get its value
        const options = await selectElement.locator("option").all();
        let foundValue = null;
        for (const option of options) {
          const text = await option.textContent();
          if (text && text.trim() === valueOrEmpty) {
            foundValue = await option.getAttribute("value");
            break;
          }
        }

        if (!foundValue) {
          throw new Error(`Fant ikke ${fieldDisplayName.toLowerCase()} med tekst "${valueOrEmpty}"`);
        }

        await selectElement.selectOption({ value: foundValue });
      } else {
        await selectElement.selectOption({ value: valueOrEmpty });
      }
    }
  }

  /**
   * Hent tilgjengelige opsjoner fra en select dropdown
   */
  async getSelectOptions(selectName: string): Promise<string[]> {
    const select = this.page.locator(`select[name='${selectName}']`);
    await expect(select).toBeVisible();

    // Vent på at select har options lastet (mer enn bare default option)
    await this.page.waitForFunction(
      (selectName) => {
        const selectEl = document.querySelector(`select[name='${selectName}']`) as HTMLSelectElement;
        return selectEl && selectEl.options.length > 1;
      },
      selectName,
      { timeout: 5000 },
    );

    const options = await select.locator("option").all();
    const values = [];
    for (const option of options) {
      const value = await option.getAttribute("value");
      if (value && value !== "" && value !== "DEFAULT") {
        values.push(value);
      }
    }
    return values;
  }

  /**
   * Velg land i land-dropdown (React Select multiselect)
   */
  async setLand(landNavn: string): Promise<void> {
    // Vent for at land-feltet skal vises etter behandlingstema er valgt
    const landFieldset = this.page.locator('fieldset:has-text("land")').first();
    await expect(landFieldset).toBeVisible({ timeout: 5000 });

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
}
