import { expect, Page } from "@playwright/test";

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
    const årSelect = this.page.getByRole("combobox", { name: /år/i });
    await expect(årSelect).toBeVisible({ timeout: 5000 });
    await årSelect.selectOption({ label: år });
    await this.page.waitForTimeout(500); // Vent på at siden laster data for året
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
    await this.page.getByRole("button", { name: /legg til periode/i }).click();
  }

  async fyllUtMedlemskapsperiodeFomDato(index: number, dato: string) {
    const input = this.page.locator(`input[name="medlemskapsperioder[${index}].fomDato"]`);
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill(dato);
  }

  async fyllUtMedlemskapsperiodeTomDato(index: number, dato: string) {
    const input = this.page.locator(`input[name="medlemskapsperioder[${index}].tomDato"]`);
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill(dato);
  }

  async velgTrygdedekning(index: number, dekning: string) {
    const select = this.page.locator(`select[name="medlemskapsperioder[${index}].trygdedekning"]`);
    await expect(select).toBeVisible({ timeout: 5000 });
    await select.selectOption({ label: dekning });
  }

  async getMedlemskapsperiodeFomDato(index: number): Promise<string> {
    const input = this.page.locator(`input[name="medlemskapsperioder[${index}].fomDato"]`);
    await expect(input).toBeVisible({ timeout: 5000 });
    return (await input.inputValue()) || "";
  }

  async getMedlemskapsperiodeTomDato(index: number): Promise<string> {
    const input = this.page.locator(`input[name="medlemskapsperioder[${index}].tomDato"]`);
    await expect(input).toBeVisible({ timeout: 5000 });
    return (await input.inputValue()) || "";
  }

  async getAntallMedlemskapsperioder(): Promise<number> {
    return await this.page.locator('input[name^="medlemskapsperioder["][name$="].fomDato"]').count();
  }

  // Skatteforholdsperiode operasjoner
  async leggTilSkatteforholdsperiode() {
    await this.page.getByRole("button", { name: /legg til skatteforholdsperiode/i }).click();
  }

  async fyllUtSkatteforholdFomDato(index: number, dato: string) {
    const input = this.page.locator(`input[name="skatteforholdsperioder[${index}].fomDato"]`);
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill(dato);
  }

  async fyllUtSkatteforholdTomDato(index: number, dato: string) {
    const input = this.page.locator(`input[name="skatteforholdsperioder[${index}].tomDato"]`);
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill(dato);
  }

  async velgSkatteplikttype(index: number, type: string) {
    const select = this.page.locator(`select[name="skatteforholdsperioder[${index}].skatteplikttype"]`);
    await expect(select).toBeVisible({ timeout: 5000 });
    await select.selectOption({ label: type });
  }

  // Inntektsperiode operasjoner
  async leggTilInntektsperiode() {
    await this.page.getByRole("button", { name: /legg til inntektsperiode/i }).click();
  }

  async fyllUtInntektsperiodeFomDato(index: number, dato: string) {
    const input = this.page.locator(`input[name="inntektskilder[${index}].fomDato"]`);
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill(dato);
  }

  async fyllUtInntektsperiodeTomDato(index: number, dato: string) {
    const input = this.page.locator(`input[name="inntektskilder[${index}].tomDato"]`);
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill(dato);
  }

  async velgKildetype(index: number, type: string) {
    const select = this.page.locator(`select[name="inntektskilder[${index}].kildetype"]`);
    await expect(select).toBeVisible({ timeout: 5000 });
    await select.selectOption({ label: type });
  }

  async fyllUtBruttoInntekt(index: number, belop: string) {
    const input = this.page.locator(`input[name="inntektskilder[${index}].bruttoInntekt"]`);
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill(belop);
  }

  // Trygdeavgift fra Avgiftssystemet (delt grunnlag)
  async velgDeltGrunnlagJa() {
    const jaRadio = this.page.getByRole("radio", { name: /ja/i }).first();
    await expect(jaRadio).toBeVisible({ timeout: 10000 });
    await jaRadio.check();
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
    const input = this.page.locator(`input[name="medlemskapsperioder[${index}].fomDato"]`);
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.click();
  }

  async klikkMedlemskapsperiodeTomDatepicker(index: number) {
    const input = this.page.locator(`input[name="medlemskapsperioder[${index}].tomDato"]`);
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.click();
  }

  async assertDatepickerErAktiv() {
    const datepicker = this.page.locator('.react-datepicker, [class*="datepicker"]');
    await expect(datepicker).toBeVisible({ timeout: 2000 });
  }

  async assertDatepickerIkkeErAktiv() {
    const datepicker = this.page.locator('.react-datepicker, [class*="datepicker"]');
    await expect(datepicker).not.toBeVisible();
  }

  async velgDatoIDatepicker(dato: Date) {
    // Finn og klikk på den riktige datoen i datepickeren
    const dag = dato.getDate().toString();
    const datoKnapp = this.page
      .locator(`.react-datepicker__day:not(.react-datepicker__day--disabled):has-text("${dag}")`)
      .first();
    await datoKnapp.click();
  }

  // Validering og feilmeldinger
  async assertIngenValideringsfeil() {
    const errors = this.page.locator('[class*="error"], [class*="feil"]').filter({ hasText: /utenfor|mangler/i });
    await expect(errors).toHaveCount(0);
  }

  async assertValideringsfeilInneholder(tekst: string) {
    const error = this.page.locator('[class*="error"], [class*="feil"]').filter({ hasText: new RegExp(tekst, "i") });
    await expect(error).toBeVisible();
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
    // Vent på at loading-indikatoren forsvinner
    await this.page.waitForTimeout(1000); // Gi systemet tid til å starte beregning
    const loadingIndicator = this.page.locator('[class*="loading"], [class*="spinner"]');
    await expect(loadingIndicator).not.toBeVisible({ timeout: timeoutMs });
  }
}
