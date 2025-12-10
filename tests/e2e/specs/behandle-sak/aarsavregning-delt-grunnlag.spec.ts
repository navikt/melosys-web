import { test, expect } from "../../recording/fixtures";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../utils/testUtils";
import { BehandlingPage } from "../../pages/behandling/behandling.page";
import { AarsavregningPage } from "../../pages/behandling/aarsavregning.page";
import { hentPrepopulertSakUrl, PrepopulertSaksnummer } from "../../utils/testdataUtils";
import { runAxeAnalyze } from "../../utils/axeUtils";
import { Page } from "@playwright/test";

/**
 * Valideringsfeil ved delt grunnlag i årsavregning
 *
 * Bug i validering og datovelger for medlemskapsperioder, skatteforholdsperioder
 * og inntektsperioder når man legger til trygdeavgift fra Avgiftssystemet (delt grunnlag).
 *
 * Testene verifiserer at:
 * - Medlemskapsperioder kan legges til uten valideringsfeil
 * - Skatteforholdsperioder kan legges til/utvides uten valideringsfeil
 * - Inntektsperioder kan legges til/utvides uten valideringsfeil
 */

let aarsavregningPage: AarsavregningPage;
let valgtTestÅr: string;

/**
 * Hjelpefunksjon for å lage dato med riktig år
 */
function lagDato(dagMåned: string): string {
  return `${dagMåned}.${valgtTestÅr}`;
}

/**
 * Gjenbrukbar setup-funksjon som oppretter testdata og navigerer til en årsavregning-behandling
 */
async function setupAarsavregningTest(page: Page, saksnummer: PrepopulertSaksnummer) {
  const behandlingPage = new BehandlingPage(page, saksnummer);
  aarsavregningPage = new AarsavregningPage(page, saksnummer);

  // Hent URL til prepopulert FTRL-sak med årsavregning og naviger direkte dit
  const url = hentPrepopulertSakUrl(saksnummer);
  await behandlingPage.goto(url);

  await page.waitForLoadState("domcontentloaded");

  // Naviger til årsavregning-tab (antatt lignende struktur som send-brev)
  const aarsavregningTab = page.locator('button[role="tab"]:has-text("Årsavregning")');
  if (await aarsavregningTab.isVisible({ timeout: 2000 }).catch(() => false)) {
    await aarsavregningTab.click();
  }

  await aarsavregningPage.verifiserAarsavregningside();

  // Hent første tilgjengelige år fra dropdown-en og velg det
  valgtTestÅr = await aarsavregningPage.hentFørsteTilgjengeligeÅr();
  await aarsavregningPage.velgÅr(valgtTestÅr);
}

