import { test, Page, expect } from "@playwright/test";
import { HovedsidePage, USER_ID_VALID } from "../../pages/hovedside.page";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../utils/testUtils";
import { SokPage } from "../../pages/sok.page";
import { BehandlingPage } from "../../pages/behandling/behandling.page";
import { AarsavregningPage } from "../../pages/behandling/aarsavregning.page";
import { opprettUtenforAvtalelandSakMedAarsavregning } from "../../utils/testdataUtils";
import { runAxeAnalyze } from "../../utils/axeUtils";

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
let valgtTestÅr: string = "2020"; // Default år som sannsynligvis er ledig

/**
 * Hjelpefunksjon for å lage dato med riktig år
 */
function lagDato(dagMåned: string): string {
  return `${dagMåned}.${valgtTestÅr}`;
}

/**
 * Gjenbrukbar setup-funksjon som oppretter testdata og navigerer til en årsavregning-behandling
 */
async function setupAarsavregningTest(page: Page) {
  // Opprett ny sak med årsavregning for hver test
  await opprettUtenforAvtalelandSakMedAarsavregning(page);

  const mainPage = new HovedsidePage(page);
  const sokPage = new SokPage(page);
  const behandlingPage = new BehandlingPage(page);
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
  }

  await aarsavregningPage.verifiserAarsavregningside();

  // Prøv år 2022, 2021, 2020 inntil vi finner ett uten aktiv årsavregning
  const muligeÅr = ["2022", "2021", "2020"];
  let årValgt = false;

  for (const år of muligeÅr) {
    await aarsavregningPage.velgÅr(år);

    // Sjekk om det er feilmelding om aktiv årsavregning
    const aktivFeilmelding = page.locator('[class*="error"], [class*="feil"]').filter({
      hasText: /har allerede en aktiv årsavregning/i,
    });

    if (!(await aktivFeilmelding.isVisible().catch(() => false))) {
      // Ingen feilmelding - dette året er tilgjengelig
      valgtTestÅr = år; // Lagre det valgte året for bruk i testene
      årValgt = true;
      break;
    }
  }

  expect(årValgt, "Kunne ikke finne et tilgjengelig år for årsavregning").toBe(true);
}

