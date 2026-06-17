import { test, expect } from "../../../recording/fixtures";
import { TrygdeavgiftPage } from "../../../pages/behandling/trygdeavgift.page";
import { InngangPage } from "../../../pages/behandling/inngang.page";
import { hentPrepopulertSakUrl, PrepopulertSaksnummer } from "../../../utils/testdataUtils";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../../utils/testUtils";
import { UI_TEXTS } from "../../../config/ui-texts";

/**
 * E2E-tester for TrygdeavgiftsperioderTabell i FTRL-stegvelgeren (MELOSYS-7989)
 *
 * Dekker AC1–AC4 for FTRL YRKESAKTIV:
 * - AC1: Minstebeløp → infomelding
 * - AC2: 25%-regel → * i sats-kolonnen
 * - AC3: Helse/pensjonsdel → Dekning-kolonnen
 * - AC4: Sammenslåtte inntektskilder → ***
 *
 * Strategi:
 * - FTRL MEDLEMSKAP_LOVVALG YRKESAKTIV-saker
 * - Navigerer Inngang → Virksomhet → Bestemmelse → Perioder → Trygdeavgift
 * - Ekte API-kall mot /trygdeavgift/beregning
 *
 * NB: FTRL PENSJONIST mangler prepopulert testdata-sak (alle FTRL-saker er YRKESAKTIV)
 */

/**
 * Navigerer gjennom FTRL-stegvelgeren til Trygdeavgift-steget.
 * Bruker § 2-5 med Full dekning (standard for AC1/AC2/AC4).
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

  // VurderingTrygdeavgift har en useEffect([lovvalgsperiode]) som:
  // 1. Kaller hentBeregnetTrygdeavgift (GET .../trygdeavgift/beregning)
  // 2. Hvis tom: kaller hentOpprinneligTrygdeavgiftsgrunnlag (GET .../trygdeavgift/grunnlag/opprinnelig)
  // Begge kall resetter skatteforholdsperioder via resetSkatteforholdsperioder().
  // Vi MÅ vente til hele kjeden er ferdig før vi klikker radio.
  //
  // Strategi: vent på networkidle to ganger for å fange begge API-kallene.
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await page.waitForLoadState("networkidle");

  return trygdeavgiftPage;
}

test.describe("TrygdeavgiftsperioderTabell - FTRL beregningsresultat", () => {
  test("AC1: minstebeløp → infomelding når inntekten er under minstebeløpet", async ({ page, apiRecorder }) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const trygdeavgiftPage = await navigerFtrlTilTrygdeavgift(page, "MEL-1018");

    await trygdeavgiftPage.velgSkattepliktig(0, false);
    await trygdeavgiftPage.velgInntektskilde("Næringsinntekt");
    await trygdeavgiftPage.fyllInnBruttoinntektOgVentPåBeregning("8000");

    await trygdeavgiftPage.verifiserInfomeldingMinstebeløpSynlig();
    await trygdeavgiftPage.verifiserTrygdeavgiftsTabellIkkeSynlig();
  });

  test("AC2: 25%-regel → asterisk (*) i sats-kolonnen med fotnote", async ({ page, apiRecorder }) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const trygdeavgiftPage = await navigerFtrlTilTrygdeavgift(page, "MEL-1020");

    await trygdeavgiftPage.velgSkattepliktig(0, false);
    await trygdeavgiftPage.velgInntektskilde("Næringsinntekt");
    await trygdeavgiftPage.fyllInnBruttoinntektOgVentPåBeregning("9000");

    await trygdeavgiftPage.verifiser25ProsentRegel();
    await trygdeavgiftPage.verifiserInfomeldingMinstebeløpIkkeSynlig();
  });

  test("AC3: helse/pensjonsdel → Dekning-kolonnen viser Helsedel og Pensjonsdel", async ({ page, apiRecorder }) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const trygdeavgiftPage = await navigerFtrlTilTrygdeavgift(page, "MEL-1022", {
      bestemmelse: "§ 2-8",
      trygdedekning: "Helse- og pensjonsdel (§ 2-9)",
    });

    await trygdeavgiftPage.velgSkattepliktig(0, false);
    await trygdeavgiftPage.velgInntektskilde("Næringsinntekt fra Norge");
    await trygdeavgiftPage.fyllInnBruttoinntektOgVentPåBeregning("20000");

    await trygdeavgiftPage.verifiserHelsePensjonsdel();
  });

  test("AC4: sammenslåtte inntektskilder → *** i inntektskilde-kolonnen med fotnote", async ({ page, apiRecorder }) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const trygdeavgiftPage = await navigerFtrlTilTrygdeavgift(page, "MEL-1013");

    await trygdeavgiftPage.velgSkattepliktig(0, false);
    await trygdeavgiftPage.velgInntektskilde("Næringsinntekt");
    await trygdeavgiftPage.fyllInnBruttoinntektOgVentPåBeregning("5000");

    await trygdeavgiftPage.leggTilInntekt();
    await trygdeavgiftPage.velgInntektskildeNr(1, "Arbeidsinntekt");
    await trygdeavgiftPage.fyllInnBruttoinntektNrOgVentPåBeregning(1, "5000");

    await trygdeavgiftPage.verifiserSammenslåtteInntektskilder();
  });
});
