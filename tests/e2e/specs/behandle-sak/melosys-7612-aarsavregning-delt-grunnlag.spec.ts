import { test, Page, expect } from "@playwright/test";
import { HovedsidePage, USER_ID_VALID } from "../../pages/hovedside.page";
import { SokPage } from "../../pages/sok.page";
import { VisBehandlingPage } from "../../pages/vis-behandling.page";
import { AarsavregningPage } from "../../pages/aarsavregning.page";
import { OpprettNySakPage } from "../../pages/opprett-ny-sak.page";
import { assertNyBehandlingOpprettet } from "../../utils/testUtils";
import { opprettUtenforAvtalelandSak } from "../../utils/testdataUtils";

/**
 * MELOSYS-7612: Valideringsfeil ved delt grunnlag i årsavregning
 *
 * Bug i validering og datovelger for medlemskapsperioder, skatteforholdsperioder
 * og inntektsperioder når man legger til trygdeavgift fra Avgiftssystemet (delt grunnlag).
 *
 * Testene verifiserer at:
 * - AC1: Medlemskapsperioder kan legges til uten valideringsfeil
 * - AC2: Skatteforholdsperioder kan legges til/utvides uten valideringsfeil
 * - AC3: Inntektsperioder kan legges til/utvides uten valideringsfeil
 */

let aarsavregningPage: AarsavregningPage;

/**
 * Opprett testdata: Utenfor avtaleland-sak med Førstegangsbehandling, deretter Årsavregning
 */
async function opprettAarsavregningTestdata(page: Page): Promise<void> {
  const hovedsidePage = new HovedsidePage(page);
  const sokPage = new SokPage(page);
  const behandlingPage = new VisBehandlingPage(page);
  const opprettNySakPage = new OpprettNySakPage(page);

  // 1. Opprett Førstegangsbehandling
  const sakId = await opprettUtenforAvtalelandSak(page);

  // 2. Avslutt Førstegangsbehandling
  await hovedsidePage.goto();
  await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

  const sak = sokPage.finnSakBySaksnummer(sakId);
  await sokPage.klikkVisBehandling(sak);
  await behandlingPage.verifiserBehandlingsside();
  await behandlingPage.avsluttBehandling("Søknaden er innvilget", sakId);

  // 3. Opprett Årsavregning på samme sak
  await hovedsidePage.goto();
  await hovedsidePage.klikkOpprettNySakKnapp();
  await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
  await opprettNySakPage.velgKnyttTilEksisterendeSak();

  const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);
  await valgtSak.click();
  await opprettNySakPage.velgBehandlingstypeRadio("Årsavregning");
  await opprettNySakPage.velgBehandlingsaarsak("Søknad");
  await opprettNySakPage.klikkOpprettNyBehandling();

  await assertNyBehandlingOpprettet(page);
}

/**
 * Gjenbrukbar setup-funksjon som navigerer til en årsavregning-behandling
 */
async function setupAarsavregningTest(page: Page) {
  const mainPage = new HovedsidePage(page);
  const sokPage = new SokPage(page);
  const behandlingPage = new VisBehandlingPage(page);
  aarsavregningPage = new AarsavregningPage(page);

  await mainPage.goto();
  await mainPage.søkOgVentPåResultat(USER_ID_VALID);

  // Finn åpne FTRL-saker med Årsavregning behandling
  const saker = await sokPage.finnÅpneSaker("Utenfor avtaleland", "Årsavregning");
  expect(saker.length, "Ingen åpne 'Utenfor avtaleland - Årsavregning' saker funnet").toBeGreaterThan(0);

  await sokPage.klikkVisBehandling(saker[0]!);
  await behandlingPage.verifiserBehandlingsside();

  await page.waitForLoadState("domcontentloaded");

  // Naviger til årsavregning-tab (antatt lignende struktur som send-brev)
  const aarsavregningTab = page.locator('button[role="tab"]:has-text("Årsavregning")');
  if (await aarsavregningTab.isVisible({ timeout: 2000 }).catch(() => false)) {
    await aarsavregningTab.click();
    await page.waitForTimeout(500);
  }

  await aarsavregningPage.verifiserAarsavregningside();

  // Velg år 2024 (nødvendig for at delt grunnlag-spørsmål skal vises)
  await aarsavregningPage.velgÅr("2024");
}

