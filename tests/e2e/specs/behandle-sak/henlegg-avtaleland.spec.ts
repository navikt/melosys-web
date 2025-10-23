import { test } from "@playwright/test";
import { HovedsidePage, USER_ID_VALID } from "../../pages/hovedside.page";
import { BehandlingPage } from "../../pages/behandling/behandling.page";
import { SokPage } from "../../pages/sok.page";
import { opprettAvtalelandSak } from "../../utils/testdataUtils";

/**
 * MELOSYS-7385: Setup testdata - Avtaleland-sak med HENLAGT behandling
 *
 * Akseptansekriterium som testes:
 * "Dersom behandlingen ble avsluttet som HENLAGT skal man fortsatt få gul varselmelding om det."
 *
 * Denne setup-testen oppretter en Avtaleland-sak og henlegger den
 * for å sørge for at regresjonstestene har henlagt testdata tilgjengelig.
 */
test.describe("MELOSYS-7385 Setup: Avtaleland-sak med henlagt behandling", () => {
  test("Opprett Avtaleland-sak og henlegg behandlingen", async ({ page }) => {
    test.setTimeout(30000); // Økt timeout siden vi oppretter og henlegger sak
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
    await behandlingPage.avsluttBehandling("Søknaden/klagen er trukket", sakId);
  });
});
