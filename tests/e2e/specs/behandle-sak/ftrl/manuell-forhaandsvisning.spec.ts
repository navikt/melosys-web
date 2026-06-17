import { test } from "../../../recording/fixtures";
import { TrygdeavgiftPage } from "../../../pages/behandling/trygdeavgift.page";
import { InngangPage } from "../../../pages/behandling/inngang.page";
import { hentPrepopulertSakUrl, PrepopulertSaksnummer } from "../../../utils/testdataUtils";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../../utils/testUtils";

/**
 * Setup-tester for MANUELL brev-forhåndsvisning av brevmaler 7971-7976 (todo 90 / MELOSYS-7531).
 *
 * Disse testene gjør samme setup som tester i trygdeavgift-beregningsresultat.spec.ts,
 * men er dedikert til å sette opp en sak du deretter kan ta over og manuelt
 * forhåndsvise brev fra Send brev-panelet.
 *
 * Bruk (krever PW_INCLUDE_MANUELL=1 for å overstyre default testIgnore):
 *   PW_INCLUDE_MANUELL=1 pnpm exec playwright test --headed manuell-forhaandsvisning -g "minstebelop"
 *
 * Etter at testen er ferdig, åpne saken i din egen browser-fane (URL logges av testen)
 * og bruk Send brev-panelet til å forhåndsvise brevmalene (Innvilgelse FTRL,
 * Pliktig medlem FTRL, Trygdeavgift informasjonsbrev).
 *
 * Saksnumre er felles med AC-testene i trygdeavgift-beregningsresultat.spec.ts.
 * Filen er derfor ekskludert fra default test:e2e via testIgnore i playwright.config.ts.
 */

async function navigerFtrlTilTrygdeavgift(
  page: import("@playwright/test").Page,
  saksnummer: PrepopulertSaksnummer,
  options: { bestemmelse?: string; trygdedekning?: string } = {},
): Promise<TrygdeavgiftPage> {
  const { bestemmelse = "§ 2-5", trygdedekning } = options;

  const inngangPage = new InngangPage(page, saksnummer);
  await inngangPage.goto(hentPrepopulertSakUrl(saksnummer));

  await inngangPage.verifiserSteg("Oppgi opplysninger fra søknaden");
  await inngangPage.fyllUtInngangMinimum("01.01.2026", "Sverige", "31.12.2026");
  if (trygdedekning) {
    await inngangPage.velgTrygdedekning(trygdedekning);
    await page.waitForTimeout(300);
  }
  await inngangPage.klikkBekreftOgFortsett();

  const trygdeavgiftPage = new TrygdeavgiftPage(page, saksnummer);
  await trygdeavgiftPage.verifiserSteg("Virksomhet");
  await trygdeavgiftPage.velgFørsteVirksomhet();
  await trygdeavgiftPage.klikkBekreftOgFortsett();

  await trygdeavgiftPage.verifiserSteg("Bestemmelse");
  await trygdeavgiftPage.velgBestemmelse(bestemmelse);
  await trygdeavgiftPage.klikkBekreftOgFortsett();

  await trygdeavgiftPage.verifiserSteg("Medlemskapsperioder");
  await trygdeavgiftPage.klikkBekreftOgFortsett();
  await trygdeavgiftPage.ventPåSideLastet();

  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await page.waitForLoadState("networkidle");

  return trygdeavgiftPage;
}

function loggKlarSak(page: import("@playwright/test").Page, saksnummer: string, scenario: string): void {
  // eslint-disable-next-line no-console
  console.log(
    `\n[Manuell forhåndsvisning klar] Saksnummer: ${saksnummer} (${scenario})\n` +
      `URL: ${page.url()}\n` +
      `→ Naviger til Send brev-panelet og forhåndsvis ønsket brevmal.\n`,
  );
}

test.describe("Manuell brev-forhåndsvisning - FTRL pliktig (7972/7973/7975)", () => {
  test("Setup: minstebeløp på MEL-1018 (5 000 kr/mnd → MINSTEBELØP)", async ({ page, apiRecorder }) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const trygdeavgiftPage = await navigerFtrlTilTrygdeavgift(page, "MEL-1018");
    await trygdeavgiftPage.velgSkattepliktig(0, false);
    await trygdeavgiftPage.velgInntektskilde("Næringsinntekt");
    await trygdeavgiftPage.fyllInnBruttoinntektOgVentPåBeregning("5000");

    loggKlarSak(page, "MEL-1018", "minstebeløp");
  });

  test("Setup: 25%-regel på MEL-1020 (9 000 kr/mnd → TJUEFEM_PROSENT_REGEL)", async ({ page, apiRecorder }) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const trygdeavgiftPage = await navigerFtrlTilTrygdeavgift(page, "MEL-1020");
    await trygdeavgiftPage.velgSkattepliktig(0, false);
    await trygdeavgiftPage.velgInntektskilde("Næringsinntekt");
    await trygdeavgiftPage.fyllInnBruttoinntektOgVentPåBeregning("9000");

    loggKlarSak(page, "MEL-1020", "25%-regel");
  });

  test("Setup: helse/pensjonsdel på MEL-1022 (§ 2-8, 20 000 kr/mnd)", async ({ page, apiRecorder }) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const trygdeavgiftPage = await navigerFtrlTilTrygdeavgift(page, "MEL-1022", {
      bestemmelse: "§ 2-8",
      trygdedekning: "Helse- og pensjonsdel (§ 2-9)",
    });
    await trygdeavgiftPage.velgSkattepliktig(0, false);
    await trygdeavgiftPage.velgInntektskilde("Næringsinntekt fra Norge");
    await trygdeavgiftPage.fyllInnBruttoinntektOgVentPåBeregning("20000");

    loggKlarSak(page, "MEL-1022", "helse/pensjonsdel");
  });

  test("Setup: ordinær beregning på MEL-1019 (200 000 kr/mnd, regresjon)", async ({ page, apiRecorder }) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const trygdeavgiftPage = await navigerFtrlTilTrygdeavgift(page, "MEL-1019");
    await trygdeavgiftPage.velgSkattepliktig(0, false);
    await trygdeavgiftPage.velgInntektskilde("Næringsinntekt");
    await trygdeavgiftPage.fyllInnBruttoinntektOgVentPåBeregning("200000");

    loggKlarSak(page, "MEL-1019", "ordinær (regresjon)");
  });
});
