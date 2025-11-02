import { test, expect } from "@playwright/test";
import { SokPage } from "../../../pages/sok.page";
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
  test("skal vise ftrl når FTRL-behandling åpnes", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);

    // Opprett en FTRL-sak (Utenfor avtaleland)
    const sak = await opprettUtenforAvtalelandSak(page);

    // Naviger til behandlingen
    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    await runAxeAnalyze(page, testInfo.title);
  });

  test("skal kunne navigere frem og tilbake mellom steg i FTRL", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);

    const sak = await opprettUtenforAvtalelandSak(page);

    // Naviger til behandlingen
    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    await runAxeAnalyze(page, testInfo.title);
  });

  test("skal vise steg i progressbar for FTRL-sak", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);

    const sak = await opprettUtenforAvtalelandSak(page);

    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    await runAxeAnalyze(page, testInfo.title);
  });

  test("skal kunne klikke på steg i progressbar", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);

    const sak = await opprettUtenforAvtalelandSak(page);

    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    await runAxeAnalyze(page, testInfo.title);
  });
});
