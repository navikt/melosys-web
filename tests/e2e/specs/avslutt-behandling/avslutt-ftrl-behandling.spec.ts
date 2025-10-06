import { test } from "@playwright/test";
import { HovedsidePage, USER_ID_VALID } from "../../pages/hovedside.page";
import { SokPage } from "../../pages/sok.page";
import { VisBehandlingPage } from "../../pages/vis-behandling.page";
import { runAxeAnalyze } from "../../utils/axeUtils";
import { opprettUtenforAvtalelandSak } from "../../utils/testdataUtils";

test.describe("Avslutt 'Utenfor avtaleland'-behandling for testdata", () => {
  test("Opprett og avslutt 'Utenfor avtaleland'-sak, verifiser redirect til hovedside", async ({ page }, testInfo) => {
    test.setTimeout(30000); // Økt timeout siden vi oppretter og avslutter sak
    const hovedsidePage = new HovedsidePage(page);
    const sokPage = new SokPage(page);
    const behandlingPage = new VisBehandlingPage(page);

    // Opprett egen FTRL-sak
    const sakId = await opprettUtenforAvtalelandSak(page);

    await hovedsidePage.goto();
    await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

    const sak = sokPage.finnSakBySaksnummer(sakId);
    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();
    await behandlingPage.avsluttBehandling("Søknaden er innvilget", sakId);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Opprett og avslutt 'Utenfor avtaleland'-sak for å sikre full avslutning", async ({ page }, testInfo) => {
    test.setTimeout(30000); // Økt timeout siden vi oppretter og avslutter sak
    const hovedsidePage = new HovedsidePage(page);
    const sokPage = new SokPage(page);
    const behandlingPage = new VisBehandlingPage(page);

    // Opprett egen FTRL-sak
    const sakId = await opprettUtenforAvtalelandSak(page);

    await hovedsidePage.goto();
    await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

    const sak = sokPage.finnSakBySaksnummer(sakId);
    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.avsluttBehandling("Søknaden er innvilget", sakId);

    await runAxeAnalyze(page, testInfo.title);
  });
});
