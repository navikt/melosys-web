import { test } from "../../../recording/fixtures";
import { TrygdeavgiftPage } from "../../../pages/behandling/trygdeavgift.page";
import { BehandlingPage } from "../../../pages/behandling/behandling.page";
import { InngangPage } from "../../../pages/behandling/inngang.page";
import { hentPrepopulertSakUrl, PrepopulertSaksnummer } from "../../../utils/testdataUtils";

/**
 * E2E-tester for TrygdeavgiftsperioderTabell - beregningsresultat
 *
 * Dekker akseptansekriterier fra todo 82 (MELOSYS-7988):
 * - AC1: Minstebeløp → infomelding
 * - AC2: 25%-regel → * i sats-kolonnen
 * - AC4: Sammenslåtte inntektskilder → *** i inntektskilde-kolonnen
 * (AC3 gjelder frivillig medlemskap, se ftrl/trygdeavgift-beregningsresultat.spec.ts)
 *
 * Strategi:
 * - Separate MEL-saker per test for å unngå parallell-konflikter
 * - Ekte API-kall mot backend (ingen mocking)
 * - Velger IKKE_SKATTEPLIKTIG → fyller inn inntektskilde og bruttoinntekt
 * - Beregningsregel bestemmes av beregnings-tjenesten basert på inntektsbeløp
 */

const inneværendeAar = new Date().getFullYear();

async function navigerTilTrygdeavgiftOgBeregn(
  page: import("@playwright/test").Page,
  saksnummer: PrepopulertSaksnummer,
  bruttoinntekt: string,
): Promise<void> {
  const inngangPage = new InngangPage(page, saksnummer);
  const trygdeavgiftPage = new TrygdeavgiftPage(page, saksnummer);

  await new BehandlingPage(page, saksnummer).goto(
    hentPrepopulertSakUrl(saksnummer),
    "Oppgi opplysninger fra attest / S1",
  );
  await inngangPage.setFraOgMedDato("01.01." + inneværendeAar);
  await inngangPage.setTilOgMedDato("31.12." + inneværendeAar);
  await inngangPage.velgLand("SE");
  await inngangPage.klikkBekreftOgFortsett();
  await trygdeavgiftPage.ventPåSideLastet();

  await trygdeavgiftPage.velgSkattepliktig(0, false);
  await trygdeavgiftPage.velgInntektskilde("Pensjon");
  await trygdeavgiftPage.fyllInnBruttoinntektOgVentPåBeregning(bruttoinntekt);
}

test.describe("TrygdeavgiftsperioderTabell - beregningsresultat", () => {
  test("AC1: minstebeløp → infomelding når inntekten er under minstebeløpet", async ({ page, apiRecorder }) => {
    await navigerTilTrygdeavgiftOgBeregn(page, "MEL-1054", "8000");

    const trygdeavgiftPage = new TrygdeavgiftPage(page, "MEL-1054");
    await trygdeavgiftPage.verifiserInfomeldingMinstebeløpSynlig();
    await trygdeavgiftPage.verifiserTrygdeavgiftsTabellIkkeSynlig();
  });

  test("AC2: 25%-regel → asterisk (*) i sats-kolonnen med fotnote", async ({ page, apiRecorder }) => {
    await navigerTilTrygdeavgiftOgBeregn(page, "MEL-1055", "9000");

    const trygdeavgiftPage = new TrygdeavgiftPage(page, "MEL-1055");
    await trygdeavgiftPage.verifiser25ProsentRegel();
    await trygdeavgiftPage.verifiserInfomeldingMinstebeløpIkkeSynlig();
  });

  test("AC4: sammenslåtte inntektskilder → *** i inntektskilde-kolonnen med fotnote", async ({ page, apiRecorder }) => {
    const saksnummer: PrepopulertSaksnummer = "MEL-1056";
    const inngangPage = new InngangPage(page, saksnummer);
    const trygdeavgiftPage = new TrygdeavgiftPage(page, saksnummer);
    const behandlingPage = new BehandlingPage(page, saksnummer);
    await behandlingPage.goto(hentPrepopulertSakUrl(saksnummer), "Oppgi opplysninger fra attest / S1");
    await inngangPage.setFraOgMedDato("01.01." + inneværendeAar);
    await inngangPage.setTilOgMedDato("31.12." + inneværendeAar);
    await inngangPage.velgLand("SE");
    await inngangPage.klikkBekreftOgFortsett();
    await trygdeavgiftPage.ventPåSideLastet();

    await trygdeavgiftPage.velgSkattepliktig(0, false);

    // Første inntektskilde: Pensjon
    await trygdeavgiftPage.velgInntektskilde("Pensjon");
    await trygdeavgiftPage.fyllInnBruttoinntektOgVentPåBeregning("5000");

    // Andre inntektskilde: Uføretrygd (samlet 2×5000×12=120000 > minstebeløpet → sammenslåing)
    await trygdeavgiftPage.leggTilInntekt();
    await trygdeavgiftPage.velgInntektskildeNr(1, "Uføretrygd");
    await trygdeavgiftPage.fyllInnBruttoinntektNrOgVentPåBeregning(1, "5000");

    await trygdeavgiftPage.verifiserSammenslåtteInntektskilder();
  });

  test("regresjon: ordinær beregning viser ingen spesialmeldinger", async ({ page, apiRecorder }) => {
    const trygdeavgiftPage = new TrygdeavgiftPage(page, "MEL-1072");
    await navigerTilTrygdeavgiftOgBeregn(trygdeavgiftPage.page, "MEL-1072", "200000");
    await trygdeavgiftPage.verifiserTrygdeavgiftsTabellSynlig();
    await trygdeavgiftPage.verifiserInfomeldingMinstebeløpIkkeSynlig();
  });
});
