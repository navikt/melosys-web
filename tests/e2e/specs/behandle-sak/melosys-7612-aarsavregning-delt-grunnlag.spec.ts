import { test, Page, expect } from "@playwright/test";
import { HovedsidePage, USER_ID_VALID } from "../../pages/hovedside.page";
import { SokPage } from "../../pages/sok.page";
import { BehandlingPage } from "../../pages/behandling/behandling.page";
import { AarsavregningPage } from "../../pages/behandling/aarsavregning.page";
import { opprettUtenforAvtalelandSakMedAarsavregning } from "../../utils/testdataUtils";

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
 * Gjenbrukbar setup-funksjon som navigerer til en årsavregning-behandling
 */
async function setupAarsavregningTest(page: Page) {
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
    await page.waitForTimeout(500);
  }

  await aarsavregningPage.verifiserAarsavregningside();

  // Prøv år 2022, 2021, 2020 inntil vi finner ett uten aktiv årsavregning
  const muligeÅr = ["2022", "2021", "2020"];
  let årValgt = false;

  for (const år of muligeÅr) {
    await aarsavregningPage.velgÅr(år);
    await page.waitForTimeout(500);

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

// Wrap alt i en serial describe for å sikre at setup kjører først
test.describe.serial("MELOSYS-7612: Årsavregning delt grunnlag - Alle tester", () => {
  // Setup: Opprett testdata først
  test.describe("Setup testdata", () => {
    test("Opprett Utenfor avtaleland-sak med Årsavregning", async ({ page }) => {
      test.setTimeout(60000); // Sett timeout til 60 sekunder for setup
      await opprettUtenforAvtalelandSakMedAarsavregning(page);
    });
  });

  test.describe("AC1 - Medlemskapsperiode validering", () => {
    test.beforeEach(async ({ page }) => {
      await setupAarsavregningTest(page);
    });

    test("Kan legge til ny medlemskapsperiode etter å ha valgt delt grunnlag", async () => {
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
      await aarsavregningPage.assertIngenFeilmelding("utenfor");
      await aarsavregningPage.assertIngenFeilmelding("overlapper");
    });

    test("Datepicker skal fungere for fra-dato på ny medlemskapsperiode", async ({ page }) => {
      // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");

      // Vent på at UI oppdaterer seg
      await page.waitForTimeout(1000);

      const antallFør = await aarsavregningPage.getAntallMedlemskapsperioder();

      // Legg til ny medlemskapsperiode
      await aarsavregningPage.leggTilMedlemskapsperiode();

      const nyPeriodeIndex = antallFør; // Den nye perioden er på index = antall før

      // Klikk på fra-dato datepicker
      await aarsavregningPage.klikkMedlemskapsperiodeFomDatepicker(nyPeriodeIndex);

      // Verifiser at datepicker åpnes
      await aarsavregningPage.assertDatepickerErAktiv();

      // Prøv å velge en dato i datepickeren (f.eks. 15. i gjeldende måned)
      const testDato = new Date(parseInt(valgtTestÅr), 0, 15); // 15. januar
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
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");

      // Vent på at UI oppdaterer seg
      await page.waitForTimeout(1000);

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
      await aarsavregningPage.assertIngenFeilmelding("overlapper");
      await aarsavregningPage.assertIngenFeilmelding("ugyldig");
      await aarsavregningPage.assertIngenFeilmelding("må være etter");
    });
  });

  test.describe("AC2 - Skatteforholdsperiode validering", () => {
    test.beforeEach(async ({ page }) => {
      await setupAarsavregningTest(page);
    });

    test("Kan legge til ny skatteforholdsperiode etter å ha valgt delt grunnlag", async ({ page }) => {
      // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");

      // Vent på at UI oppdaterer seg
      await page.waitForTimeout(1000);

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
      await aarsavregningPage.assertIngenFeilmelding("utenfor medlemskapsperioden");
    });

    test("Kan utvide skatteforholdsperiode innenfor medlemskapsperiode", async ({ page }) => {
      // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");

      // Vent på at UI oppdaterer seg
      await page.waitForTimeout(1000);

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
      await aarsavregningPage.assertIngenFeilmelding("utenfor medlemskapsperioden");
      await aarsavregningPage.assertIngenFeilmelding("ugyldig");
    });
  });

  test.describe("AC2.5 - Legg til periode med pliktig bestemmelse (bugfix)", () => {
    test.beforeEach(async ({ page }) => {
      await setupAarsavregningTest(page);
    });

    test("skal vise 'Legg til periode'-knappen for delt grunnlag selv med pliktig bestemmelse", async ({ page }) => {
      // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet (delt grunnlag)
      await aarsavregningPage.velgDeltGrunnlagJa();

      // Velg en PLIKTIG bestemmelse - dette er kjernen av bugfixen
      // § 2-7 er en pliktig bestemmelse
      await aarsavregningPage.velgBestemmelse("§ 2-7 første ledd (arbeidstaker)");

      // Vent på at UI oppdaterer seg
      await page.waitForTimeout(1000);

      // Verifiser at "Legg til periode"-knappen er synlig
      // Dette var buggen: Knappen ble skjult for pliktige bestemmelser selv med delt grunnlag
      const leggTilKnapp = page.locator('button:has-text("Legg til periode")');
      await expect(leggTilKnapp).toBeVisible();

      // Verifiser at knappen er klikkbar (ikke disabled)
      await expect(leggTilKnapp).toBeEnabled();
    });

    test("kan legge til ny periode med pliktig bestemmelse og delt grunnlag", async ({ page }) => {
      // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet (delt grunnlag)
      await aarsavregningPage.velgDeltGrunnlagJa();

      // Velg en PLIKTIG bestemmelse
      await aarsavregningPage.velgBestemmelse("§ 2-7 første ledd (arbeidstaker)");

      // Vent på at UI oppdaterer seg
      await page.waitForTimeout(1000);

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
      await aarsavregningPage.velgTrygdedekning(nyPeriodeIndex, "Full dekning (§ 2-7)");

      // Verifiser at det ikke er valideringsfeil
      await aarsavregningPage.assertIngenFeilmelding("utenfor");
      await aarsavregningPage.assertIngenFeilmelding("overlapper");
    });
  });

  test.describe("AC3 - Inntektsperiode validering", () => {
    test.beforeEach(async ({ page }) => {
      await setupAarsavregningTest(page);
    });

    test("Kan legge til ny inntektsperiode etter å ha valgt delt grunnlag", async ({ page }) => {
      // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");

      // Vent på at UI oppdaterer seg
      await page.waitForTimeout(1000);

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
      await aarsavregningPage.assertIngenFeilmelding("utenfor medlemskapsperioden");
    });

    test("Kan utvide inntektsperiode innenfor medlemskapsperiode", async ({ page }) => {
      // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");

      // Vent på at UI oppdaterer seg
      await page.waitForTimeout(1000);

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
      await aarsavregningPage.assertIngenFeilmelding("utenfor medlemskapsperioden");
      await aarsavregningPage.assertIngenFeilmelding("ugyldig");
    });

    test("Kan legge til flere inntektsperioder innenfor samme år", async ({ page }) => {
      // Velg "Ja" på spørsmålet om å legge til trygdeavgift fra Avgiftssystemet
      await aarsavregningPage.velgDeltGrunnlagJa();
      await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");

      // Vent på at UI oppdaterer seg
      await page.waitForTimeout(1000);

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
      await aarsavregningPage.assertIngenFeilmelding("utenfor medlemskapsperioden");
      await aarsavregningPage.assertIngenFeilmelding("overlapper");
    });
  });
});
