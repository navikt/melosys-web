import { expect, Locator, Page } from "@playwright/test";
import { BehandlingPage } from "./behandling.page";
import { PrepopulertSaksnummer } from "../../utils/testdataUtils";
import { finnKnapp, setDatoFelt, velgRadio } from "../../utils/testUtils";
import { UI_TEXTS } from "../../config/ui-texts";

/**
 * Page Object for stegvelger-navigasjon
 * Håndterer navigasjon mellom steg og verifisering av steg-status
 */
export class StegvelgerPage extends BehandlingPage {
  constructor(page: Page, saksnummer: PrepopulertSaksnummer) {
    super(page, saksnummer);
  }

  /**
   * Hent steg-tittel (h1) i aktivt steg
   */
  private get stegTittel(): Locator {
    return this.page.locator("h1.stegvelgertittel");
  }

  /**
   * Hent progressbar-elementene
   * Støtter både hovedstegvelger (.stegvelger__steg) og enkelStegvelger (.stegIkon)
   */
  private get progressbarSteg(): Locator {
    return this.page.locator(".stegvelger__steg, .stegIkon");
  }

  /**
   * Hent "Bekreft og fortsett"-knappen i aktivt steg
   */
  private async hentBekreftOgFortsettKnapp(): Promise<Locator> {
    return finnKnapp(UI_TEXTS.BUTTONS.BEKREFT_OG_FORTSETT, this.page);
  }

  /**
   * Hent "Tilbake"-knappen i aktivt steg
   */
  private async hentTilbakeKnapp(): Promise<Locator> {
    return finnKnapp(UI_TEXTS.BUTTONS.TILBAKE, this.page);
  }

  /**
   * Verifiser at "Bekreft og fortsett"-knappen er deaktivert
   */
  async verifiserBekreftOgFortsettKnappDeaktivert(): Promise<void> {
    const knapp = await this.hentBekreftOgFortsettKnapp();
    await expect(knapp, `${this.ctx}: "${UI_TEXTS.BUTTONS.BEKREFT_OG_FORTSETT}" er uventet aktivert`).toBeDisabled();
  }

  /**
   * Verifiser at "Bekreft og fortsett"-knappen er aktivert
   */
  async verifiserBekreftKnappAktivert(): Promise<void> {
    const knapp = await this.hentBekreftOgFortsettKnapp();
    await expect(knapp, `${this.ctx}: "${UI_TEXTS.BUTTONS.BEKREFT_OG_FORTSETT}" er uventet deaktivert`).toBeEnabled();
  }

  /**
   * Klikk "Bekreft og fortsett" og vent på neste steg
   */
  async klikkBekreftOgFortsett(): Promise<void> {
    await this.verifiserBekreftKnappAktivert();
    const nåværendeTittel = await this.stegTittel.textContent();
    const knapp = await this.hentBekreftOgFortsettKnapp();
    await knapp.click();

    // Vent på at tittelen endres (vi er på nytt steg)
    await expect(this.stegTittel, `${this.ctx}: Steget endret seg ikke etter klikk`).not.toHaveText(nåværendeTittel!, {
      timeout: 10000,
    });
  }

  /**
   * Klikk "Tilbake" og vent på forrige steg
   */
  async gåTilbake(): Promise<void> {
    const nåværendeTittel = await this.stegTittel.textContent();
    const knapp = await this.hentTilbakeKnapp();
    await knapp.click();

    // Vent på at tittelen endres
    await expect(this.stegTittel, `${this.ctx}: Steget endret seg ikke etter tilbake`).not.toHaveText(
      nåværendeTittel!,
      {
        timeout: 10000,
      },
    );
  }

  /**
   * Hent nåværende steg-tittel
   */
  async hentStegTittel(): Promise<string> {
    return (await this.stegTittel.textContent()) || "";
  }

  /**
   * Verifiser at vi er på forventet steg
   */
  async verifiserSteg(forventetTittel: string | RegExp): Promise<void> {
    await expect(this.stegTittel, `${this.ctx}: Feil steg-tittel`).toHaveText(forventetTittel, { timeout: 10000 });
  }

