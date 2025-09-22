import { expect, Page } from "@playwright/test";

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
    await expect(
      this.page.locator(".opprettnysak .undertittel:has-text('Knytt til eksisterende sak eller opprett ny')"),
    ).toBeVisible();
    const opprettNySakRadio = this.page.locator(".navds-radio__content:has-text('Opprett ny sak')");
    await expect(opprettNySakRadio).toBeVisible();
    await opprettNySakRadio.click();
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
    // Vent på at verdien er registrert
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
    // Vent på at verdien er registrert
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
    await this.velgDropdownVerdi("sakstype", valueOrEmpty, "Sakstype");
    await this.page.waitForTimeout(SELECT_TIMEOUT);
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
}
