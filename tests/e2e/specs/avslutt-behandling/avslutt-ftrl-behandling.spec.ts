import { test } from "@playwright/test";
import { SokPage } from "../../pages/sok.page";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../utils/testUtils";
import { BehandlingPage } from "../../pages/behandling/behandling.page";
import { runAxeAnalyze } from "../../utils/axeUtils";
import { opprettUtenforAvtalelandSak } from "../../utils/testdataUtils";

test.describe("Avslutt 'Utenfor avtaleland'-behandling for testdata", () => {
  test("Opprett og avslutt 'Utenfor avtaleland'-sak, verifiser redirect til hovedside", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter og avslutter sak
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);

    // Opprett egen FTRL-sak
    const sak = await opprettUtenforAvtalelandSak(page);
    const sakId = await sokPage.getSaksnummer(sak);

    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();
    await behandlingPage.avsluttBehandling("Søknaden er innvilget", sakId);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Opprett og avslutt 'Utenfor avtaleland'-sak for å sikre full avslutning", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter og avslutter sak
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);

    // Opprett egen FTRL-sak
    const sak = await opprettUtenforAvtalelandSak(page);
    const sakId = await sokPage.getSaksnummer(sak);

    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.avsluttBehandling("Søknaden er innvilget", sakId);

    await runAxeAnalyze(page, testInfo.title);
  });
});
