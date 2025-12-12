import { expect, Page } from "@playwright/test";
import { BehandlingPage } from "./behandling.page";
import { PrepopulertSaksnummer } from "../../utils/testdataUtils";
import { finnCombobox, finnKnapp, finnRadioknapp, velgFraListe } from "../../utils/testUtils";
import { UI_TEXTS } from "../../config/ui-texts";

/**
 * Page Object for Årsavregning-siden
 */
export class AarsavregningPage extends BehandlingPage {
  constructor(page: Page, saksnummer: PrepopulertSaksnummer) {
    super(page, saksnummer);
  }

  // Hent første tilgjengelige år fra dropdown-en (ikke "Velg...")
  async hentFørsteTilgjengeligeÅr(): Promise<string> {
    const årSelect = await finnCombobox("År", this.page, 5000);

    // Hent alle options og finn første som ikke er disabled
    const options = årSelect.locator("option:not([disabled])");
    const førsteÅr = await options.first().textContent();

    expect(førsteÅr, "Skal finne tilgjengelige år i dropdown").toBeTruthy();

    return førsteÅr!.trim();
  }

  // År dropdown
  async velgÅr(år: string) {
    const årSelect = await finnCombobox("År", this.page, 5000);

    // Sett opp lyttere for API-kall FØR vi velger år
    // Vi trenger å vente på ENTEN:
    // 1. POST til /aarsavregninger (oppretter ny årsavregning) - status 200
    // 2. Feilmelding om aktiv årsavregning vises i UI (året har allerede en aktiv årsavregning)
    const aarsavregningResponsePromise = this.page.waitForResponse(
      (response) =>
        response.url().includes("/aarsavregninger") &&
        !response.url().includes("/grunnlagstype") &&
        response.request().method() === "POST",
      { timeout: 15000 },
    );

    await årSelect.selectOption({ label: år });

    // Vent på at API-kallet for å opprette årsavregning fullføres (uansett om det lykkes eller feiler)
    // Dette sikrer at backend er ferdig før vi fortsetter
    try {
      const response = await aarsavregningResponsePromise;
      if (!response.ok()) {
        // Årsavregning-kallet feilet (f.eks. validering), men det er OK - vi venter på UI-oppdatering
      }
    } catch {
      // Timeout - årsavregningen kan allerede eksistere, eller noe annet gikk galt
      // Vi fortsetter likevel og lar neste sjekk fange eventuelle feil
    }

    // Vent på at data for året har lastet ved å sjekke at spørsmålet om trygdeavgift fra Avgiftssystemet vises
    // Bestemmelse-dropdown vises ikke før etter at brukeren har svart på dette spørsmålet og valgt "endeligAvgiftValg"
    const trygdeavgiftSpørsmålTekst = this.page.getByText(
      "Skal du legge til trygdeavgift fra Avgiftssystemet til denne årsavregningen?",
    );
    await expect(
      trygdeavgiftSpørsmålTekst,
      `${this.ctx}: Spørsmål om trygdeavgift fra avgiftssystemet skal være synlig etter årsskifte`,
    ).toBeVisible({
      timeout: 5000,
    });
  }

  // Bestemmelse
  async velgBestemmelse(bestemmelse: string) {
    await velgFraListe("Bestemmelse", bestemmelse, this.page);
  }

  // Medlemskapsperiode operasjoner
  async leggTilMedlemskapsperiode() {
    // Tell antall perioder før klikk
    const perioder = this.page.locator(".medlemskapsperiode__rad");
    const antallFør = await perioder.count();

    const knapp = await finnKnapp(UI_TEXTS.BUTTONS.LEGG_TIL_PERIODE, this.page);
    await knapp.click();

    // Vent på at ny periode er lagt til
    await expect(perioder, `${this.ctx}: Ny medlemskapsperiode skal være lagt til`).toHaveCount(antallFør + 1, {
      timeout: 5000,
    });
  }

  async fyllUtMedlemskapsperiodeFomDato(index: number, dato: string) {
    // Finn wrapper med aria-label, så finn textbox inni
    const wrapper = this.page.locator(`[aria-label="Fra og med periode ${index + 1}"]`);
    await expect(wrapper, `${this.ctx}: Wrapper for fom-dato periode ${index + 1} ikke funnet`).toBeVisible();
    const input = wrapper.getByRole("textbox");
    await input.fill(dato);
  }

  async fyllUtMedlemskapsperiodeTomDato(index: number, dato: string) {
    // Finn wrapper med aria-label, så finn textbox inni
    const wrapper = this.page.locator(`[aria-label="Til og med periode ${index + 1}"]`);
    await expect(wrapper, `${this.ctx}: Wrapper for tom-dato periode ${index + 1} ikke funnet`).toBeVisible();
    const input = wrapper.getByRole("textbox");
    await input.fill(dato);
  }