  /**
   * Verifiser at progressbar viser forventet antall steg
   */
  async verifiserAntallSteg(forventetAntall: number): Promise<void> {
    await expect(this.progressbarSteg, `${this.ctx}: Feil antall steg i progressbar`).toHaveCount(forventetAntall);
  }

  /**
   * Klikk på et spesifikt steg i progressbar
   */
  async klikkPåSteg(stegNummer: number): Promise<void> {
    const steg = this.progressbarSteg.nth(stegNummer - 1);
    await expect(steg, `${this.ctx}: Fant ikke steg ${stegNummer} i progressbar`).toBeVisible();
    await steg.click();
  }

  // === FTRL-spesifikke hjelpemetoder ===

  /**
   * Fyll ut minimum for Inngang-steget (FTRL YRKESAKTIV)
   *
   * FTRL Inngang krever:
   * - Fra og med dato
   * - Arbeidsland (RadioGroup: "Velg land fra liste" + MultiSelect)
   * - Trygdedekning (Select)
   */
  async fyllUtInngangMinimum(fomDato: string, arbeidsland: string = "Sverige"): Promise<void> {
    // Fyll ut fra og med dato
    await setDatoFelt("Fra og med", fomDato, this.page);
    await this.page.keyboard.press("Tab"); // Lukk evt. datepicker

    // Velg "Velg land fra liste" radio
    await velgRadio("Velg land fra liste", this.page);

    // Vent på at MultiSelect-komponenten vises etter radioknapp-klikk
    const landMultiSelect = this.page.locator(".land_multiselect");
    await expect(landMultiSelect, `${this.ctx}: Land MultiSelect dukket ikke opp etter radioknapp-klikk`).toBeVisible({
      timeout: 5000,
    });

    // Åpne dropdown og velg land
    const landInput = landMultiSelect.locator("input");
    await landInput.click();

    const landOption = this.page.getByRole("option", { name: arbeidsland });
    await expect(landOption, `${this.ctx}: Land-option "${arbeidsland}" ikke funnet i dropdown`).toBeVisible({
      timeout: 5000,
    });
    await landOption.click();

    // Velg trygdedekning fra dropdown
    const trygdedekningSelect = this.page.getByRole("combobox", { name: "Trygdedekning" });
    await expect(trygdedekningSelect, `${this.ctx}: Fant ikke trygdedekning-dropdown`).toBeVisible({ timeout: 5000 });
    await trygdedekningSelect.selectOption({ index: 1 });

    // Vent på at validering kjører
    await this.page.waitForTimeout(500);
  }

  /**
   * Velg første virksomhet i Virksomhet-steget (FTRL)
   */
  async velgFørsteVirksomhet(): Promise<void> {
    // Find the checkbox within the "Velg virksomhet(er)" fieldset (CheckboxGroup)
    // Avoid selecting "Inkl. siste 5 år" or other checkboxes outside the form
    const virksomhetFieldset = this.page.locator("fieldset").filter({
      has: this.page.locator('legend:has-text("Velg virksomhet")'),
    });
    const virksomhetCheckbox = virksomhetFieldset.getByRole("checkbox").first();
    await expect(virksomhetCheckbox, `${this.ctx}: Fant ingen virksomhet-checkbox`).toBeVisible({ timeout: 5000 });
    await virksomhetCheckbox.check();

    // Wait for form validation to update
    await this.page.waitForTimeout(300);
  }