// Setup: Opprett testdata først
test.describe("MELOSYS-7612: Setup testdata", () => {
  test("Opprett Utenfor avtaleland-sak med Årsavregning", async ({ page }) => {
    test.setTimeout(60000); // Sett timeout til 60 sekunder for setup
    await opprettAarsavregningTestdata(page);
  });
});

test.describe("MELOSYS-7612: AC1 - Medlemskapsperiode validering", () => {
  test.beforeEach(async ({ page }) => {
    await setupAarsavregningTest(page);
  });

  test("Kan legge til ny medlemskapsperiode etter å ha valgt delt grunnlag", async ({ page }) => {
    // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
    await aarsavregningPage.velgDeltGrunnlagJa();

    // Klikk på "beregn endelig trygdeavgift" (hvis synlig)
    const beregnKnapp = page.getByRole("button", { name: /beregn.*endelig.*trygdeavgift/i });
    if (await beregnKnapp.isVisible({ timeout: 2000 }).catch(() => false)) {
      await aarsavregningPage.klikkBeregnEndeligTrygdeavgift();
      await aarsavregningPage.ventPåBeregning();
    }

    // Tell antall eksisterende medlemskapsperioder
    const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();

    // Legg til ny medlemskapsperiode
    await aarsavregningPage.leggTilMedlemskapsperiode();

    // Verifiser at en ny periode er lagt til
    const antallEtter = await aarsavregningPage.getAntallMedlemskapsperioder();
    expect(antallEtter).toBe(antallFør + 1);

    // Fyll ut datoer for den nye perioden (manuelt)
    const nyPeriodeIndex = antallEtter - 1;
    await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(nyPeriodeIndex, "01.01.2024");
    await aarsavregningPage.fyllUtMedlemskapsperiodeTomDato(nyPeriodeIndex, "31.03.2024");

    // Velg trygdedekning
    await aarsavregningPage.velgTrygdedekning(nyPeriodeIndex, "Medlem");

    // Verifiser at det ikke er valideringsfeil
    await aarsavregningPage.assertIngenFeilmelding("utenfor");
    await aarsavregningPage.assertIngenFeilmelding("overlapper");
  });

  test("Datepicker skal fungere for fra-dato på ny medlemskapsperiode", async ({ page }) => {
    // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
    await aarsavregningPage.velgDeltGrunnlagJa();

    const beregnKnapp = page.getByRole("button", { name: /beregn.*endelig.*trygdeavgift/i });
    if (await beregnKnapp.isVisible({ timeout: 2000 }).catch(() => false)) {
      await aarsavregningPage.klikkBeregnEndeligTrygdeavgift();
      await aarsavregningPage.ventPåBeregning();
    }

    const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();

    // Legg til ny medlemskapsperiode
    await aarsavregningPage.leggTilMedlemskapsperiode();

    const nyPeriodeIndex = antallFør;

    // Klikk på fra-dato datepicker
    await aarsavregningPage.klikkMedlemskapsperiodeFomDatepicker(nyPeriodeIndex);

    // Verifiser at datepicker åpnes
    await aarsavregningPage.assertDatepickerErAktiv();

    // Prøv å velge en dato i datepickeren (f.eks. 15. i gjeldende måned)
    const testDato = new Date(2024, 0, 15); // 15. januar 2024
    await aarsavregningPage.velgDatoIDatepicker(testDato);

    // Verifiser at datoen er valgt (datepicker lukker seg)
    await aarsavregningPage.assertDatepickerIkkeErAktiv();

    // Verifiser at feltet har en verdi
    const fomVerdi = await aarsavregningPage.getMedlemskapsperiodeFomDato(nyPeriodeIndex);
    expect(fomVerdi).not.toBe("");
  });

  test("Kan legge til sammenhengende medlemskapsperiode innenfor samme år", async ({ page }) => {
    // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
    await aarsavregningPage.velgDeltGrunnlagJa();

    const beregnKnapp = page.getByRole("button", { name: /beregn.*endelig.*trygdeavgift/i });
    if (await beregnKnapp.isVisible({ timeout: 2000 }).catch(() => false)) {
      await aarsavregningPage.klikkBeregnEndeligTrygdeavgift();
      await aarsavregningPage.ventPåBeregning();
    }

    const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();

    // Legg til ny medlemskapsperiode
    await aarsavregningPage.leggTilMedlemskapsperiode();

    const nyPeriodeIndex = antallFør;

    // Fyll ut sammenhengende periode innenfor 2024
    // Anta at forrige periode slutter 31.03.2024, ny starter 01.04.2024
    await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(nyPeriodeIndex, "01.04.2024");
    await aarsavregningPage.fyllUtMedlemskapsperiodeTomDato(nyPeriodeIndex, "30.06.2024");
    await aarsavregningPage.velgTrygdedekning(nyPeriodeIndex, "Medlem");

    // Verifiser at det ikke er valideringsfeil om overlappende eller ugyldige perioder
    await aarsavregningPage.assertIngenFeilmelding("overlapper");
    await aarsavregningPage.assertIngenFeilmelding("ugyldig");
    await aarsavregningPage.assertIngenFeilmelding("må være etter");
  });
});

