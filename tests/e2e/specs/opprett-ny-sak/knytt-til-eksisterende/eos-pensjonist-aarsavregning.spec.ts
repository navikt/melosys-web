import { expect, test } from "../../../recording/fixtures";
import { HovedsidePage, USER_ID_VALID } from "../../../pages/hovedside.page";
import { OpprettNySakPage } from "../../../pages/opprett-ny-sak/opprett-ny-sak.page";

let opprettNySakPage: OpprettNySakPage;
let hovedsidePage: HovedsidePage;

test.describe("EØS pensjonist med trygdeavgift - årsavregning", () => {
  test.beforeEach(async ({ page, apiRecorder }) => {
    hovedsidePage = new HovedsidePage(page);
    opprettNySakPage = new OpprettNySakPage(page);
  });

  test("Knytt til EØS pensjonist-sak med åpne behandlinger - årsavregning tilgjengelig", async ({
    page,
    apiRecorder,
  }, testInfo) => {
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
  });
});
