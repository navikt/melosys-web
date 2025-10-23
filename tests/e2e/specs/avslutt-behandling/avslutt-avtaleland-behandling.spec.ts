import { test } from "@playwright/test";
import { HovedsidePage, USER_ID_VALID } from "../../pages/hovedside.page";
import { SokPage } from "../../pages/sok.page";
import { BehandlingPage } from "../../pages/behandling/behandling.page";
import { runAxeAnalyze } from "../../utils/axeUtils";
import { opprettAvtalelandSak } from "../../utils/testdataUtils";

test.describe("Avslutt Avtaleland-behandling for testdata", () => {
  test("Opprett og avslutt Avtaleland-sak, verifiser redirect til hovedside", async ({ page }, testInfo) => {
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
    await behandlingPage.verifiserBehandlingsside();
    await behandlingPage.avsluttBehandling("Søknaden er innvilget", sakId);

    await runAxeAnalyze(page, testInfo.title);
  });
});
