import { test } from "@playwright/test";
import { TIMEOUT_FOR_COMPLEX_TESTS, getSaksnummerFraUrl } from "../../utils/testUtils";
import { BehandlingPage } from "../../pages/behandling/behandling.page";
import { opprettAvtalelandSak, opprettUtenforAvtalelandSak } from "../../utils/testdataUtils";

/**
 * Denne testen setter opp nødvendige testdata for "knytt til eksisterende sak"-testene
 * ved å opprette og avslutte Avtaleland- og 'Utenfor avtaleland'-saker.
 */
test.describe("Setup testdata for knytt-til-eksisterende-sak tester", () => {
  test("Setup: Opprett og avslutt Avtaleland-sak for testdata", async ({ page }) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter og avslutter sak
    const behandlingPage = new BehandlingPage(page);

    // Hent URL til prepopulert Avtaleland-sak og naviger direkte dit
    const url = await opprettAvtalelandSak();
    await behandlingPage.goto(url);

    const sakId = getSaksnummerFraUrl(page);
    await behandlingPage.avsluttBehandling("Søknaden er innvilget", sakId);
  });

  test("Setup: Opprett og avslutt FTRL-sak for testdata", async ({ page }) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter og avslutter sak
    const behandlingPage = new BehandlingPage(page);

    // Hent URL til prepopulert FTRL-sak og naviger direkte dit
    const url = await opprettUtenforAvtalelandSak();
    await behandlingPage.goto(url);

    const sakId = getSaksnummerFraUrl(page);
    await behandlingPage.avsluttBehandling("Søknaden er innvilget", sakId);
  });
});
