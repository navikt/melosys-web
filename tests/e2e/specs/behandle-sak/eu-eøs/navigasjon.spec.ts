import { test } from "../../../recording/fixtures";
import { getTestMode } from "../../../config/mode";
import { TIMEOUT_FOR_COMPLEX_TESTS, setDatoFelt } from "../../../utils/testUtils";
import { hentPrepopulertSakUrl } from "../../../utils/testdataUtils";
import { runAxeAnalyze } from "../../../utils/axeUtils";
import { StegvelgerPage } from "../../../pages/behandling/stegvelger.page";

/**
 * E2E-tester for Stegvelger i EU/EØS IKKE_YRKESAKTIV saksbehandling
 *
 * For IKKE_YRKESAKTIV vises et skjema i Inngang-steget med:
 * - Fra og med (fom) - påkrevd
 * - Til og med (tom) - valgfri
 * - Land - påkrevd
 *
 * "Bekreft og fortsett" er deaktivert inntil skjemaet er gyldig utfylt.
 */
test.describe("EU/EØS Stegvelger - Navigasjon", () => {
  test("EU/EØS Ikke yrkesaktiv - Navigasjon gjennom steg med minimum input", async ({
    page,
    apiRecorder,
  }, testInfo) => {
    // Skip in playback mode: The test expects "Bekreft og fortsett" button to be disabled initially,
    // but mock server returns pre-filled form data causing the button to be enabled.
    // This is a state mismatch issue where the recording captures data from a different test execution order.
    test.skip(
      getTestMode() === "playback",
      "Form state mismatch in playback - button enabled state differs from recording",
    );
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
    const saksnummer = "MEL-1052";
    const stegvelgerPage = new StegvelgerPage(page, saksnummer);

    const url = hentPrepopulertSakUrl(saksnummer);
    await stegvelgerPage.goto(url);

    // === STEG 1: Inngang ===
    await stegvelgerPage.verifiserSteg("Oppgi opplysninger fra søknaden");
    await stegvelgerPage.verifiserBekreftKnappDeaktivert();

    // Fyll ut minimum: fom-dato og land
    await stegvelgerPage.fyllUtEosIkkeYrkesaktivInngang("01.01.2024", "Sverige");
    await stegvelgerPage.verifiserBekreftKnappAktivert();
    await stegvelgerPage.bekreftOgFortsett();

    // === STEG 2: Neste steg ===
    // Verifiser at vi har navigert videre (ikke lenger på Inngang)
    await stegvelgerPage.verifiserSteg("Bestemmelse og vurdering");

    await runAxeAnalyze(page, testInfo.title);
  });

  test("EU/EØS Ikke yrkesaktiv - Navigasjon frem og tilbake", async ({ page, apiRecorder }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
    const saksnummer = "MEL-1052";
    const stegvelgerPage = new StegvelgerPage(page, saksnummer);

    const url = hentPrepopulertSakUrl(saksnummer);
    await stegvelgerPage.goto(url);

    // Start på Inngang
    await stegvelgerPage.verifiserSteg("Oppgi opplysninger fra søknaden");

    // Fyll ut og gå videre
    await stegvelgerPage.fyllUtEosIkkeYrkesaktivInngang("01.01.2024", "Sverige");
    await stegvelgerPage.bekreftOgFortsett();

    // Hent tittel på neste steg
    const andreStegTittel = await stegvelgerPage.hentStegTittel();

    // Gå tilbake til Inngang via Tilbake-knapp
    await stegvelgerPage.gåTilbake();
    await stegvelgerPage.verifiserSteg("Oppgi opplysninger fra søknaden");

    // Gå frem igjen via Bekreft-knapp
    await stegvelgerPage.bekreftOgFortsett();
    await stegvelgerPage.verifiserSteg(andreStegTittel);

    // Gå tilbake via klikk på steg 1 i progressbar
    await stegvelgerPage.klikkPåSteg(1);
    await stegvelgerPage.verifiserSteg("Oppgi opplysninger fra søknaden");

    await runAxeAnalyze(page, testInfo.title);
  });

  test("EU/EØS Ikke yrkesaktiv - Bekreft-knapp forblir deaktivert ved ugyldig input", async ({
    page,
    apiRecorder,
  }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
    const saksnummer = "MEL-1053";
    const stegvelgerPage = new StegvelgerPage(page, saksnummer);

    const url = hentPrepopulertSakUrl(saksnummer);
    await stegvelgerPage.goto(url);

    await stegvelgerPage.verifiserSteg("Oppgi opplysninger fra søknaden");

    // Knappen skal være deaktivert ved start
    await stegvelgerPage.verifiserBekreftKnappDeaktivert();

    // Fyll ut kun dato (uten land) - knappen bør fortsatt være deaktivert
    await setDatoFelt("Fra og med", "01.01.2024", page);
    await page.waitForTimeout(500);

    // Knappen skal fortsatt være deaktivert siden land mangler
    await stegvelgerPage.verifiserBekreftKnappDeaktivert();

    await runAxeAnalyze(page, testInfo.title);
  });
});
