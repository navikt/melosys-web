import { test } from "../../recording/fixtures";
import { BehandlingPage } from "../../pages/behandling/behandling.page";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../utils/testUtils";
import { hentPrepopulertSakUrl } from "../../utils/testdataUtils";
import { runAxeAnalyze } from "../../utils/axeUtils";

/**
 * Setup testdata - Avtaleland-sak med HENLAGT behandling
 *
 * Akseptansekriterium som testes:
 * "Dersom behandlingen ble avsluttet som HENLAGT skal man fortsatt få gul varselmelding om det."
 *
 * Denne setup-testen oppretter en Avtaleland-sak og henlegger den
 * for å sørge for at regresjonstestene har henlagt testdata tilgjengelig.
 */
test.describe("Setup: Avtaleland-sak med henlagt behandling", () => {
  test("Opprett Avtaleland-sak og henlegg behandlingen", async ({ page, apiRecorder }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter og henlegger sak
    const saksnummer = "MEL-1009";
    const behandlingPage = new BehandlingPage(page, saksnummer);

    // Hent URL til prepopulert Avtaleland-sak og naviger direkte dit
    const url = hentPrepopulertSakUrl(saksnummer);
    await behandlingPage.goto(url);

    await behandlingPage.avsluttBehandling("Søknaden/klagen er trukket", "Henlegg saken", "Søknaden er trukket");

    await runAxeAnalyze(page, testInfo.title);
  });
});