// Hver test oppretter sine egne testdata via setupAarsavregningTest
test.describe("Årsavregning delt grunnlag - Alle tester", () => {
  test.describe("Medlemskapsperiode validering", () => {
    test("Kan legge til ny medlemskapsperiode etter å ha valgt delt grunnlag", async ({
      page,
      apiRecorder,
    }, testInfo) => {
      test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Sett timeout til 30 sekunder for setup
      await setupAarsavregningTest(page, "MEL-1026");
      // Velg "Ja" på spør
      // smålet om å legge til trygdeavgift fra Avgiftssystemet
      await aarsavregningPage.velgDeltGrunnlagJa();

      // Velg bestemmelse først - dette er nødvendig for å få trygdedekning-alternativer
      // Bruk § 2-8 som ikke er en pliktig bestemmelse, slik at vi kan legge til flere perioder
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");

      // Tell antall eksisterende medlemskapsperioder (systemet kan ha lagt til en automatisk)
      const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();

      // Legg til ny medlemskapsperiode
      await aarsavregningPage.leggTilMedlemskapsperiode();

      // Verifiser at en ny periode er lagt til
      const antallEtter = await aarsavregningPage.getAntallMedlemskapsperioder();
      expect(antallEtter).toBe(antallFør + 1);

      // Fyll ut datoer for den nye perioden (manuelt)
      const nyPeriodeIndex = antallEtter - 1;
      await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(nyPeriodeIndex, lagDato("01.01"));
      await aarsavregningPage.fyllUtMedlemskapsperiodeTomDato(nyPeriodeIndex, lagDato("31.03"));

      // Velg trygdedekning
      await aarsavregningPage.velgTrygdedekning(nyPeriodeIndex, "Helse- og pensjonsdel (§ 2-9)");

      // Verifiser at det ikke er valideringsfeil
      await aarsavregningPage.verifiserIngenFeilmelding("utenfor");
      await aarsavregningPage.verifiserIngenFeilmelding("overlapper");

      await runAxeAnalyze(page, testInfo.title);
    });

    test("Datepicker skal fungere for fra-dato på ny medlemskapsperiode", async ({ page, apiRecorder }, testInfo) => {
      test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
      await setupAarsavregningTest(page, "MEL-1024");
      // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");

      const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();

      // Legg til ny medlemskapsperiode
      await aarsavregningPage.leggTilMedlemskapsperiode();

      const nyPeriodeIndex = antallFør; // Den nye perioden er på index = antall før

      // Klikk på fra-dato datepicker
      await aarsavregningPage.klikkMedlemskapsperiodeFomDatepicker(nyPeriodeIndex);

      // Verifiser at datepicker åpnes
      await aarsavregningPage.verifiserDatepickerErAktiv();

      // Prøv å velge en dato i datepickeren (f.eks. 15. i gjeldende måned)
      const testDato = new Date(parseInt(valgtTestÅr), 0, 15); // 15. januar
      await aarsavregningPage.velgDatoIDatepicker(testDato);

      // Verifiser at datoen er valgt (datepicker lukker seg)
      await aarsavregningPage.verifiserDatepickerIkkeErAktiv();

      // Verifiser at feltet har en verdi
      const fomVerdi = await aarsavregningPage.getMedlemskapsperiodeFomDato(nyPeriodeIndex);
      expect(fomVerdi).not.toBe("");

      await runAxeAnalyze(page, testInfo.title);
    });

    test("Kan legge til sammenhengende medlemskapsperiode innenfor samme år", async ({
      page,
      apiRecorder,
    }, testInfo) => {
      test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
      await setupAarsavregningTest(page, "MEL-1025");
      // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");

      const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();

      // Legg til ny medlemskapsperiode
      await aarsavregningPage.leggTilMedlemskapsperiode();

      const nyPeriodeIndex = antallFør; // Den nye perioden er på index = antall før

      // Fyll ut sammenhengende periode innenfor året
      // Anta at forrige periode slutter 31.03, ny starter 01.04
      await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(nyPeriodeIndex, lagDato("01.04"));
      await aarsavregningPage.fyllUtMedlemskapsperiodeTomDato(nyPeriodeIndex, lagDato("30.06"));
      await aarsavregningPage.velgTrygdedekning(nyPeriodeIndex, "Helse- og pensjonsdel (§ 2-9)");

      // Verifiser at det ikke er valideringsfeil om overlappende eller ugyldige perioder
      await aarsavregningPage.verifiserIngenFeilmelding("overlapper");
      await aarsavregningPage.verifiserIngenFeilmelding("ugyldig");
      await aarsavregningPage.verifiserIngenFeilmelding("må være etter");

      await runAxeAnalyze(page, testInfo.title);
    });
  });

  test.describe("Skatteforholdsperiode validering", () => {
    test("Kan legge til ny skatteforholdsperiode etter å ha valgt delt grunnlag", async ({
      page,
      apiRecorder,
    }, testInfo) => {
      test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
      await setupAarsavregningTest(page, "MEL-1041");
      // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");

      // Først, legg til medlemskapsperiode som dekker perioden
      const antallMedlemskapFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();

      const nyMedlemIndex = antallMedlemskapFør;
      await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(nyMedlemIndex, lagDato("01.01"));
      await aarsavregningPage.fyllUtMedlemskapsperiodeTomDato(nyMedlemIndex, lagDato("31.12"));
      await aarsavregningPage.velgTrygdedekning(nyMedlemIndex, "Helse- og pensjonsdel (§ 2-9)");

      // Legg til skatteforholdsperiode
      await aarsavregningPage.klikkLeggTilSkatteforhold();

      // Fyll ut skatteforholdsperiode innenfor medlemskapsperioden
      await aarsavregningPage.fyllUtSkatteforholdFomDato(0, lagDato("01.01"));
      await aarsavregningPage.fyllUtSkatteforholdTomDato(0, lagDato("30.06"));
      await aarsavregningPage.velgSkatteplikttype(0, "Allmennpliktig");

      // Verifiser at det ikke er valideringsfeil om "utenfor medlemskapsperioden"
      await aarsavregningPage.verifiserIngenFeilmelding("utenfor medlemskapsperioden");

      await runAxeAnalyze(page, testInfo.title);
    });

    test("Kan utvide skatteforholdsperiode innenfor medlemskapsperiode", async ({ page, apiRecorder }, testInfo) => {
      test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
      await setupAarsavregningTest(page, "MEL-1042");
      // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");

      // Vent på at "Legg til periode"-knappen blir synlig
      await page.locator('button:has-text("Legg til periode")').waitFor({ state: "visible" });

      // Først, legg til medlemskapsperiode
      const antallMedlemskapFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();

      const nyMedlemIndex = antallMedlemskapFør;
      await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(nyMedlemIndex, lagDato("01.01"));
      await aarsavregningPage.fyllUtMedlemskapsperiodeTomDato(nyMedlemIndex, lagDato("31.12"));
      await aarsavregningPage.velgTrygdedekning(nyMedlemIndex, "Helse- og pensjonsdel (§ 2-9)");

      // Legg til skatteforholdsperiode
      await aarsavregningPage.klikkLeggTilSkatteforhold();
      await aarsavregningPage.fyllUtSkatteforholdFomDato(0, lagDato("01.01"));
      await aarsavregningPage.fyllUtSkatteforholdTomDato(0, lagDato("30.06"));
      await aarsavregningPage.velgSkatteplikttype(0, "Allmennpliktig");

      // Utvid perioden til å dekke hele året
      await aarsavregningPage.fyllUtSkatteforholdTomDato(0, lagDato("31.12"));

      // Verifiser at det ikke er valideringsfeil
      await aarsavregningPage.verifiserIngenFeilmelding("utenfor medlemskapsperioden");
      await aarsavregningPage.verifiserIngenFeilmelding("ugyldig");

      await runAxeAnalyze(page, testInfo.title);
    });
  });

  test.describe("Legg til periode med pliktig bestemmelse (bugfix)", () => {
    test("skal vise 'Legg til periode'-knappen for delt grunnlag selv med pliktig bestemmelse", async ({
      page,
    }, testInfo) => {
      test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
      await setupAarsavregningTest(page, "MEL-1043");
      // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet (delt grunnlag)
      await aarsavregningPage.velgDeltGrunnlagJa();

      // Velg en PLIKTIG bestemmelse - dette er kjernen av bugfixen
      // § 2-7 er en pliktig bestemmelse
      await aarsavregningPage.velgBestemmelse("§ 2-7 første ledd (opphold i Norge)");

      // Vent på at "Legg til periode"-knappen blir synlig
      await page.locator('button:has-text("Legg til periode")').waitFor({ state: "visible" });

      // Verifiser at "Legg til periode"-knappen er synlig
      // Dette var buggen: Knappen ble skjult for pliktige bestemmelser selv med delt grunnlag
      const leggTilKnapp = page.locator('button:has-text("Legg til periode")');
      await expect(leggTilKnapp).toBeVisible();

      // Verifiser at knappen er klikkbar (ikke disabled)
      await expect(leggTilKnapp).toBeEnabled();

      await runAxeAnalyze(page, testInfo.title);
    });

    test("kan legge til ny periode med pliktig bestemmelse og delt grunnlag", async ({
      page,
      apiRecorder,
    }, testInfo) => {
      test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
      await setupAarsavregningTest(page, "MEL-1044");
      // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet (delt grunnlag)
      await aarsavregningPage.velgDeltGrunnlagJa();

      // Velg en PLIKTIG bestemmelse
      await aarsavregningPage.velgBestemmelse("§ 2-7 første ledd (opphold i Norge)");

      const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();

      // Klikk på "Legg til periode"-knappen
      await aarsavregningPage.leggTilMedlemskapsperiode();

      // Verifiser at en ny periode er lagt til
      const antallEtter = await aarsavregningPage.getAntallMedlemskapsperioder();
      expect(antallEtter).toBe(antallFør + 1);

      // Fyll ut den nye perioden
      const nyPeriodeIndex = antallEtter - 1;
      await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(nyPeriodeIndex, lagDato("01.01"));
      await aarsavregningPage.fyllUtMedlemskapsperiodeTomDato(nyPeriodeIndex, lagDato("31.03"));

      // Velg trygdedekning
      await aarsavregningPage.velgTrygdedekning(nyPeriodeIndex, "Helsedel med syke- og foreldrepenger (§ 2-7)");

      // Verifiser at det ikke er valideringsfeil
      await aarsavregningPage.verifiserIngenFeilmelding("utenfor");
      await aarsavregningPage.verifiserIngenFeilmelding("overlapper");

      await runAxeAnalyze(page, testInfo.title);
    });
  });

  test.describe("Inntektsperiode validering", () => {
    test("Kan legge til ny inntektsperiode etter å ha valgt delt grunnlag", async ({ page, apiRecorder }, testInfo) => {
      test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
      await setupAarsavregningTest(page, "MEL-1045");
      // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");

      // Først, legg til medlemskapsperiode som dekker perioden
      const antallMedlemskapFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();

      const nyMedlemIndex = antallMedlemskapFør;
      await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(nyMedlemIndex, lagDato("01.01"));
      await aarsavregningPage.fyllUtMedlemskapsperiodeTomDato(nyMedlemIndex, lagDato("31.12"));
      await aarsavregningPage.velgTrygdedekning(nyMedlemIndex, "Helse- og pensjonsdel (§ 2-9)");

      // Fyll ut skatteforholdsperiode (auto-opprettet) og sett skatteplikttype til "Nei"
      // Dette er nødvendig for at inntektsperiode-seksjonen skal vises
      await aarsavregningPage.fyllUtSkatteforholdFomDato(0, lagDato("01.01"));
      await aarsavregningPage.fyllUtSkatteforholdTomDato(0, lagDato("31.12"));
      await aarsavregningPage.velgSkatteplikttype(0, "Nei");

      // Legg til inntektsperiode
      await aarsavregningPage.klikkLeggTilInntekt();

      // Fyll ut inntektsperiode innenfor medlemskapsperioden
      await aarsavregningPage.fyllUtInntektsperiodeFomDato(0, lagDato("01.01"));
      await aarsavregningPage.fyllUtInntektsperiodeTomDato(0, lagDato("31.03"));
      await aarsavregningPage.velgKildetype(0, "Arbeidsinntekt");
      await aarsavregningPage.fyllUtBruttoInntekt(0, "500000");

      // Verifiser at det ikke er valideringsfeil om "utenfor medlemskapsperioden"
      await aarsavregningPage.verifiserIngenFeilmelding("utenfor medlemskapsperioden");

      await runAxeAnalyze(page, testInfo.title);
    });

    test("Kan utvide inntektsperiode innenfor medlemskapsperiode", async ({ page, apiRecorder }, testInfo) => {
      test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
      await setupAarsavregningTest(page, "MEL-1046");
      // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");

      // Vent på at "Legg til periode"-knappen blir synlig
      await page.locator('button:has-text("Legg til periode")').waitFor({ state: "visible" });

      // Først, legg til medlemskapsperiode
      const antallMedlemskapFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();

      const nyMedlemIndex = antallMedlemskapFør;
      await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(nyMedlemIndex, lagDato("01.01"));
      await aarsavregningPage.fyllUtMedlemskapsperiodeTomDato(nyMedlemIndex, lagDato("31.12"));
      await aarsavregningPage.velgTrygdedekning(nyMedlemIndex, "Helse- og pensjonsdel (§ 2-9)");

      // Fyll ut skatteforholdsperiode og sett skatteplikttype til "Nei"
      await aarsavregningPage.fyllUtSkatteforholdFomDato(0, lagDato("01.01"));
      await aarsavregningPage.fyllUtSkatteforholdTomDato(0, lagDato("31.12"));
      await aarsavregningPage.velgSkatteplikttype(0, "Nei");

      // Legg til inntektsperiode
      await aarsavregningPage.klikkLeggTilInntekt();
      await aarsavregningPage.fyllUtInntektsperiodeFomDato(0, lagDato("01.01"));
      await aarsavregningPage.fyllUtInntektsperiodeTomDato(0, lagDato("31.03"));
      await aarsavregningPage.velgKildetype(0, "Arbeidsinntekt");
      await aarsavregningPage.fyllUtBruttoInntekt(0, "500000");

      // Utvid perioden
      await aarsavregningPage.fyllUtInntektsperiodeTomDato(0, lagDato("30.09"));

      // Verifiser at det ikke er valideringsfeil
      await aarsavregningPage.verifiserIngenFeilmelding("utenfor medlemskapsperioden");
      await aarsavregningPage.verifiserIngenFeilmelding("ugyldig");

      await runAxeAnalyze(page, testInfo.title);
    });

    test("Kan legge til flere inntektsperioder innenfor samme år", async ({ page, apiRecorder }, testInfo) => {
      test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
      await setupAarsavregningTest(page, "MEL-1047");
      // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");

      // Vent på at "Legg til periode"-knappen blir synlig
      await page.locator('button:has-text("Legg til periode")').waitFor({ state: "visible" });

      // Legg til medlemskapsperiode som dekker hele året
      const antallMedlemskapFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();

      const nyMedlemIndex = antallMedlemskapFør;
      await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(nyMedlemIndex, lagDato("01.01"));
      await aarsavregningPage.fyllUtMedlemskapsperiodeTomDato(nyMedlemIndex, lagDato("31.12"));
      await aarsavregningPage.velgTrygdedekning(nyMedlemIndex, "Helse- og pensjonsdel (§ 2-9)");

      // Fyll ut skatteforholdsperiode og sett skatteplikttype til "Nei"
      await aarsavregningPage.fyllUtSkatteforholdFomDato(0, lagDato("01.01"));
      await aarsavregningPage.fyllUtSkatteforholdTomDato(0, lagDato("31.12"));
      await aarsavregningPage.velgSkatteplikttype(0, "Nei");

      // Legg til første inntektsperiode
      await aarsavregningPage.klikkLeggTilInntekt();
      await aarsavregningPage.fyllUtInntektsperiodeFomDato(0, lagDato("01.01"));
      await aarsavregningPage.fyllUtInntektsperiodeTomDato(0, lagDato("30.06"));
      await aarsavregningPage.velgKildetype(0, "Arbeidsinntekt");
      await aarsavregningPage.fyllUtBruttoInntekt(0, "300000");

      // Legg til andre inntektsperiode
      await aarsavregningPage.klikkLeggTilInntekt();
      await aarsavregningPage.fyllUtInntektsperiodeFomDato(1, lagDato("01.07"));
      await aarsavregningPage.fyllUtInntektsperiodeTomDato(1, lagDato("31.12"));
      await aarsavregningPage.velgKildetype(1, "Arbeidsinntekt");
      await aarsavregningPage.fyllUtBruttoInntekt(1, "400000");

      // Verifiser at ingen valideringsfeil
      await aarsavregningPage.verifiserIngenFeilmelding("utenfor medlemskapsperioden");
      await aarsavregningPage.verifiserIngenFeilmelding("overlapper");

      await runAxeAnalyze(page, testInfo.title);
    });
  });
});
