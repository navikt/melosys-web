import { test } from "@playwright/test";
import { getSaksnummerFraUrl, TIMEOUT_FOR_COMPLEX_TESTS } from "../../utils/testUtils";
import { BehandlingPage } from "../../pages/behandling/behandling.page";
import { runAxeAnalyze } from "../../utils/axeUtils";
import { hentPrepopulertSakUrl } from "../../utils/testdataUtils";

test.describe("Avslutt Avtaleland-behandling for testdata", () => {
  test("Opprett og avslutt Avtaleland-sak, verifiser redirect til hovedside", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter og avslutter sak
    const behandlingPage = new BehandlingPage(page);

    // Hent URL til prepopulert Avtaleland-sak og naviger direkte dit
    const url = await hentPrepopulertSakUrl("MEL-1001");
    await behandlingPage.goto(url);

    const sakId = getSaksnummerFraUrl(page);
    await behandlingPage.avsluttBehandling(sakId, "Søknaden er innvilget", "Bekreft");

    await runAxeAnalyze(page, testInfo.title);
  });
});