  async velgTrygdedekning(index: number, dekning: string) {
    await velgFraListe(`Trygdedekning periode ${index + 1}`, dekning, this.page);
  }

  async getMedlemskapsperiodeFomDato(index: number): Promise<string> {
    const allInputs = await this.page
      .locator('.perioder input[type="text"]:visible, .perioder input:not([type]):visible')
      .all();
    const inputIndex = index * 2;
    if (inputIndex >= allInputs.length) {
      return "";
    }
    return (await allInputs[inputIndex].inputValue()) || "";
  }

  async getAntallMedlemskapsperioder(): Promise<number> {
    // Vent på at minst ett trygdedekning-felt er synlig før telling
    const firstSelect = this.page.locator('select[name^="medlemskapsperioder["][name$="].trygdedekning"]').first();
    await expect(firstSelect, `${this.ctx}: Første trygdedekning-select skal være synlig`).toBeVisible({
      timeout: 10000,
    });
    return await this.page.locator('select[name^="medlemskapsperioder["][name$="].trygdedekning"]').count();
  }

  // Skatteforholdsperiode operasjoner
  async klikkLeggTilSkatteforhold() {
    const knapp = await finnKnapp(UI_TEXTS.BUTTONS.LEGG_TIL_SKATTEFORHOLD, this.page);
    await knapp.click();
  }

  async fyllUtSkatteforholdFomDato(index: number, dato: string) {
    // Vent på at skatteforhold-seksjonen er synlig ved å sjekke for første textbox med label "Skatteforhold"
    const firstSkattLabel = this.page.locator('text="Skatteforhold"').first();
    await expect(firstSkattLabel, `${this.ctx}: Label 'Skatteforhold' skal være synlig`).toBeVisible({
      timeout: 10000,
    });

    // Finn synlige inputs i skatteforholdsperioder-seksjonen
    // Vi må finne riktig container først
    const skatteforholdContainer = this.page.locator(".perioder").filter({ has: firstSkattLabel });
    const allInputs = await skatteforholdContainer
      .locator('input[type="text"]:visible, input:not([type]):visible')
      .all();

    // Hver skatteforholdsperiode har 2 inputs (fom, tom)
    const inputIndex = index * 2;

    expect(
      inputIndex < allInputs.length,
      `${this.ctx}: Kan ikke finne input ${inputIndex} for skatteforhold ${index}. Totalt ${allInputs.length} inputs funnet.`,
    ).toBe(true);

    await allInputs[inputIndex].fill(dato);
  }

  async fyllUtSkatteforholdTomDato(index: number, dato: string) {
    const firstSkattLabel = this.page.locator('text="Skatteforhold"').first();
    await expect(firstSkattLabel, `${this.ctx}: Label 'Skatteforhold' skal være synlig`).toBeVisible({
      timeout: 10000,
    });

    const skatteforholdContainer = this.page.locator(".perioder").filter({ has: firstSkattLabel });
    const allInputs = await skatteforholdContainer
      .locator('input[type="text"]:visible, input:not([type]):visible')
      .all();

    // Hver skatteforholdsperiode har 2 inputs (fom=0, tom=1)
    const inputIndex = index * 2 + 1;

    expect(
      inputIndex < allInputs.length,
      `${this.ctx}: Kan ikke finne input ${inputIndex} for skatteforhold ${index}. Totalt ${allInputs.length} inputs funnet.`,
    ).toBe(true);

    await allInputs[inputIndex].fill(dato);
  }

  async velgSkatteplikttype(index: number, type: string) {
    // Skatteplikttype er en RadioGroup med "Ja"/"Nei", ikke en select
    // type parameter kan være "Ja" eller "Nei" (eller "Skattepliktig"/"Ikke skattepliktig")
    const radioValue = type.toLowerCase().includes("ja") || type.toLowerCase().includes("skattepliktig") ? "Ja" : "Nei";

    // Finn radio-knappen ved å bruke group legend som anker
    const radioGroup = this.page.locator(`[name="skatteforholdsperioder[${index}].skatteplikttype"]`).locator("..");
    const radio = await finnRadioknapp(radioValue, radioGroup);
    await expect(radio, `${this.ctx}: Radioknapp "${radioValue}" for skatteplikttype skal være synlig`).toBeVisible({
      timeout: 5000,
    });
    await radio.click({ force: true });
  }

