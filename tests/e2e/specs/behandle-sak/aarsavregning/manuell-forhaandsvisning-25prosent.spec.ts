import { test } from "../../../recording/fixtures";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../../utils/testUtils";
import { BehandlingPage } from "../../../pages/behandling/behandling.page";
import { AarsavregningPage } from "../../../pages/behandling/aarsavregning.page";
import { hentPrepopulertSakUrl, PrepopulertSaksnummer } from "../../../utils/testdataUtils";
import { Page } from "@playwright/test";

/**
 * Setup-tester for MANUELL brev-forhåndsvisning av 7975 aarsavregning_vedtaksbrev
 * (todo 90 / MELOSYS-7531).
 *
 * Disse testene setter opp en årsavregning med trygdeavgiftsperiode-data
 * som dekker scenarioene MINSTEBELØP, 25%-regel pliktig, 25%-regel frivillig
 * og misjonær.
 *
 * Bruk:
 *   pnpm exec playwright test --headed manuell-forhaandsvisning-25prosent
 *
 * Etter testen, åpne saken i din egen browser og naviger til Send brev-panelet
 * for å forhåndsvise 7975 aarsavregning_vedtaksbrev.
 */

interface SetupResult {
  aarsavregningPage: AarsavregningPage;
  valgtTestÅr: string;
  lagDato: (dagMåned: string) => string;
}

async function setupAarsavregning(page: Page, saksnummer: PrepopulertSaksnummer): Promise<SetupResult> {
  const behandlingPage = new BehandlingPage(page, saksnummer);
  const aarsavregningPage = new AarsavregningPage(page, saksnummer);

  // Skru av EØS pensjonist-toggle — kreves for at delt-grunnlag-flyten skal vise
  // "Legg til periode"-knappen som aktivert. Må kalles FØR goto.
  await aarsavregningPage.overstyrFeatureToggles({
    "melosys.arsavregning.eos_pensjonist": false,
  });

  await behandlingPage.goto(hentPrepopulertSakUrl(saksnummer));
  await page.waitForLoadState("domcontentloaded");

  await aarsavregningPage.klikkÅrsavregningFane();
  await aarsavregningPage.verifiserAarsavregningside();

  const valgtTestÅr = await aarsavregningPage.hentFørsteTilgjengeligeÅr();
  await aarsavregningPage.velgÅr(valgtTestÅr);

  const lagDato = (dagMåned: string): string => `${dagMåned}.${valgtTestÅr}`;
  return { aarsavregningPage, valgtTestÅr, lagDato };
}

async function leggTilMedlemskapsperiodeMedDekning(
  aarsavregningPage: AarsavregningPage,
  lagDato: (s: string) => string,
  trygdedekning: string,
): Promise<void> {
  await aarsavregningPage.ventPåLeggTilPeriodeKnapp();
  const antallFør = await aarsavregningPage.hentAntallMedlemskapsperioder();
  await aarsavregningPage.leggTilMedlemskapsperiode();
  const idx = antallFør;
  await aarsavregningPage.fyllUtMedlemskapsperiodeFomDato(idx, lagDato("01.01"));
  await aarsavregningPage.fyllUtMedlemskapsperiodeTomDato(idx, lagDato("31.12"));
  await aarsavregningPage.velgTrygdedekning(idx, trygdedekning);
}

// Skatteforholdsperiode er auto-opprettet — vi fyller bare ut den eksisterende.
// "Nei" er nødvendig fordi velgSkatteplikttype mapper alt med "skattepliktig" til "Ja".
async function fyllUtAutoSkatteforholdSomIkkeSkattepliktig(
  aarsavregningPage: AarsavregningPage,
  lagDato: (s: string) => string,
): Promise<void> {
  await aarsavregningPage.fyllUtSkatteforholdFomDato(0, lagDato("01.01"));
  await aarsavregningPage.fyllUtSkatteforholdTomDato(0, lagDato("31.12"));
  await aarsavregningPage.velgSkatteplikttype(0, "Nei");
}

async function leggTilInntekt(
  aarsavregningPage: AarsavregningPage,
  lagDato: (s: string) => string,
  kildetype: string,
  månedsbeløp: string,
): Promise<void> {
  await aarsavregningPage.klikkLeggTilInntekt();
  await aarsavregningPage.fyllUtInntektsperiodeFomDato(0, lagDato("01.01"));
  await aarsavregningPage.fyllUtInntektsperiodeTomDato(0, lagDato("31.12"));
  await aarsavregningPage.velgKildetype(0, kildetype);
  await aarsavregningPage.fyllUtBruttoInntekt(0, månedsbeløp);
}