  /**
   * Velg bestemmelse i Bestemmelse-steget (FTRL)
   * @param bestemmelse Søkestreng for bestemmelse (kan være delvis match, f.eks. "§ 2-5")
   */
  async velgBestemmelse(bestemmelse: string): Promise<void> {
    const bestemmelseSelect = this.page.getByRole("combobox", { name: "Bestemmelse" });
    await expect(bestemmelseSelect, `${this.ctx}: Fant ikke bestemmelse-dropdown`).toBeVisible({ timeout: 5000 });

    // Hent alle options og finn første som inneholder søkestrengen
    const options = bestemmelseSelect.locator("option");
    const count = await options.count();

    for (let i = 0; i < count; i++) {
      const optionText = await options.nth(i).textContent();
      if (optionText && optionText.includes(bestemmelse)) {
        await bestemmelseSelect.selectOption({ index: i });
        break;
      }
    }

    // Vent litt for at evt. tilleggsfelter skal vises
    await this.page.waitForTimeout(300);

    // Noen bestemmelser viser tilleggsspørsmål som må besvares.
    // Svarer "Ja" på alle radiogrupper som dukker opp (dynamisk)
    // Maks 3 iterasjoner for å håndtere dynamisk visning
    for (let i = 0; i < 3; i++) {
      // Finn alle synlige radiogrupper
      const radioGroups = this.page.locator("fieldset, [role='group']").filter({
        has: this.page.getByRole("radio"),
      });

      const groupCount = await radioGroups.count();
      let foundUnchecked = false;

      for (let g = 0; g < groupCount; g++) {
        const group = radioGroups.nth(g);
        const jaRadio = group.getByRole("radio", { name: "Ja" });

        if (await jaRadio.isVisible({ timeout: 500 }).catch(() => false)) {
          const isChecked = await jaRadio.isChecked();
          if (!isChecked) {
            await jaRadio.check();
            foundUnchecked = true;
            await this.page.waitForTimeout(300);
            break; // Ny radiogruppe kan ha blitt vist, start på nytt
          }
        }
      }

      if (!foundUnchecked) break;
    }

    await this.page.waitForTimeout(300);
  }

  /**
   * Fyll ut minimum for Perioder-steget (FTRL)
   * Fyller ut "Til og med" dato, trygdedekning og resultat for første periode
   */
  async fyllUtPerioderMinimum(): Promise<void> {
    // Fyll ut "Til og med" dato (påkrevd felt)
    await setDatoFelt("Til og med", "31.12.2024", this.page);
    await this.page.waitForTimeout(300);

    // Velg trygdedekning for første periode
    const trygdedekningSelect = this.page.getByRole("combobox", { name: "Trygdedekning" }).first();
    if (await trygdedekningSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      const selectedIndex = await trygdedekningSelect.evaluate((el: HTMLSelectElement) => el.selectedIndex);
      if (selectedIndex <= 0) {
        await trygdedekningSelect.selectOption({ index: 1 });
      }
    }

    // Velg resultat for første periode
    const resultatSelect = this.page.getByRole("combobox", { name: UI_TEXTS.LABELS.RESULTAT }).first();
    if (await resultatSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      const selectedIndex = await resultatSelect.evaluate((el: HTMLSelectElement) => el.selectedIndex);
      if (selectedIndex <= 0) {
        await resultatSelect.selectOption({ index: 1 });
      }
    }

    await this.page.waitForTimeout(500);
  }

  // === EU/EØS IKKE_YRKESAKTIV-spesifikke hjelpemetoder ===

  /**
   * Fyll ut minimum for EU/EØS IKKE_YRKESAKTIV Inngang-steget.
   *
   * For IKKE_YRKESAKTIV vises et skjema med:
   * - Fra og med (fom) - påkrevd
   * - Til og med (tom) - valgfri
   * - Land - påkrevd
   *
   * @param fomDato Fra og med dato (norsk format: DD.MM.YYYY)
   * @param land Landkode eller landnavn å velge
   */
  async fyllUtEosIkkeYrkesaktivInngang(fomDato: string = "01.01.2024", land: string = "Sverige"): Promise<void> {
    // Sjekk om knappen allerede er aktiv (data forhåndsutfylt)
    const knapp = await this.hentBekreftOgFortsettKnapp();
    const erAktiv = await knapp.isEnabled().catch(() => false);
    if (erAktiv) return;

    // Fyll ut "Fra og med" dato
    await setDatoFelt("Fra og med", fomDato, this.page);

    // Velg land fra dropdown
    const landSelect = this.page.getByRole("combobox", { name: "Land" });
    if (await landSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Prøv å velge basert på landnavn (label)
      try {
        await landSelect.selectOption({ label: land });
      } catch {
        // Fallback: velg første ikke-tomme alternativ
        await landSelect.selectOption({ index: 1 });
      }
    }

    await this.page.waitForTimeout(500);
  }

  /**
   * @deprecated Bruk fyllUtEosIkkeYrkesaktivInngang() i stedet
   */
  async fyllUtEosInngangMinimum(): Promise<void> {
    await this.fyllUtEosIkkeYrkesaktivInngang();
  }
}
