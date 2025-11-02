import { test } from "@playwright/test";
import { SokPage } from "../../pages/sok.page";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../utils/testUtils";
import { BehandlingPage } from "../../pages/behandling/behandling.page";
import { runAxeAnalyze } from "../../utils/axeUtils";
import { opprettAvtalelandSak } from "../../utils/testdataUtils";

test.describe("Avslutt Avtaleland-behandling for testdata", () => {
  test("Opprett og avslutt Avtaleland-sak, verifiser redirect til hovedside", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter og avslutter sak
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);

    // Opprett egen Avtaleland-sak
    const sak = await opprettAvtalelandSak(page);
    const sakId = await sokPage.getSaksnummer(sak);

    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();
    await behandlingPage.avsluttBehandling("Søknaden er innvilget", sakId);

    await runAxeAnalyze(page, testInfo.title);
  });
});
