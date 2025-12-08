import { expect, test } from "@playwright/test";
import { runAxeAnalyze } from "../../../utils/axeUtils";
import { HovedsidePage, USER_ID_VALID } from "../../../pages/hovedside.page";
import { OpprettNySakPage } from "../../../pages/opprett-ny-sak/opprett-ny-sak.page";
import { hentPrepopulertSakUrl } from "../../../utils/testdataUtils";

let opprettNySakPage: OpprettNySakPage;
let hovedsidePage: HovedsidePage;

test.describe("EØS pensjonist med trygdeavgift - årsavregning", () => {
  test.beforeEach(async ({ page }) => {
    hovedsidePage = new HovedsidePage(page);
    opprettNySakPage = new OpprettNySakPage(page);
  });

  test("Opprett EØS pensjonist-sak med trygdeavgift for testdata", async ({ page }, testInfo) => {
    // Denne testen oppretter testdata som brukes av de andre testene
    const url = hentPrepopulertSakUrl("MEL-1056");

    expect(url, "URL skal være opprettet").toBeTruthy();
    expect(url).toContain("/melosys/EU_EOS/");

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Knytt til EØS pensjonist-sak med åpne behandlinger - årsavregning tilgjengelig", async ({ page }, testInfo) => {
    // Bruk prepopulert OPPRETTET EØS pensjonist-sak MEL-1062
    // Test at EØS pensjonister med trygdeavgift kan opprette årsavregning
    // selv om de har aktive behandlinger (unntak fra vanlig EØS-regel)
    await hovedsidePage.goto();
    await hovedsidePage.klikkOpprettNySakKnapp();

    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const sakId = "MEL-1062";
    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);

    await valgtSak.click();

    // Verifiser at årsavregning er tilgjengelig (unntak fra vanlig EØS-regel)
    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak, ["Årsavregning"]);

    // Verifiser at ingen feilmelding vises
    const harFeilmelding = await opprettNySakPage.harFeilmelding();
    expect(harFeilmelding, `Ingen feilmelding skal vises for EØS pensjonist-sak ${sakId}`).toBe(false);

    await runAxeAnalyze(page, testInfo.title);
  });
});