test.describe("MELOSYS-7612: AC2 - Skatteforholdsperiode validering", () => {
  test.beforeEach(async ({ page }) => {
    await setupAarsavregningTest(page);
  });

  test("Kan legge til ny skatteforholdsperiode etter å ha valgt delt grunnlag", async ({ page }) => {
    // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
    await aarsavregningPage.velgDeltGrunnlagJa();

    const beregnKnapp = page.getByRole("button", { name: /beregn.*endelig.*trygdeavgift/i });
    if (await beregnKnapp.isVisible({ timeout: 2000 }).catch(() => false)) {
      await aarsavregningPage.klikkBeregnEndeligTrygdeavgift();
      await aarsavregningPage.ventPåBeregning();
    }

    // Først, legg til medlemskapsperiode som dekker perioden
    const antallMedlemskapFør = await aarsavregningPage.getAntallMedlemskapsperioder();
    await aarsavregningPage.leggTilMedlemskapsperiode();

    const nyMedlemIndex = antallMedlemskapFør;
    await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(nyMedlemIndex, "01.01.2024");
    await aarsavregningPage.fyllUtMedlemskapsperiodeTomDato(nyMedlemIndex, "31.12.2024");
    await aarsavregningPage.velgTrygdedekning(nyMedlemIndex, "Medlem");

    // Legg til skatteforholdsperiode
    await aarsavregningPage.leggTilSkatteforholdsperiode();

    // Fyll ut skatteforholdsperiode innenfor medlemskapsperioden
    await aarsavregningPage.fyllUtSkatteforholdFomDato(0, "01.01.2024");
    await aarsavregningPage.fyllUtSkatteforholdTomDato(0, "30.06.2024");
    await aarsavregningPage.velgSkatteplikttype(0, "Allmennpliktig");

    // Verifiser at det ikke er valideringsfeil om "utenfor medlemskapsperioden"
    await aarsavregningPage.assertIngenFeilmelding("utenfor medlemskapsperioden");
  });

  test("Kan utvide skatteforholdsperiode innenfor medlemskapsperiode", async ({ page }) => {
    // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
    await aarsavregningPage.velgDeltGrunnlagJa();

    const beregnKnapp = page.getByRole("button", { name: /beregn.*endelig.*trygdeavgift/i });
    if (await beregnKnapp.isVisible({ timeout: 2000 }).catch(() => false)) {
      await aarsavregningPage.klikkBeregnEndeligTrygdeavgift();
      await aarsavregningPage.ventPåBeregning();
    }

    // Først, legg til medlemskapsperiode
    const antallMedlemskapFør = await aarsavregningPage.getAntallMedlemskapsperioder();
    await aarsavregningPage.leggTilMedlemskapsperiode();

    const nyMedlemIndex = antallMedlemskapFør;
    await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(nyMedlemIndex, "01.01.2024");
    await aarsavregningPage.fyllUtMedlemskapsperiodeTomDato(nyMedlemIndex, "31.12.2024");
    await aarsavregningPage.velgTrygdedekning(nyMedlemIndex, "Medlem");

    // Legg til skatteforholdsperiode
    await aarsavregningPage.leggTilSkatteforholdsperiode();
    await aarsavregningPage.fyllUtSkatteforholdFomDato(0, "01.01.2024");
    await aarsavregningPage.fyllUtSkatteforholdTomDato(0, "30.06.2024");
    await aarsavregningPage.velgSkatteplikttype(0, "Allmennpliktig");

    // Utvid perioden til å dekke hele året
    await aarsavregningPage.fyllUtSkatteforholdTomDato(0, "31.12.2024");

    // Verifiser at det ikke er valideringsfeil
    await aarsavregningPage.assertIngenFeilmelding("utenfor medlemskapsperioden");
    await aarsavregningPage.assertIngenFeilmelding("ugyldig");
  });
});

