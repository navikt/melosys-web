import { test } from "../../../recording/fixtures";
import { TIMEOUT_FOR_COMPLEX_TESTS, setDatoFelt } from "../../../utils/testUtils";
import { hentPrepopulertSakUrl } from "../../../utils/testdataUtils";
import { runAxeAnalyze } from "../../../utils/axeUtils";
import { StegvelgerPage } from "../../../pages/behandling/stegvelger.page";

/**
 * E2E-tester for EnkelStegvelger i FTRL (Utenfor avtaleland) saksbehandling
 *
 * Disse testene verifiserer stegnavigasjon for FTRL-saker som bruker
 * enkelStegvelgeren (src/felleskomponenter/enkelStegvelger/enkelStegvelger.tsx).
 *
 * FTRL-steg (rekkefølge):
 * 1. Inngang - Fra og med dato, arbeidsland
 * 2. Virksomhet - Velg virksomhet
 * 3. Bestemmelse - Velg lovvalgsbestemmelse
 * 4. Perioder - Trygdedekning og innvilgelsesresultat
 * 5. Trygdeavgift - Avgiftsberegning
 * 6. Vedtak - Avslutt behandling
 */
test.describe("FTRL Stegvelger - Navigasjon", () => {
  test("Navigasjon gjennom alle steg med minimum input", async ({ page, apiRecorder }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
    // Bruker MEL-1021 for å unngå konflikt med avslutt-ftrl-behandling.spec.ts som bruker MEL-1016
    const saksnummer = "MEL-1021";
    const stegvelgerPage = new StegvelgerPage(page, saksnummer);

    // Hent URL til prepopulert FTRL-sak og naviger direkte dit
    const url = hentPrepopulertSakUrl(saksnummer);
    await stegvelgerPage.goto(url);

    // === STEG 1: Inngang ("Oppgi opplysninger fra søknaden") ===
    // Note: FTRL shows all 6 steps in progressbar from the start
    await stegvelgerPage.verifiserSteg(/oppgi opplysninger|søknaden/i);
    await stegvelgerPage.verifiserBekreftKnappDeaktivert();
    await stegvelgerPage.fyllUtInngangMinimum("01.01.2024", "Sverige");
    await stegvelgerPage.verifiserBekreftKnappAktivert();
    await stegvelgerPage.bekreftOgFortsett();

    // === STEG 2: Virksomhet ===
    await stegvelgerPage.verifiserSteg(/virksomhet/i);
    await stegvelgerPage.verifiserBekreftKnappDeaktivert();
    await stegvelgerPage.velgFørsteVirksomhet();
    await stegvelgerPage.verifiserBekreftKnappAktivert();
    await stegvelgerPage.bekreftOgFortsett();

    // === STEG 3: Bestemmelse ===
    await stegvelgerPage.verifiserSteg(/bestemmelse/i);
    // Bestemmelse kan være forhåndsutfylt, sjekk om knapp allerede er aktivert
    const bestemmelseAktiv = await page
      .locator(".stegFane--aktiv button.stegKnapper__bekreft")
      .isEnabled()
      .catch(() => false);
    if (!bestemmelseAktiv) {
      await stegvelgerPage.velgBestemmelse("§ 2-5");
    }
    await stegvelgerPage.verifiserBekreftKnappAktivert();
    await stegvelgerPage.bekreftOgFortsett();

    // === STEG 4: Perioder ===
    await stegvelgerPage.verifiserSteg(/periode/i);
    // Perioder kan være forhåndsutfylt
    const perioderAktiv = await page
      .locator(".stegFane--aktiv button.stegKnapper__bekreft")
      .isEnabled()
      .catch(() => false);
    if (!perioderAktiv) {
      await stegvelgerPage.fyllUtPerioderMinimum();
    }
    await stegvelgerPage.verifiserBekreftKnappAktivert();
    await stegvelgerPage.bekreftOgFortsett();

    // === STEG 5: Trygdeavgift ===
    await stegvelgerPage.verifiserSteg(/trygdeavgift/i);
    await stegvelgerPage.verifiserBekreftKnappAktivert();
    await stegvelgerPage.bekreftOgFortsett();

    // === STEG 6: Vedtak ("Pliktig medlemskap etter folketrygdloven") ===
    await stegvelgerPage.verifiserSteg(/pliktig medlemskap|vedtak/i);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Navigasjon frem og tilbake mellom steg", async ({ page, apiRecorder }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
    const saksnummer = "MEL-1017";
    const stegvelgerPage = new StegvelgerPage(page, saksnummer);

    const url = hentPrepopulertSakUrl(saksnummer);
    await stegvelgerPage.goto(url);

    // Start på Inngang
    // Note: FTRL shows all 6 steps in progressbar from the start
    await stegvelgerPage.verifiserSteg(/oppgi opplysninger|søknaden/i);

    // Fyll ut og gå til Virksomhet
    await stegvelgerPage.fyllUtInngangMinimum("01.01.2024", "Sverige");
    await stegvelgerPage.bekreftOgFortsett();
    await stegvelgerPage.verifiserSteg(/virksomhet/i);

    // Gå tilbake til Inngang via Tilbake-knapp
    await stegvelgerPage.gåTilbake();
    await stegvelgerPage.verifiserSteg(/oppgi opplysninger|søknaden/i);

    // Gå frem igjen via Bekreft-knapp
    await stegvelgerPage.bekreftOgFortsett();
    await stegvelgerPage.verifiserSteg(/virksomhet/i);

    // Gå tilbake via klikk på steg 1 i progressbar
    await stegvelgerPage.klikkPåSteg(1);
    await stegvelgerPage.verifiserSteg(/oppgi opplysninger|søknaden/i);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Bekreft-knapp forblir deaktivert ved ugyldig input", async ({ page, apiRecorder }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
    const saksnummer = "MEL-1019";
    const stegvelgerPage = new StegvelgerPage(page, saksnummer);

    const url = hentPrepopulertSakUrl(saksnummer);
    await stegvelgerPage.goto(url);

    await stegvelgerPage.verifiserSteg(/oppgi opplysninger|søknaden/i);

    // Knappen skal være deaktivert ved start
    await stegvelgerPage.verifiserBekreftKnappDeaktivert();

    // Fyll ut kun dato (uten arbeidsland) - knappen bør fortsatt være deaktivert

    await setDatoFelt("Fra og med", "01.01.2024", page);
    await page.waitForTimeout(500);

    // Knappen skal fortsatt være deaktivert siden arbeidsland mangler
    await stegvelgerPage.verifiserBekreftKnappDeaktivert();

    await runAxeAnalyze(page, testInfo.title);
  });
});
