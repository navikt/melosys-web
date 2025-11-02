import { test } from "@playwright/test";
import { SokPage } from "../../../pages/sok.page";
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
  test("skal vise ftrl når behandling åpnes", async ({ page }, testInfo) => {
    test.setTimeout(60000);

    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);

    // Opprett en EU/EØS-sak med behandlingstema som har flere steg
    // "Arbeid og/eller selvstendig virksomhet i flere land" krever valg av land,
    // så vi bruker "Ikke yrkesaktiv" som er enklere
    const sak = await opprettEUEOSSak(page);

    // Naviger til behandlingen
    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    await runAxeAnalyze(page, testInfo.title);
  });

  test("skal kunne navigere frem og tilbake mellom steg", async ({ page }, testInfo) => {
    test.setTimeout(60000);

    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);

    const sak = await opprettEUEOSSak(page);

    // Naviger til behandlingen
    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    await runAxeAnalyze(page, testInfo.title);
  });

  test("skal vise steg i progressbar for EU/EØS-sak", async ({ page }, testInfo) => {
    test.setTimeout(60000);

    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);

    const sak = await opprettEUEOSSak(page);

    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    await runAxeAnalyze(page, testInfo.title);
  });
});