test.describe("MELOSYS-7612: AC3 - Inntektsperiode validering", () => {
  test.beforeEach(async ({ page }) => {
    await setupAarsavregningTest(page);
  });

  test("Kan legge til ny inntektsperiode etter å ha valgt delt grunnlag", async ({ page }) => {
    // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
    await aarsavregningPage.velgDeltGrunnlagJa();

    const beregnKnapp = page.getByRole("button", { name: /beregn.*endelig.*trygdeavgift/i });
    if (await beregnKnapp.isVisible({ timeout: 2000 }).catch(() => false)) {
      await aarsavregningPage.klikkBeregnEndeligTrygdeavgift();
      await aarsavregningPage.ventPåBeregning();
    }

    // Først, legg til medlemskapsperiode som dekker perioden
    const antallMedlemskapFør = await aarsavregningPage.getAntallMedlemskapsperioder();
    await aarsavregningPage.leggTilMedlemskapsperiode();

    const nyMedlemIndex = antallMedlemskapFør;
    await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(nyMedlemIndex, "01.01.2024");
    await aarsavregningPage.fyllUtMedlemskapsperiodeTomDato(nyMedlemIndex, "31.12.2024");
    await aarsavregningPage.velgTrygdedekning(nyMedlemIndex, "Medlem");

    // Legg til inntektsperiode
    await aarsavregningPage.leggTilInntektsperiode();

    // Fyll ut inntektsperiode innenfor medlemskapsperioden
    await aarsavregningPage.fyllUtInntektsperiodeFomDato(0, "01.01.2024");
    await aarsavregningPage.fyllUtInntektsperiodeTomDato(0, "31.03.2024");
    await aarsavregningPage.velgKildetype(0, "A-inntekt");
    await aarsavregningPage.fyllUtBruttoInntekt(0, "500000");

    // Verifiser at det ikke er valideringsfeil om "utenfor medlemskapsperioden"
    await aarsavregningPage.assertIngenFeilmelding("utenfor medlemskapsperioden");
  });

  test("Kan utvide inntektsperiode innenfor medlemskapsperiode", async ({ page }) => {
    // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
    await aarsavregningPage.velgDeltGrunnlagJa();

    const beregnKnapp = page.getByRole("button", { name: /beregn.*endelig.*trygdeavgift/i });
    if (await beregnKnapp.isVisible({ timeout: 2000 }).catch(() => false)) {
      await aarsavregningPage.klikkBeregnEndeligTrygdeavgift();
      await aarsavregningPage.ventPåBeregning();
    }

    // Først, legg til medlemskapsperiode
    const antallMedlemskapFør = await aarsavregningPage.getAntallMedlemskapsperioder();
    await aarsavregningPage.leggTilMedlemskapsperiode();

    const nyMedlemIndex = antallMedlemskapFør;
    await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(nyMedlemIndex, "01.01.2024");
    await aarsavregningPage.fyllUtMedlemskapsperiodeTomDato(nyMedlemIndex, "31.12.2024");
    await aarsavregningPage.velgTrygdedekning(nyMedlemIndex, "Medlem");

    // Legg til inntektsperiode
    await aarsavregningPage.leggTilInntektsperiode();
    await aarsavregningPage.fyllUtInntektsperiodeFomDato(0, "01.01.2024");
    await aarsavregningPage.fyllUtInntektsperiodeTomDato(0, "31.03.2024");
    await aarsavregningPage.velgKildetype(0, "A-inntekt");
    await aarsavregningPage.fyllUtBruttoInntekt(0, "500000");

    // Utvid perioden
    await aarsavregningPage.fyllUtInntektsperiodeTomDato(0, "30.09.2024");

    // Verifiser at det ikke er valideringsfeil
    await aarsavregningPage.assertIngenFeilmelding("utenfor medlemskapsperioden");
    await aarsavregningPage.assertIngenFeilmelding("ugyldig");
  });

  test("Kan legge til flere inntektsperioder innenfor samme år", async ({ page }) => {
    // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
    await aarsavregningPage.velgDeltGrunnlagJa();

    const beregnKnapp = page.getByRole("button", { name: /beregn.*endelig.*trygdeavgift/i });
    if (await beregnKnapp.isVisible({ timeout: 2000 }).catch(() => false)) {
      await aarsavregningPage.klikkBeregnEndeligTrygdeavgift();
      await aarsavregningPage.ventPåBeregning();
    }

    // Legg til medlemskapsperiode som dekker hele året
    const antallMedlemskapFør = await aarsavregningPage.getAntallMedlemskapsperioder();
    await aarsavregningPage.leggTilMedlemskapsperiode();

    const nyMedlemIndex = antallMedlemskapFør;
    await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(nyMedlemIndex, "01.01.2024");
    await aarsavregningPage.fyllUtMedlemskapsperiodeTomDato(nyMedlemIndex, "31.12.2024");
    await aarsavregningPage.velgTrygdedekning(nyMedlemIndex, "Medlem");

    // Legg til første inntektsperiode
    await aarsavregningPage.leggTilInntektsperiode();
    await aarsavregningPage.fyllUtInntektsperiodeFomDato(0, "01.01.2024");
    await aarsavregningPage.fyllUtInntektsperiodeTomDato(0, "30.06.2024");
    await aarsavregningPage.velgKildetype(0, "A-inntekt");
    await aarsavregningPage.fyllUtBruttoInntekt(0, "300000");

    // Legg til andre inntektsperiode
    await aarsavregningPage.leggTilInntektsperiode();
    await aarsavregningPage.fyllUtInntektsperiodeFomDato(1, "01.07.2024");
    await aarsavregningPage.fyllUtInntektsperiodeTomDato(1, "31.12.2024");
    await aarsavregningPage.velgKildetype(1, "A-inntekt");
    await aarsavregningPage.fyllUtBruttoInntekt(1, "400000");

    // Verifiser at ingen valideringsfeil
    await aarsavregningPage.assertIngenFeilmelding("utenfor medlemskapsperioden");
    await aarsavregningPage.assertIngenFeilmelding("overlapper");
  });
});