  // Inntektsperiode operasjoner
  async klikkLeggTilInntekt() {
    const knapp = await finnKnapp(UI_TEXTS.BUTTONS.LEGG_TIL_INNTEKT, this.page);
    await knapp.click();
  }

  async fyllUtInntektsperiodeFomDato(index: number, dato: string) {
    // Vent på at inntektsperiode-seksjonen er synlig
    const firstInntektLabel = this.page.locator('text="Inntektsperiode"').first();
    await expect(firstInntektLabel, `${this.ctx}: Label 'Inntektsperiode' skal være synlig`).toBeVisible({
      timeout: 10000,
    });

    // Finn synlige inputs i inntektsperioder-seksjonen
    const inntektContainer = this.page.locator(".perioder").filter({ has: firstInntektLabel });
    const allInputs = await inntektContainer.locator('input[type="text"]:visible, input:not([type]):visible').all();

    // Hver inntektsperiode har 3 inputs (fom, tom, bruttoInntekt), så vi trenger å telle riktig
    // Index 0: fom=0, tom=1, bruttoInntekt=2
    // Index 1: fom=3, tom=4, bruttoInntekt=5
    const inputIndex = index * 3;

    expect(
      inputIndex < allInputs.length,
      `${this.ctx}: Kan ikke finne input ${inputIndex} for inntektsperiode ${index}. Totalt ${allInputs.length} inputs funnet.`,
    ).toBe(true);

    await allInputs[inputIndex].fill(dato);
  }

  async fyllUtInntektsperiodeTomDato(index: number, dato: string) {
    const firstInntektLabel = this.page.locator('text="Inntektsperiode"').first();
    await expect(firstInntektLabel, `${this.ctx}: Label 'Inntektsperiode' skal være synlig`).toBeVisible({
      timeout: 10000,
    });

    const inntektContainer = this.page.locator(".perioder").filter({ has: firstInntektLabel });
    const allInputs = await inntektContainer.locator('input[type="text"]:visible, input:not([type]):visible').all();

    const inputIndex = index * 3 + 1;

    expect(
      inputIndex < allInputs.length,
      `${this.ctx}: Kan ikke finne input ${inputIndex} for inntektsperiode ${index}. Totalt ${allInputs.length} inputs funnet.`,
    ).toBe(true);

    await allInputs[inputIndex].fill(dato);
  }

  async velgKildetype(index: number, type: string) {
    // Bruk aria-label tilnærming for select, eller fall tilbake til name attribute hvis det fungerer
    const select = this.page.locator(`select[name="inntektskilder[${index}].kildetype"]`);
    await expect(select, `${this.ctx}: Kildetype-select for inntektsperiode ${index} skal være synlig`).toBeVisible({
      timeout: 10000,
    });

    // Vent på at options er lastet inn i select-elementet
    // Vi venter til select har minst 2 options (tom + minst én faktisk verdi)
    await this.page.waitForFunction(
      (selectName) => {
        const selectEl = document.querySelector(`select[name="${selectName}"]`) as HTMLSelectElement;
        return selectEl && selectEl.options.length >= 2;
      },
      `inntektskilder[${index}].kildetype`,
      { timeout: 10000 },
    );

    await select.selectOption({ label: type });
  }

  async fyllUtBruttoInntekt(index: number, belop: string) {
    const firstInntektLabel = this.page.locator('text="Inntektsperiode"').first();
    await expect(firstInntektLabel, `${this.ctx}: Label 'Inntektsperiode' skal være synlig`).toBeVisible({
      timeout: 10000,
    });

    const inntektContainer = this.page.locator(".perioder").filter({ has: firstInntektLabel });
    const allInputs = await inntektContainer.locator('input[type="text"]:visible, input:not([type]):visible').all();

    // BruttoInntekt er den 3. inputen i hver rad (fom=0, tom=1, bruttoInntekt=2)
    const inputIndex = index * 3 + 2;

    expect(
      inputIndex < allInputs.length,
      `${this.ctx}: Kan ikke finne bruttoInntekt input ${inputIndex} for inntektsperiode ${index}. Totalt ${allInputs.length} inputs funnet.`,
    ).toBe(true);

    await allInputs[inputIndex].fill(belop);
  }