function loggKlarSak(page: Page, saksnummer: string, scenario: string): void {
  // eslint-disable-next-line no-console
  console.log(
    `\n[Manuell forhåndsvisning klar] Saksnummer: ${saksnummer} (${scenario})\n` +
      `URL: ${page.url()}\n` +
      `→ Naviger til Send brev-panelet og forhåndsvis 7975 aarsavregning_vedtaksbrev.\n`,
  );
}

test.describe("Manuell brev-forhåndsvisning - Årsavregning 25%-regel (7975)", () => {
  test("Setup: minstebeløp, frivillig medlem på MEL-1028 (5 000 kr/mnd)", async ({ page, apiRecorder }) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const { aarsavregningPage, lagDato } = await setupAarsavregning(page, "MEL-1028");
    await aarsavregningPage.velgDeltGrunnlagJa();
    await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");
    await leggTilMedlemskapsperiodeMedDekning(aarsavregningPage, lagDato, "Helse- og pensjonsdel (§ 2-9)");
    await fyllUtAutoSkatteforholdSomIkkeSkattepliktig(aarsavregningPage, lagDato);
    await leggTilInntekt(aarsavregningPage, lagDato, "Næringsinntekt", "5000");

    loggKlarSak(page, "MEL-1028", "minstebeløp (frivillig)");
  });

  test("Setup: 25%-regel frivillig på MEL-1029 (9 000 kr/mnd)", async ({ page, apiRecorder }) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const { aarsavregningPage, lagDato } = await setupAarsavregning(page, "MEL-1029");
    await aarsavregningPage.velgDeltGrunnlagJa();
    await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");
    await leggTilMedlemskapsperiodeMedDekning(aarsavregningPage, lagDato, "Helse- og pensjonsdel (§ 2-9)");
    await fyllUtAutoSkatteforholdSomIkkeSkattepliktig(aarsavregningPage, lagDato);
    await leggTilInntekt(aarsavregningPage, lagDato, "Næringsinntekt", "9000");

    loggKlarSak(page, "MEL-1029", "25%-regel frivillig");
  });

  test("Setup: 25%-regel pliktig på MEL-1030 (9 000 kr/mnd, § 2-7)", async ({ page, apiRecorder }) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const { aarsavregningPage, lagDato } = await setupAarsavregning(page, "MEL-1030");
    await aarsavregningPage.velgDeltGrunnlagJa();
    await aarsavregningPage.velgBestemmelse("§ 2-7 første ledd (opphold i Norge)");
    await leggTilMedlemskapsperiodeMedDekning(
      aarsavregningPage,
      lagDato,
      "Helsedel med syke- og foreldrepenger (§ 2-7)",
    );
    await fyllUtAutoSkatteforholdSomIkkeSkattepliktig(aarsavregningPage, lagDato);
    await leggTilInntekt(aarsavregningPage, lagDato, "Næringsinntekt", "9000");

    loggKlarSak(page, "MEL-1030", "25%-regel pliktig");
  });

  test("Setup: 25%-regel misjonær på MEL-1031 (9 000 kr/mnd, kildetype må endres manuelt til Misjonær)", async ({
    page,
    apiRecorder,
  }) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    // Misjonær-option mangler i delt-grunnlag-flytens kildetype-dropdown ved testtidspunktet,
    // så vi setter Næringsinntekt som plassholder. Endre til "Misjonær som skal arbeide i utlandet
    // i minst to år" manuelt i UI før du forhåndsviser misjonær-brevet.
    const { aarsavregningPage, lagDato } = await setupAarsavregning(page, "MEL-1031");
    await aarsavregningPage.velgDeltGrunnlagJa();
    await aarsavregningPage.velgBestemmelse("§ 2-8 første ledd bokstav a (arbeidstaker)");
    await leggTilMedlemskapsperiodeMedDekning(aarsavregningPage, lagDato, "Helse- og pensjonsdel (§ 2-9)");
    await fyllUtAutoSkatteforholdSomIkkeSkattepliktig(aarsavregningPage, lagDato);
    await leggTilInntekt(aarsavregningPage, lagDato, "Næringsinntekt", "9000");

    loggKlarSak(page, "MEL-1031", "25%-regel misjonær — endre kildetype til Misjonær manuelt");
  });
});
