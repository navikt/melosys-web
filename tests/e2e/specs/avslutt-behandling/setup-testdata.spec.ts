import { test } from "@playwright/test";
import { HovedsidePage, USER_ID_VALID } from "../../pages/hovedside.page";
import { SokPage } from "../../pages/sok.page";
import { BehandlingPage } from "../../pages/behandling/behandling.page";
import { opprettAvtalelandSak, opprettUtenforAvtalelandSak } from "../../utils/testdataUtils";

/**
 * Denne testen setter opp nødvendige testdata for "knytt til eksisterende sak"-testene
 * ved å opprette og avslutte Avtaleland- og 'Utenfor avtaleland'-saker.
 */
test.describe("Setup testdata for knytt-til-eksisterende-sak tester", () => {
  test("Setup: Opprett og avslutt Avtaleland-sak for testdata", async ({ page }) => {
    test.setTimeout(30000); // Økt timeout siden vi oppretter og avslutter sak
    const hovedsidePage = new HovedsidePage(page);
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);

    // Opprett egen Avtaleland-sak
    const sakId = await opprettAvtalelandSak(page);

    await hovedsidePage.goto();
    await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

    const sak = sokPage.finnSakBySaksnummer(sakId);
    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.avsluttBehandling("Søknaden er innvilget", sakId);
  });

  test("Setup: Opprett og avslutt FTRL-sak for testdata", async ({ page }) => {
    test.setTimeout(30000); // Økt timeout siden vi oppretter og avslutter sak
    const hovedsidePage = new HovedsidePage(page);
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);

    // Opprett egen FTRL-sak
    const sakId = await opprettUtenforAvtalelandSak(page);

    await hovedsidePage.goto();
    await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

    const sak = sokPage.finnSakBySaksnummer(sakId);
    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.avsluttBehandling("Søknaden er innvilget", sakId);
  });
});
