import { test } from "@playwright/test";
import { SokPage } from "../../pages/sok.page";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../utils/testUtils";
import { BehandlingPage } from "../../pages/behandling/behandling.page";
import { opprettAvtalelandSak, opprettUtenforAvtalelandSak } from "../../utils/testdataUtils";

/**
 * Denne testen setter opp nødvendige testdata for "knytt til eksisterende sak"-testene
 * ved å opprette og avslutte Avtaleland- og 'Utenfor avtaleland'-saker.
 */
test.describe("Setup testdata for knytt-til-eksisterende-sak tester", () => {
  test("Setup: Opprett og avslutt Avtaleland-sak for testdata", async ({ page }) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter og avslutter sak
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);

    // Opprett egen Avtaleland-sak
    const sak = await opprettAvtalelandSak(page);
    const sakId = await sokPage.getSaksnummer(sak);

    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.avsluttBehandling("Søknaden er innvilget", sakId);
  });

  test("Setup: Opprett og avslutt FTRL-sak for testdata", async ({ page }) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter og avslutter sak
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);

    // Opprett egen FTRL-sak
    const sak = await opprettUtenforAvtalelandSak(page);
    const sakId = await sokPage.getSaksnummer(sak);

    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.avsluttBehandling("Søknaden er innvilget", sakId);
  });
});
