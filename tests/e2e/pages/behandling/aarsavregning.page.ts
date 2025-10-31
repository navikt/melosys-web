import { expect, Page } from "@playwright/test";
import { getSaksnummerFraUrl } from "../../utils/testUtils";

/**
 * Page Object for Årsavregning-siden
 */
export class AarsavregningPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // År dropdown
  async velgÅr(år: string) {
    const saksnummer = getSaksnummerFraUrl(this.page);
    const årSelect = this.page.getByRole("combobox", { name: /år/i });
    await expect(årSelect, `${saksnummer}: År-select skal være synlig`).toBeVisible({ timeout: 5000 });
    await årSelect.selectOption({ label: år });
    // Vent på at data for året har lastet ved å sjekke at bestemmelse-dropdown er synlig
    const bestemmelseSelect = this.page.getByRole("combobox", { name: /bestemmelse/i });
    await expect(bestemmelseSelect, `${saksnummer}: Bestemmelse-select skal være synlig etter årsskifte`).toBeVisible({
      timeout: 5000,
    });
  }

  // Radio buttons for endelig avgift valg
  async velgOpplysningerEndret() {
    await this.page.getByRole("radio", { name: /opplysninger.*endret/i }).check();
  }

  async velgManuellEndeligAvgift() {
    await this.page.getByRole("radio", { name: /manuell.*endelig avgift/i }).check();
  }

  // Bestemmelse
  async velgBestemmelse(bestemmelse: string) {
    await this.page.getByRole("combobox", { name: /bestemmelse/i }).selectOption({ label: bestemmelse });
  }

  // Medlemskapsperiode operasjoner
  async leggTilMedlemskapsperiode() {
    const saksnummer = getSaksnummerFraUrl(this.page);
    const knapp = this.page.getByRole("button", { name: /legg til periode/i });
    await expect(knapp, `${saksnummer}: Knapp 'Legg til periode' skal være synlig`).toBeVisible({ timeout: 5000 });

    // Tell antall perioder før klikk
    const perioder = this.page.locator('[data-testid="medlemskapsperiode-gruppe"], .medlemskapsperiode');
    const antallFør = await perioder.count();

    await knapp.click();

    // Vent på at ny periode er lagt til
    await expect(perioder, `${saksnummer}: Ny medlemskapsperiode skal være lagt til`).toHaveCount(antallFør + 1, {
      timeout: 5000,
    });
  }

  async fyllUtMedlemskapsperiodeFomDato(index: number, dato: string) {
    const saksnummer = getSaksnummerFraUrl(this.page);
    // Bruk trygdedekning combobox som anker - dette sikrer at perioden eksisterer
    const trygdedekningDropdown = this.page.getByRole("combobox", {
      name: new RegExp(`Trygdedekning periode ${index + 1}`, "i"),
    });
    await expect(
      trygdedekningDropdown,
      `${saksnummer}: Trygdedekning-dropdown for periode ${index + 1} skal være synlig`,
    ).toBeVisible({ timeout: 10000 });

    // Finn alle inputs på siden, og filtrér ved å telle medlemskapsperiode-inputs
    // Hent alle inputs i perioder-seksjonen som ikke er hidden
    const allInputs = await this.page
      .locator('.perioder input[type="text"]:visible, .perioder input:not([type]):visible')
      .all();

    // Finn de to første inputs som tilhører medlemskapsperiode (før skatteforhold-seksjonen)
    // Vi tar index * 2 fordi hver periode har 2 inputs (fom, tom)
    const inputIndex = index * 2;

    expect(
      inputIndex < allInputs.length,
      `${saksnummer}: Kan ikke finne input ${inputIndex} for periode ${index + 1}. Totalt ${allInputs.length} inputs funnet.`,
    ).toBe(true);

    await allInputs[inputIndex].fill(dato);
  }

  async fyllUtMedlemskapsperiodeTomDato(index: number, dato: string) {
    const saksnummer = getSaksnummerFraUrl(this.page);
    // Bruk trygdedekning combobox som anker - dette sikrer at perioden eksisterer
    const trygdedekningDropdown = this.page.getByRole("combobox", {
      name: new RegExp(`Trygdedekning periode ${index + 1}`, "i"),
    });
    await expect(
      trygdedekningDropdown,
      `${saksnummer}: Trygdedekning-dropdown for periode ${index + 1} skal være synlig`,
    ).toBeVisible({ timeout: 10000 });

    // Finn alle inputs på siden
    const allInputs = await this.page
      .locator('.perioder input[type="text"]:visible, .perioder input:not([type]):visible')
      .all();

    // Vi tar index * 2 + 1 fordi hver periode har 2 inputs (fom=0, tom=1)
    const inputIndex = index * 2 + 1;

    expect(
      inputIndex < allInputs.length,
      `${saksnummer}: Kan ikke finne input ${inputIndex} for periode ${index + 1}. Totalt ${allInputs.length} inputs funnet.`,
    ).toBe(true);

    await allInputs[inputIndex].fill(dato);
  }

  async velgTrygdedekning(index: number, dekning: string) {
    const saksnummer = getSaksnummerFraUrl(this.page);
    const select = this.page.getByRole("combobox", {
      name: new RegExp(`Trygdedekning periode ${index + 1}`, "i"),
    });
    await expect(select, `${saksnummer}: Trygdedekning-select for periode ${index + 1} skal være synlig`).toBeVisible({
      timeout: 10000,
    });
    await select.selectOption({ label: dekning });
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

  async getMedlemskapsperiodeTomDato(index: number): Promise<string> {
    const allInputs = await this.page
      .locator('.perioder input[type="text"]:visible, .perioder input:not([type]):visible')
      .all();
    const inputIndex = index * 2 + 1;
    if (inputIndex >= allInputs.length) {
      return "";
    }
    return (await allInputs[inputIndex].inputValue()) || "";
  }

  async getAntallMedlemskapsperioder(): Promise<number> {
    const saksnummer = getSaksnummerFraUrl(this.page);
    // Vent på at minst ett trygdedekning-felt er synlig før telling
    const firstSelect = this.page.locator('select[name^="medlemskapsperioder["][name$="].trygdedekning"]').first();
    await expect(firstSelect, `${saksnummer}: Første trygdedekning-select skal være synlig`).toBeVisible({
      timeout: 10000,
    });
    return await this.page.locator('select[name^="medlemskapsperioder["][name$="].trygdedekning"]').count();
  }

  // Skatteforholdsperiode operasjoner
  async leggTilSkatteforholdsperiode() {
    await this.page.getByRole("button", { name: /legg til skatteforhold/i }).click();
  }

  async fyllUtSkatteforholdFomDato(index: number, dato: string) {
    // Vent på at skatteforhold-seksjonen er synlig ved å sjekke for første textbox med label "Skatteforhold"
    const firstSkattLabel = this.page.locator('text="Skatteforhold"').first();
    const saksnummer = getSaksnummerFraUrl(this.page);
    await expect(firstSkattLabel, `${saksnummer}: Label 'Skatteforhold' skal være synlig`).toBeVisible({
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
      `${saksnummer}: Kan ikke finne input ${inputIndex} for skatteforhold ${index}. Totalt ${allInputs.length} inputs funnet.`,
    ).toBe(true);

    await allInputs[inputIndex].fill(dato);
  }

  async fyllUtSkatteforholdTomDato(index: number, dato: string) {
    const firstSkattLabel = this.page.locator('text="Skatteforhold"').first();
    const saksnummer = getSaksnummerFraUrl(this.page);
    await expect(firstSkattLabel, `${saksnummer}: Label 'Skatteforhold' skal være synlig`).toBeVisible({
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
      `${saksnummer}: Kan ikke finne input ${inputIndex} for skatteforhold ${index}. Totalt ${allInputs.length} inputs funnet.`,
    ).toBe(true);

    await allInputs[inputIndex].fill(dato);
  }

  async velgSkatteplikttype(index: number, type: string) {
    const saksnummer = getSaksnummerFraUrl(this.page);
    // Skatteplikttype er en RadioGroup med "Ja"/"Nei", ikke en select
    // type parameter kan være "Ja" eller "Nei" (eller "Skattepliktig"/"Ikke skattepliktig")
    const radioValue = type.toLowerCase().includes("ja") || type.toLowerCase().includes("skattepliktig") ? "Ja" : "Nei";

    // Finn radio-knappen ved å bruke group legend som anker
    const radioGroup = this.page.locator(`[name="skatteforholdsperioder[${index}].skatteplikttype"]`).locator("..");
    const radio = radioGroup.getByRole("radio", { name: new RegExp(radioValue, "i") });
    await expect(radio, `${saksnummer}: Radio-button "${radioValue}" for skatteplikttype skal være synlig`).toBeVisible(
      { timeout: 5000 },
    );
    await radio.click({ force: true });
  }

  // Inntektsperiode operasjoner
  async leggTilInntektsperiode() {
    await this.page.getByRole("button", { name: /legg til inntekt/i }).click();
  }

  async fyllUtInntektsperiodeFomDato(index: number, dato: string) {
    // Vent på at inntektsperiode-seksjonen er synlig
    const firstInntektLabel = this.page.locator('text="Inntektsperiode"').first();
    const saksnummer = getSaksnummerFraUrl(this.page);
    await expect(firstInntektLabel, `${saksnummer}: Label 'Inntektsperiode' skal være synlig`).toBeVisible({
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
      `${saksnummer}: Kan ikke finne input ${inputIndex} for inntektsperiode ${index}. Totalt ${allInputs.length} inputs funnet.`,
    ).toBe(true);

    await allInputs[inputIndex].fill(dato);
  }

  async fyllUtInntektsperiodeTomDato(index: number, dato: string) {
    const firstInntektLabel = this.page.locator('text="Inntektsperiode"').first();
    const saksnummer = getSaksnummerFraUrl(this.page);
    await expect(firstInntektLabel, `${saksnummer}: Label 'Inntektsperiode' skal være synlig`).toBeVisible({
      timeout: 10000,
    });

    const inntektContainer = this.page.locator(".perioder").filter({ has: firstInntektLabel });
    const allInputs = await inntektContainer.locator('input[type="text"]:visible, input:not([type]):visible').all();

    const inputIndex = index * 3 + 1;

    expect(
      inputIndex < allInputs.length,
      `${saksnummer}: Kan ikke finne input ${inputIndex} for inntektsperiode ${index}. Totalt ${allInputs.length} inputs funnet.`,
    ).toBe(true);

    await allInputs[inputIndex].fill(dato);
  }

  async velgKildetype(index: number, type: string) {
    const saksnummer = getSaksnummerFraUrl(this.page);
    // Bruk aria-label tilnærming for select, eller fall tilbake til name attribute hvis det fungerer
    const select = this.page.locator(`select[name="inntektskilder[${index}].kildetype"]`);
    await expect(select, `${saksnummer}: Kildetype-select for inntektsperiode ${index} skal være synlig`).toBeVisible({
      timeout: 10000,
    });
    await select.selectOption({ label: type });
  }

  async fyllUtBruttoInntekt(index: number, belop: string) {
    const firstInntektLabel = this.page.locator('text="Inntektsperiode"').first();
    const saksnummer = getSaksnummerFraUrl(this.page);
    await expect(firstInntektLabel, `${saksnummer}: Label 'Inntektsperiode' skal være synlig`).toBeVisible({
      timeout: 10000,
    });

    const inntektContainer = this.page.locator(".perioder").filter({ has: firstInntektLabel });
    const allInputs = await inntektContainer.locator('input[type="text"]:visible, input:not([type]):visible').all();

    // BruttoInntekt er den 3. inputen i hver rad (fom=0, tom=1, bruttoInntekt=2)
    const inputIndex = index * 3 + 2;

    expect(
      inputIndex < allInputs.length,
      `${saksnummer}: Kan ikke finne bruttoInntekt input ${inputIndex} for inntektsperiode ${index}. Totalt ${allInputs.length} inputs funnet.`,
    ).toBe(true);

    await allInputs[inputIndex].fill(belop);
  }

  // Trygdeavgift fra Avgiftssystemet (delt grunnlag)
  async velgDeltGrunnlagJa() {
    const saksnummer = getSaksnummerFraUrl(this.page);
    const jaRadio = this.page.getByRole("radio", { name: /ja/i }).first();
    await expect(jaRadio, `${saksnummer}: Radio-button 'Ja' skal være synlig`).toBeVisible({ timeout: 10000 });

    // Bruk click() i stedet for check() for å håndtere NAV Design System radio-knapper
    // click() fungerer selv om knappen allerede er checked
    await jaRadio.click({ force: true });

    // Vent på at API-kallet for oppdaterHarTrygdeavgiftFraAvgiftssystemet fullføres
    // og at skjemaet re-rendres med medlemskapsperiode-feltene
    const medlemskapsperiodeFelt = this.page.getByRole("combobox", { name: /trygdedekning periode 1/i });
    await expect(
      medlemskapsperiodeFelt,
      `${saksnummer}: Medlemskapsperiode-felt skal være synlig etter delt grunnlag valgt`,
    ).toBeVisible({ timeout: 5000 });
  }

  async velgDeltGrunnlagNei() {
    await this.page.getByRole("radio", { name: /nei/i }).first().check();
  }

  async klikkBeregnEndeligTrygdeavgift() {
    await this.page.getByRole("button", { name: /beregn.*endelig.*trygdeavgift/i }).click();
  }

  async fyllUtTrygdeavgiftFraAvgiftssystemet(belop: string) {
    await this.page.getByRole("textbox", { name: /trygdeavgift.*avgiftssystemet/i }).fill(belop);
  }

  // Datepicker-spesifikke metoder for å teste datovelger
  async klikkMedlemskapsperiodeFomDatepicker(index: number) {
    const trygdedekningDropdown = this.page.getByRole("combobox", {
      name: new RegExp(`Trygdedekning periode ${index + 1}`, "i"),
    });
    const saksnummer = getSaksnummerFraUrl(this.page);
    await expect(
      trygdedekningDropdown,
      `${saksnummer}: Trygdedekning-dropdown for periode ${index + 1} skal være synlig`,
    ).toBeVisible({ timeout: 10000 });

    const allInputs = await this.page
      .locator('.perioder input[type="text"]:visible, .perioder input:not([type]):visible')
      .all();
    const inputIndex = index * 2;

    expect(
      inputIndex < allInputs.length,
      `${saksnummer}: Kan ikke finne input ${inputIndex} for periode ${index + 1}. Totalt ${allInputs.length} inputs funnet.`,
    ).toBe(true);

    // Finn "Åpne datovelger" knappen som er søsken til input-feltet
    const inputElement = allInputs[inputIndex];
    const datepickerButton = inputElement.locator("..").getByRole("button", { name: /åpne datovelger/i });
    await datepickerButton.click();
  }

  async klikkMedlemskapsperiodeTomDatepicker(index: number) {
    const trygdedekningDropdown = this.page.getByRole("combobox", {
      name: new RegExp(`Trygdedekning periode ${index + 1}`, "i"),
    });
    const saksnummer = getSaksnummerFraUrl(this.page);
    await expect(
      trygdedekningDropdown,
      `${saksnummer}: Trygdedekning-dropdown for periode ${index + 1} skal være synlig`,
    ).toBeVisible({ timeout: 10000 });

    const allInputs = await this.page
      .locator('.perioder input[type="text"]:visible, .perioder input:not([type]):visible')
      .all();
    const inputIndex = index * 2 + 1;

    expect(
      inputIndex < allInputs.length,
      `${saksnummer}: Kan ikke finne input ${inputIndex} for periode ${index + 1}. Totalt ${allInputs.length} inputs funnet.`,
    ).toBe(true);

    // Finn "Åpne datovelger" knappen som er søsken til input-feltet
    const inputElement = allInputs[inputIndex];
    const datepickerButton = inputElement.locator("..").getByRole("button", { name: /åpne datovelger/i });
    await datepickerButton.click();
  }

  async assertDatepickerErAktiv() {
    const saksnummer = getSaksnummerFraUrl(this.page);
    // NAV Design System bruker et dialog element for datepicker
    const datepicker = this.page.getByRole("dialog");
    await expect(datepicker, `${saksnummer}: Datepicker-dialog skal være synlig`).toBeVisible({ timeout: 2000 });
  }

  async assertDatepickerIkkeErAktiv() {
    // NAV Design System bruker et dialog element for datepicker
    const datepicker = this.page.getByRole("dialog");
    await expect(datepicker).not.toBeVisible();
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

  // Validering og feilmeldinger
  async assertIngenValideringsfeil() {
    const errors = this.page.locator('[class*="error"], [class*="feil"]').filter({ hasText: /utenfor|mangler/i });
    await expect(errors).toHaveCount(0);
  }

  async assertValideringsfeilInneholder(tekst: string) {
    const error = this.page.locator('[class*="error"], [class*="feil"]').filter({ hasText: new RegExp(tekst, "i") });
    await expect(
      error,
      `${getSaksnummerFraUrl(this.page)}: Feilmelding som inneholder "${tekst}" skal være synlig`,
    ).toBeVisible();
  }

  async assertIngenFeilmelding(tekst: string) {
    const error = this.page.locator('[class*="error"], [class*="feil"]').filter({ hasText: new RegExp(tekst, "i") });
    await expect(error).not.toBeVisible();
  }

  // Bekreft og fortsett
  async bekreftOgFortsett() {
    await this.page.getByRole("button", { name: /bekreft og fortsett/i }).click();
  }

  async assertBekreftKnappAktiv() {
    const knapp = this.page.getByRole("button", { name: /bekreft og fortsett/i });
    await expect(knapp).toBeEnabled();
  }

  async assertBekreftKnappInaktiv() {
    const knapp = this.page.getByRole("button", { name: /bekreft og fortsett/i });
    await expect(knapp).toBeDisabled();
  }

  // Verifiser at siden er lastet
  async verifiserAarsavregningside() {
    await expect(this.page.getByRole("heading", { name: /årsavregning/i })).toBeVisible();
  }

  // Vent på beregning
  async ventPåBeregning(timeoutMs: number = 5000) {
    // Vent på at loading-indikatoren dukker opp først (bevis på at beregning har startet),
    // deretter vent på at den forsvinner (beregning fullført)
    const loadingIndicator = this.page.locator('[class*="loading"], [class*="spinner"]');

    // Prøv først å vent på at loading-indikatoren dukker opp (kan allerede være der)
    await loadingIndicator.isVisible({ timeout: 1000 }).catch(() => {
      // Hvis loading-indikatoren ikke dukker opp, betyr det at beregningen var rask
    });

    // Vent på at loading-indikatoren forsvinner
    await expect(loadingIndicator).not.toBeVisible({ timeout: timeoutMs });
  }
}