// Hver test oppretter sine egne testdata via setupAarsavregningTest
test.describe("Årsavregning delt grunnlag - Alle tester", () => {
  test.describe("AC1 - Medlemskapsperiode validering", () => {
    test.beforeEach(async ({ page }) => {
      test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Sett timeout til 30 sekunder for setup
      await setupAarsavregningTest(page);
    });

    test("Kan legge til ny medlemskapsperiode etter å ha valgt delt grunnlag", async ({ page }, testInfo) => {
      // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
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

    test("Datepicker skal fungere for fra-dato på ny medlemskapsperiode", async ({ page }, testInfo) => {
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

    test("Kan legge til sammenhengende medlemskapsperiode innenfor samme år", async ({ page }, testInfo) => {
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

    test("laasAar: Input '0101' skal bli '01.01.ÅÅÅÅ' etter blur", async ({ page }) => {
      // Dette tester at buggen er fikset: at laasAar legger til riktig år
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");
      await page.waitForTimeout(1000);

      const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();
      const nyPeriodeIndex = antallFør;

      // Skriv kun dag og måned (ddmm-format)
      const resultat = await aarsavregningPage.fyllUtOgBlurMedlemskapsperiodeFomDato(nyPeriodeIndex, "0101");

      // Verifiser at året er lagt til automatisk
      expect(resultat).toBe(lagDato("01.01"));
      expect(resultat).toContain(valgtTestÅr);
    });

    test("laasAar: Input '01.01' skal bli '01.01.ÅÅÅÅ' etter blur", async ({ page }) => {
      // Test med punktum-separatorer
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");
      await page.waitForTimeout(1000);

      const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();
      const nyPeriodeIndex = antallFør;

      const resultat = await aarsavregningPage.fyllUtOgBlurMedlemskapsperiodeFomDato(nyPeriodeIndex, "01.01");

      expect(resultat).toBe(lagDato("01.01"));
      expect(resultat).toContain(valgtTestÅr);
    });

    test("forhindreAutoUtfylling: Ufullstendig input skal ikke auto-fylles til ugyldig dato", async ({ page }) => {
      // Dette tester at buggen er fikset: at "1" ikke blir til "01.01.0001"
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");
      await page.waitForTimeout(1000);

      const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();
      const nyPeriodeIndex = antallFør;

      // Skriv en ufullstendig dato (kun 1 tegn)
      const resultat = await aarsavregningPage.fyllUtOgBlurMedlemskapsperiodeFomDato(nyPeriodeIndex, "1");

      // Verifiser at verdien ikke er endret til en ugyldig dato som "01.01.0001"
      expect(resultat).toBe("1");
      expect(resultat).not.toContain("0001");

      // Verifiser at feilmelding vises (fordi "1" ikke er gyldig dato)
      await aarsavregningPage.assertValideringsfeilInneholder("gyldig");
    });

    test("laasAar: Input med delvis år som '020412' skal bli '02.04.ÅÅÅÅ'", async ({ page }) => {
      // Dette tester at laasAar overstyrer feil år med korrekt årsavregningsår
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");
      await page.waitForTimeout(1000);

      const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();
      const nyPeriodeIndex = antallFør;

      // Skriv ddmmåå format (6 tegn)
      const resultat = await aarsavregningPage.fyllUtOgBlurMedlemskapsperiodeFomDato(nyPeriodeIndex, "020412");

      // Verifiser at året er overstyrt til korrekt årsavregningsår
      expect(resultat).toBe(lagDato("02.04"));
      expect(resultat).toContain(valgtTestÅr);
      expect(resultat).not.toContain("2012");
    });

    test("laasAar: Input med fullt år som '02042025' skal overstyres til '02.04.ÅÅÅÅ'", async ({ page }) => {
      // Dette tester at laasAar overstyrer selv når bruker skriver fullt (men feil) år
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");
      await page.waitForTimeout(1000);

      const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();
      const nyPeriodeIndex = antallFør;

      // Skriv ddmmåååå format (8 tegn) med feil år
      const resultat = await aarsavregningPage.fyllUtOgBlurMedlemskapsperiodeFomDato(nyPeriodeIndex, "02042025");

      // Verifiser at året er overstyrt til korrekt årsavregningsår
      expect(resultat).toBe(lagDato("02.04"));
      expect(resultat).toContain(valgtTestÅr);
      expect(resultat).not.toContain("2025");
    });

    test("laasAar: Input '01011' skal ekspanderes til '01.01.ÅÅÅÅ'", async ({ page }) => {
      // Dette tester at selv 5 tegn ekspanderes hvis de fire første er gyldig ddmm
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");
      await page.waitForTimeout(1000);

      const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();
      const nyPeriodeIndex = antallFør;

      // Skriv ddmmå format (5 tegn) - "1" tolkes som ugyldig år
      const resultat = await aarsavregningPage.fyllUtOgBlurMedlemskapsperiodeFomDato(nyPeriodeIndex, "01011");

      // Verifiser at det ekspanderes til gyldig dato med korrekt år
      expect(resultat).toBe(lagDato("01.01"));
      expect(resultat).toContain(valgtTestÅr);
    });
  });

  test.describe("AC4 - Datovalidering med ugyldig input", () => {
    test.beforeEach(async ({ page }) => {
      await setupAarsavregningTest(page);
    });

    test("Ugyldig input 'dd11ss' skal vise 'Skriv inn en gyldig dato'", async ({ page }) => {
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");
      await page.waitForTimeout(1000);

      const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();
      const nyPeriodeIndex = antallFør;

      await aarsavregningPage.fyllUtOgBlurMedlemskapsperiodeFomDato(nyPeriodeIndex, "dd11ss");

      await aarsavregningPage.assertValideringsfeilInneholder("gyldig dato");
      await aarsavregningPage.assertIngenFeilmelding("utenfor valgt år");
    });

    test("Ugyldig input 'abc123' skal vise 'Skriv inn en gyldig dato'", async ({ page }) => {
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");
      await page.waitForTimeout(1000);

      const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();
      const nyPeriodeIndex = antallFør;

      await aarsavregningPage.fyllUtOgBlurMedlemskapsperiodeFomDato(nyPeriodeIndex, "abc123");

      await aarsavregningPage.assertValideringsfeilInneholder("gyldig dato");
      await aarsavregningPage.assertIngenFeilmelding("utenfor valgt år");
    });

    test("Ugyldig input 'test' skal vise 'Skriv inn en gyldig dato'", async ({ page }) => {
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");
      await page.waitForTimeout(1000);

      const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();
      const nyPeriodeIndex = antallFør;

      await aarsavregningPage.fyllUtOgBlurMedlemskapsperiodeFomDato(nyPeriodeIndex, "test");

      await aarsavregningPage.assertValideringsfeilInneholder("gyldig dato");
      await aarsavregningPage.assertIngenFeilmelding("utenfor valgt år");
    });

    test("Ugyldig input 'xx.yy.zzzz' skal vise 'Skriv inn en gyldig dato'", async ({ page }) => {
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");
      await page.waitForTimeout(1000);

      const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();
      const nyPeriodeIndex = antallFør;

      await aarsavregningPage.fyllUtOgBlurMedlemskapsperiodeFomDato(nyPeriodeIndex, "xx.yy.zzzz");

      await aarsavregningPage.assertValideringsfeilInneholder("gyldig dato");
      await aarsavregningPage.assertIngenFeilmelding("utenfor valgt år");
    });

    test("Ugyldig input '99.99.9999' skal vise 'Skriv inn en gyldig dato'", async ({ page }) => {
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");
      await page.waitForTimeout(1000);

      const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();
      const nyPeriodeIndex = antallFør;

      await aarsavregningPage.fyllUtOgBlurMedlemskapsperiodeFomDato(nyPeriodeIndex, "99.99.9999");

      await aarsavregningPage.assertValideringsfeilInneholder("gyldig dato");
      await aarsavregningPage.assertIngenFeilmelding("utenfor valgt år");
    });

    test("Ugyldig input '32.01.2024' skal vise 'Skriv inn en gyldig dato'", async ({ page }) => {
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");
      await page.waitForTimeout(1000);

      const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();
      const nyPeriodeIndex = antallFør;

      await aarsavregningPage.fyllUtOgBlurMedlemskapsperiodeFomDato(nyPeriodeIndex, "32.01.2024");

      await aarsavregningPage.assertValideringsfeilInneholder("gyldig dato");
      await aarsavregningPage.assertIngenFeilmelding("utenfor valgt år");
    });

    test("Gyldig dato utenfor år skal vise 'Utenfor valgt år'", async ({ page }) => {
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");
      await page.waitForTimeout(1000);

      const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();
      const nyPeriodeIndex = antallFør;

      const feilÅr = parseInt(valgtTestÅr) + 1;
      await aarsavregningPage.fyllUtOgBlurMedlemskapsperiodeFomDato(nyPeriodeIndex, `01.01.${feilÅr}`);

      await aarsavregningPage.assertValideringsfeilInneholder("utenfor valgt år");
      await aarsavregningPage.assertIngenFeilmelding("gyldig dato");
    });

    test("Tom-dato: Ugyldig input 'dd11ss' skal vise 'Skriv inn en gyldig dato'", async ({ page }) => {
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");
      await page.waitForTimeout(1000);

      const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();
      const nyPeriodeIndex = antallFør;

      await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(nyPeriodeIndex, lagDato("01.01"));
      await aarsavregningPage.fyllUtOgBlurMedlemskapsperiodeTomDato(nyPeriodeIndex, "dd11ss");

      await aarsavregningPage.assertValideringsfeilInneholder("gyldig dato");
      await aarsavregningPage.assertIngenFeilmelding("utenfor valgt år");
    });

    test("Skatteforholdsperiode: Ugyldig input 'dd11ss' skal vise 'Skriv inn en gyldig dato'", async ({ page }) => {
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");
      await page.waitForTimeout(1000);

      const antallMedlemskapFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();
      const nyMedlemIndex = antallMedlemskapFør;
      await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(nyMedlemIndex, lagDato("01.01"));
      await aarsavregningPage.fyllUtMedlemskapsperiodeTomDato(nyMedlemIndex, lagDato("31.12"));
      await aarsavregningPage.velgTrygdedekning(nyMedlemIndex, "Helse- og pensjonsdel (§ 2-9)");

      await aarsavregningPage.leggTilSkatteforholdsperiode();
      await aarsavregningPage.fyllUtOgBlurSkatteforholdFomDato(0, "dd11ss");

      await aarsavregningPage.assertValideringsfeilInneholder("gyldig dato");
      await aarsavregningPage.assertIngenFeilmelding("utenfor valgt år");
    });
  });

  test.describe("AC2 - Skatteforholdsperiode validering", () => {
    test.beforeEach(async ({ page }) => {
      test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
      await setupAarsavregningTest(page);
    });

    test("Kan legge til ny skatteforholdsperiode etter å ha valgt delt grunnlag", async ({ page }, testInfo) => {
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
      await aarsavregningPage.leggTilSkatteforholdsperiode();

      // Fyll ut skatteforholdsperiode innenfor medlemskapsperioden
      await aarsavregningPage.fyllUtSkatteforholdFomDato(0, lagDato("01.01"));
      await aarsavregningPage.fyllUtSkatteforholdTomDato(0, lagDato("30.06"));
      await aarsavregningPage.velgSkatteplikttype(0, "Allmennpliktig");

      // Verifiser at det ikke er valideringsfeil om "utenfor medlemskapsperioden"
      await aarsavregningPage.verifiserIngenFeilmelding("utenfor medlemskapsperioden");

      await runAxeAnalyze(page, testInfo.title);
    });

    test("Kan utvide skatteforholdsperiode innenfor medlemskapsperiode", async ({ page }, testInfo) => {
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
      await aarsavregningPage.leggTilSkatteforholdsperiode();
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

  test.describe("AC2.5 - Legg til periode med pliktig bestemmelse (bugfix)", () => {
    test.beforeEach(async ({ page }) => {
      test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
      await setupAarsavregningTest(page);
    });

    test("skal vise 'Legg til periode'-knappen for delt grunnlag selv med pliktig bestemmelse", async ({
      page,
    }, testInfo) => {
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

    test("kan legge til ny periode med pliktig bestemmelse og delt grunnlag", async ({ page }, testInfo) => {
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

  test.describe("AC3 - Inntektsperiode validering", () => {
    test.beforeEach(async ({ page }) => {
      test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
      await setupAarsavregningTest(page);
    });

    test("Kan legge til ny inntektsperiode etter å ha valgt delt grunnlag", async ({ page }, testInfo) => {
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
      await aarsavregningPage.leggTilInntektsperiode();

      // Fyll ut inntektsperiode innenfor medlemskapsperioden
      await aarsavregningPage.fyllUtInntektsperiodeFomDato(0, lagDato("01.01"));
      await aarsavregningPage.fyllUtInntektsperiodeTomDato(0, lagDato("31.03"));
      await aarsavregningPage.velgKildetype(0, "Arbeidsinntekt");
      await aarsavregningPage.fyllUtBruttoInntekt(0, "500000");

      // Verifiser at det ikke er valideringsfeil om "utenfor medlemskapsperioden"
      await aarsavregningPage.verifiserIngenFeilmelding("utenfor medlemskapsperioden");

      await runAxeAnalyze(page, testInfo.title);
    });

    test("Kan utvide inntektsperiode innenfor medlemskapsperiode", async ({ page }, testInfo) => {
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
      await aarsavregningPage.leggTilInntektsperiode();
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

    test("Kan legge til flere inntektsperioder innenfor samme år", async ({ page }, testInfo) => {
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
      await aarsavregningPage.leggTilInntektsperiode();
      await aarsavregningPage.fyllUtInntektsperiodeFomDato(0, lagDato("01.01"));
      await aarsavregningPage.fyllUtInntektsperiodeTomDato(0, lagDato("30.06"));
      await aarsavregningPage.velgKildetype(0, "Arbeidsinntekt");
      await aarsavregningPage.fyllUtBruttoInntekt(0, "300000");

      // Legg til andre inntektsperiode
      await aarsavregningPage.leggTilInntektsperiode();
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

  test.describe("AC5 - Skatteforhold skal ikke auto-fylles med ugyldige datoer fra medlemskapsperiode", () => {
    test.beforeEach(async ({ page }) => {
      await setupAarsavregningTest(page);
    });

    test("Skatteforhold forblir tomme når medlemskapsperiode har ugyldig kort input som '0101' og '01'", async ({
      page,
    }) => {
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");

      await page.waitForTimeout(1000);

      const antallMedlemskapFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();

      const nyMedlemIndex = antallMedlemskapFør;

      const medlemFomInput = page
        .locator(".perioder")
        .filter({ hasText: "Medlemskapsperiode" })
        .locator('input[type="text"]')
        .nth(nyMedlemIndex * 3);
      await medlemFomInput.fill("0101");
      await medlemFomInput.blur();

      const medlemTomInput = page
        .locator(".perioder")
        .filter({ hasText: "Medlemskapsperiode" })
        .locator('input[type="text"]')
        .nth(nyMedlemIndex * 3 + 1);
      await medlemTomInput.fill("01");
      await medlemTomInput.blur();

      await page.waitForTimeout(500);

      const skattFomInput = page
        .locator(".perioder")
        .filter({ hasText: "Skatteforhold" })
        .locator('input[type="text"]')
        .first();
      const skattTomInput = page
        .locator(".perioder")
        .filter({ hasText: "Skatteforhold" })
        .locator('input[type="text"]')
        .nth(1);

      const skattFomValue = await skattFomInput.inputValue();
      const skattTomValue = await skattTomInput.inputValue();

      expect(skattFomValue, "Skatteforhold fomDato skal være tom når medlemskapsperiode har ugyldig input").toBe("");
      expect(skattTomValue, "Skatteforhold tomDato skal være tom når medlemskapsperiode har ugyldig input").toBe("");
    });

    test("Skatteforhold forblir tomme når medlemskapsperiode har datoer utenfor valgt år", async ({ page }) => {
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");

      await page.waitForTimeout(1000);

      const antallMedlemskapFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();

      const nyMedlemIndex = antallMedlemskapFør;
      await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(nyMedlemIndex, "01.01.2019");
      await aarsavregningPage.fyllUtMedlemskapsperiodeTomDato(nyMedlemIndex, "31.12.2019");

      await page.waitForTimeout(500);

      const skattFomInput = page
        .locator(".perioder")
        .filter({ hasText: "Skatteforhold" })
        .locator('input[type="text"]')
        .first();
      const skattTomInput = page
        .locator(".perioder")
        .filter({ hasText: "Skatteforhold" })
        .locator('input[type="text"]')
        .nth(1);

      const skattFomValue = await skattFomInput.inputValue();
      const skattTomValue = await skattTomInput.inputValue();

      expect(skattFomValue, "Skatteforhold fomDato skal være tom når medlemskapsperiode er utenfor valgt år").toBe("");
      expect(skattTomValue, "Skatteforhold tomDato skal være tom når medlemskapsperiode er utenfor valgt år").toBe("");
    });

    test("Skatteforhold fylles korrekt når medlemskapsperiode har gyldige datoer innenfor valgt år", async ({
      page,
    }) => {
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");

      await page.waitForTimeout(1000);

      const antallMedlemskapFør = await aarsavregningPage.getAntallMedlemskapsperioder();
      await aarsavregningPage.leggTilMedlemskapsperiode();

      const nyMedlemIndex = antallMedlemskapFør;
      await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(nyMedlemIndex, lagDato("01.01"));
      await aarsavregningPage.fyllUtMedlemskapsperiodeTomDato(nyMedlemIndex, lagDato("31.12"));

      await page.waitForTimeout(500);

      const skattFomInput = page
        .locator(".perioder")
        .filter({ hasText: "Skatteforhold" })
        .locator('input[type="text"]')
        .first();
      const skattTomInput = page
        .locator(".perioder")
        .filter({ hasText: "Skatteforhold" })
        .locator('input[type="text"]')
        .nth(1);

      const skattFomValue = await skattFomInput.inputValue();
      const skattTomValue = await skattTomInput.inputValue();

      expect(skattFomValue, "Skatteforhold fomDato skal fylles med gyldig dato").toBe(lagDato("01.01"));
      expect(skattTomValue, "Skatteforhold tomDato skal fylles med gyldig dato").toBe(lagDato("31.12"));
    });
  });
});
