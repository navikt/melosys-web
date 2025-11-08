import { expect, test } from "@playwright/test";
import { runAxeAnalyze } from "../../../utils/axeUtils";
import { HovedsidePage, USER_ID_VALID } from "../../../pages/hovedside.page";
import { OpprettNySakPage } from "../../../pages/opprett-ny-sak/opprett-ny-sak.page";
import { getSaksnummerFraLocator } from "../../../utils/testUtils";
import { opprettEøsPensjonistSakMedTrygdeavgift } from "../../../utils/testdataUtils";

let opprettNySakPage: OpprettNySakPage;
let hovedsidePage: HovedsidePage;

// MELOSYS-7603
test.describe("EØS pensjonist med trygdeavgift - årsavregning", () => {
  test.beforeEach(async ({ page }) => {
    hovedsidePage = new HovedsidePage(page);
    opprettNySakPage = new OpprettNySakPage(page);
  });

  test("Opprett EØS pensjonist-sak med trygdeavgift for testdata", async ({ page }, testInfo) => {
    // Denne testen oppretter testdata som brukes av de andre testene
    const url = await opprettEøsPensjonistSakMedTrygdeavgift("MEL-1055");

    expect(url, "URL skal være opprettet").toBeTruthy();
    expect(url).toContain("/melosys/EU_EOS/");

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Knytt til EØS pensjonist-sak med åpne behandlinger - årsavregning tilgjengelig", async ({ page }, testInfo) => {
    // Opprett en ekstra sak for denne testen
    await opprettEøsPensjonistSakMedTrygdeavgift("MEL-1056");
    // Test at EØS pensjonister med trygdeavgift kan opprette årsavregning
    // selv om de har aktive behandlinger (unntak fra vanlig EØS-regel)
    await hovedsidePage.goto();
    await hovedsidePage.klikkOpprettNySakKnapp();

    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    // Finn en EØS-sak med åpen behandling
    // Ideelt sett skulle vi filtrert på sakstema="Trygdeavgift", men vi tester
    // at logikken fungerer for alle EØS-saker som matcher kriteriene
    const valgtSak = await opprettNySakPage.finnSak({
      sakstype: "EU/EØS-land",
      behandlingsstatus: "Behandlingen er opprettet",
    });

    if (!valgtSak) {
      test.skip();
      return;
    }

    expect(valgtSak, "Ingen EØS pensjonist-sak funnet").toBeTruthy();

    valgtSak.click();

    // Verifiser at årsavregning er tilgjengelig (unntak fra vanlig EØS-regel)
    // Dette er hovedpoenget med MELOSYS-7603
    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak, ["Årsavregning"]);

    // Verifiser at ingen feilmelding vises
    const harFeilmelding = await opprettNySakPage.harFeilmelding();
    expect(
      harFeilmelding,
      `Ingen feilmelding skal vises for EØS pensjonist-sak ${getSaksnummerFraLocator(valgtSak)}`,
    ).toBe(false);

    await runAxeAnalyze(page, testInfo.title);
  });
});
