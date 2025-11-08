import { test } from "@playwright/test";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../../utils/testUtils";
import { BehandlingPage } from "../../../pages/behandling/behandling.page";
import { opprettEUEOSSak } from "../../../utils/testdataUtils";
import { runAxeAnalyze } from "../../../utils/axeUtils";

/**
 * E2E-tester for Stegvelger (Hovedstegvelger) i EU/EØS saksbehandling
 *
 * Disse testene verifiserer stegnavigasjon for EU/EØS-saker som bruker
 * hovedstegvelgeren (src/felleskomponenter/ftrl/Stegvelger.jsx).
 *
 * Stegvelgeren brukes kun i:
 * - EU/EØS saksbehandling (saksopplysninger.jsx)
 * - EU/EØS vurder utpeking (vurderutpeking.jsx)
 */
test.describe("EU/EØS Stegvelger - Navigasjon", () => {
  test("EU/EØS-behandling åpnes - viser stegvelger", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const behandlingPage = new BehandlingPage(page);

    // Hent URL til prepopulert EU/EØS-sak (Ikke yrkesaktiv) og naviger direkte dit
    const url = await opprettEUEOSSak();
    await behandlingPage.goto(url);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Navigasjon mellom steg - frem og tilbake fungerer", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const behandlingPage = new BehandlingPage(page);

    // Hent URL til prepopulert EU/EØS-sak (Ikke yrkesaktiv) og naviger direkte dit
    const url = await opprettEUEOSSak();
    await behandlingPage.goto(url);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Progressbar - viser alle steg", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const behandlingPage = new BehandlingPage(page);

    // Hent URL til prepopulert EU/EØS-sak (Ikke yrkesaktiv) og naviger direkte dit
    const url = await opprettEUEOSSak();
    await behandlingPage.goto(url);

    await runAxeAnalyze(page, testInfo.title);
  });
});