  // Trygdeavgift fra Avgiftssystemet (delt grunnlag)
  async velgDeltGrunnlagJa() {
    const jaRadio = this.page.getByRole("radio", { name: "Ja" }).first();
    await expect(jaRadio, `${this.ctx}: Radio-button 'Ja' skal være synlig`).toBeVisible({ timeout: 10000 });

    // Sjekk om radioknappen allerede er checked
    const isChecked = await jaRadio.isChecked();

    if (!isChecked) {
      // Sett opp lytter for API-respons FØR vi klikker på radioknappen
      // Dette sikrer at vi venter på at backend har oppdatert harTrygdeavgiftFraAvgiftssystemet
      const grunnlagstypeResponsePromise = this.page.waitForResponse(
        (response) =>
          response.url().includes("/grunnlagstype") &&
          response.request().method() === "POST" &&
          response.status() === 200,
        { timeout: 15000 },
      );

      // Prøv å velge radioknappen - hvis den er readonly vil dette feile
      // men vi fanger feilen og gir en mer beskrivende feilmelding
      try {
        await jaRadio.check({ timeout: 5000 });
      } catch {
        // Radioknappen er sannsynligvis readonly - sjekk om dette er forventet
        throw new Error(
          `${this.ctx}: Kunne ikke velge 'Ja' radioknapp. ` +
            `Feltet er sannsynligvis readonly (forrigeÅrsavregningHarInnbetaltFraAvgiftssystem=true). ` +
            `Denne testdataen støtter ikke delt grunnlag-test.`,
        );
      }

      // Vent på at API-kallet for oppdaterHarTrygdeavgiftFraAvgiftssystemet fullføres
      await grunnlagstypeResponsePromise;
    }

    // Vent på at "Beregn endelig trygdeavgift" radioknappen vises
    // Dette kan ta litt tid pga React re-rendering
    const beregnEndeligRadio = await finnRadioknapp("Beregn endelig trygdeavgift", this.page, 15000);

    // Sjekk om "Beregn endelig trygdeavgift" allerede er valgt
    const beregnIsChecked = await beregnEndeligRadio.isChecked();

    if (!beregnIsChecked) {
      // Velg "Beregn endelig trygdeavgift" for å vise medlemskapsperiode-skjemaet
      await beregnEndeligRadio.check();
    }

    // Vent på at skjemaet re-rendres med medlemskapsperiode-feltene
    await finnCombobox("Trygdedekning periode 1", this.page, 10000);
  }

  // Datepicker-spesifikke metoder for å teste datovelger
  async klikkMedlemskapsperiodeFomDatepicker(index: number) {
    await finnCombobox(`Trygdedekning periode ${index + 1}`, this.page, 10000);

    const allInputs = await this.page
      .locator('.perioder input[type="text"]:visible, .perioder input:not([type]):visible')
      .all();
    const inputIndex = index * 2;

    expect(
      inputIndex < allInputs.length,
      `${this.ctx}: Kan ikke finne input ${inputIndex} for periode ${index + 1}. Totalt ${allInputs.length} inputs funnet.`,
    ).toBe(true);

    // Finn datovelger-knappen som er søsken til input-feltet
    const inputElement = allInputs[inputIndex];
    const container = inputElement.locator("..");
    const datepickerButton = await finnKnapp(UI_TEXTS.BUTTONS.ÅPNE_DATOVELGER, container);
    await datepickerButton.click();
  }

  async verifiserDatepickerErAktiv() {
    // NAV Design System bruker et dialog element for datepicker
    const datepicker = this.page.getByRole("dialog");
    await expect(datepicker, `${this.ctx}: Datepicker-dialog skal være synlig`).toBeVisible({ timeout: 2000 });
  }

  async verifiserDatepickerIkkeErAktiv() {
    // NAV Design System bruker et dialog element for datepicker
    const datepicker = this.page.getByRole("dialog");
    await expect(datepicker, `${this.ctx}: Datepicker-dialog skal ikke være synlig`).not.toBeVisible();
  }

  async velgDatoIDatepicker(dato: Date) {
    // NAV Design System bruker gridcell med button inne i dialog
    const dag = dato.getDate().toString();

    // Finn dialog først, deretter button med riktig dag
    const dialog = this.page.getByRole("dialog");

    // Finn button inne i dialog som har tekst som matcher dagen
    // Buttonene har format som "mandag 3", "tirsdag 4" osv., så vi må finne button som slutter med dagen
    const datoKnapp = dialog.getByRole("button", { name: new RegExp(`\\b${dag}$`) });
    await datoKnapp.click();
  }

  async verifiserIngenFeilmelding(tekst: string) {
    const error = this.page.locator('[class*="error"], [class*="feil"]').filter({ hasText: new RegExp(tekst, "i") });
    await expect(error, `${this.ctx}: Feilmelding "${tekst}" skal ikke være synlig`).not.toBeVisible();
  }
  // Verifiser at siden er lastet
  async verifiserAarsavregningside() {
    await expect(
      this.page.getByRole("heading", { name: "Årsavregning" }),
      `${this.ctx}: Årsavregning-overskrift skal være synlig`,
    ).toBeVisible();
  }
}
