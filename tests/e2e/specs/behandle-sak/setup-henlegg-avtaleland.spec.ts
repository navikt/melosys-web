import { test } from "@playwright/test";
import { BehandlingPage } from "../../pages/behandling/behandling.page";
import { TIMEOUT_FOR_COMPLEX_TESTS, getSaksnummerFraUrl } from "../../utils/testUtils";
import { opprettAvtalelandSak } from "../../utils/testdataUtils";
import { runAxeAnalyze } from "../../utils/axeUtils";

/**
 * MELOSYS-7385: Setup testdata - Avtaleland-sak med HENLAGT behandling
 *
 * Akseptansekriterium som testes:
 * "Dersom behandlingen ble avsluttet som HENLAGT skal man fortsatt få gul varselmelding om det."
 *
 * Denne setup-testen oppretter en Avtaleland-sak og henlegger den
 * for å sørge for at regresjonstestene har henlagt testdata tilgjengelig.
 */
test.describe("Setup: Avtaleland-sak med henlagt behandling", () => {
  test("Opprett Avtaleland-sak og henlegg behandlingen", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter og henlegger sak
    const behandlingPage = new BehandlingPage(page);

    // Hent URL til prepopulert Avtaleland-sak og naviger direkte dit
    const url = await opprettAvtalelandSak("MEL-1009");
    await behandlingPage.goto(url);

    const sakId = getSaksnummerFraUrl(page);
    await behandlingPage.avsluttBehandling("Søknaden/klagen er trukket", sakId);

    await runAxeAnalyze(page, testInfo.title);
  });
});
