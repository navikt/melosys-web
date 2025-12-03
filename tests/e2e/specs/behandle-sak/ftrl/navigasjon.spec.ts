import { test } from "../../../recording/fixtures";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../../utils/testUtils";
import { BehandlingPage } from "../../../pages/behandling/behandling.page";
import { hentPrepopulertSakUrl } from "../../../utils/testdataUtils";
import { runAxeAnalyze } from "../../../utils/axeUtils";

/**
 * E2E-tester for EnkelStegvelger i FTRL (Utenfor avtaleland) saksbehandling
 *
 * Disse testene verifiserer stegnavigasjon for FTRL-saker som bruker
 * enkelStegvelgeren (src/felleskomponenter/enkelStegvelger/enkelStegvelger.tsx).
 *
 * EnkelStegvelger brukes i:
 * - FTRL/Utenfor avtaleland saksbehandling
 * - Ikke yrkesaktiv
 * - EU/EØS pensjonist
 * - Årsavregning
 * - Unntaksregistrering
 */
test.describe("FTRL Stegvelger - Navigasjon", () => {
  test("FTRL-behandling åpnes - viser stegvelger", async ({ page, apiRecorder }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const behandlingPage = new BehandlingPage(page);

    // Hent URL til prepopulert FTRL-sak og naviger direkte dit
    const url = hentPrepopulertSakUrl("MEL-1016");
    await behandlingPage.goto(url);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Navigasjon mellom steg - frem og tilbake fungerer", async ({ page, apiRecorder }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const behandlingPage = new BehandlingPage(page);

    // Hent URL til prepopulert FTRL-sak og naviger direkte dit
    const url = hentPrepopulertSakUrl("MEL-1017");
    await behandlingPage.goto(url);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Progressbar - viser alle steg", async ({ page, apiRecorder }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const behandlingPage = new BehandlingPage(page);

    // Hent URL til prepopulert FTRL-sak og naviger direkte dit
    const url = hentPrepopulertSakUrl("MEL-1018");
    await behandlingPage.goto(url);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Progressbar - klikk på steg navigerer til steget", async ({ page, apiRecorder }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const behandlingPage = new BehandlingPage(page);

    // Hent URL til prepopulert FTRL-sak og naviger direkte dit
    const url = hentPrepopulertSakUrl("MEL-1019");
    await behandlingPage.goto(url);

    await runAxeAnalyze(page, testInfo.title);
  });
});
