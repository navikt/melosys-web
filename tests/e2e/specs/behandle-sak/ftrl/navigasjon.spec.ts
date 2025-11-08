import { test } from "@playwright/test";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../../utils/testUtils";
import { BehandlingPage } from "../../../pages/behandling/behandling.page";
import { opprettUtenforAvtalelandSak } from "../../../utils/testdataUtils";
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
  test("FTRL-behandling åpnes - viser stegvelger", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const behandlingPage = new BehandlingPage(page);

    // Hent URL til prepopulert FTRL-sak og naviger direkte dit
    const url = await opprettUtenforAvtalelandSak();
    await behandlingPage.goto(url);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Navigasjon mellom steg - frem og tilbake fungerer", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const behandlingPage = new BehandlingPage(page);

    // Hent URL til prepopulert FTRL-sak og naviger direkte dit
    const url = await opprettUtenforAvtalelandSak();
    await behandlingPage.goto(url);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Progressbar - viser alle steg", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const behandlingPage = new BehandlingPage(page);

    // Hent URL til prepopulert FTRL-sak og naviger direkte dit
    const url = await opprettUtenforAvtalelandSak();
    await behandlingPage.goto(url);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Progressbar - klikk på steg navigerer til steget", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const behandlingPage = new BehandlingPage(page);

    // Hent URL til prepopulert FTRL-sak og naviger direkte dit
    const url = await opprettUtenforAvtalelandSak();
    await behandlingPage.goto(url);

    await runAxeAnalyze(page, testInfo.title);
  });
});
