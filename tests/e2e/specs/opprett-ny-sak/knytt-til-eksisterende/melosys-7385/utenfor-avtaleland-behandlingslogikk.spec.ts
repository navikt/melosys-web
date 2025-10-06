import { expect, test } from "@playwright/test";
import { runAxeAnalyze } from "../../../../utils/axeUtils";
import { HovedsidePage, USER_ID_VALID } from "../../../../pages/hovedside.page";
import { OpprettNySakPage } from "../../../../pages/opprett-ny-sak.page";
import { opprettUtenforAvtalelandSak } from "../../../../utils/testdataUtils";
import { SokPage } from "../../../../pages/sok.page";
import { VisBehandlingPage } from "../../../../pages/vis-behandling.page";

/**
 * MELOSYS-7385: Test akseptansekriterier for 'Utenfor avtaleland'-saker
 *
 * Disse testene verifiserer de spesifikke akseptansekriteriene:
 * 1. Sak med åpen ikke-årsavregning → kun Årsavregning tilgjengelig
 * 2. Sak med åpen årsavregning → kun Årsavregning tilgjengelig
 * 3. Sak med alle avsluttede → alle behandlingstyper tilgjengelig
 */
test.describe("MELOSYS-7385: 'Utenfor avtaleland' behandlingslogikk", () => {
  let opprettNySakPage: OpprettNySakPage;

  test.beforeEach(async ({ page }) => {
    const mainPage = new HovedsidePage(page);
    opprettNySakPage = new OpprettNySakPage(page);

    await mainPage.goto();

    await mainPage.klikkOpprettNySakKnapp();
  });

  test("AC1: 'Utenfor avtaleland - Behandlingen er opprettet' sak med kun Årsavregning tilgjengelig", async ({
    page,
  }, testInfo) => {
    test.setTimeout(30000); // Økt timeout siden vi oppretter sak

    const sakId = await opprettUtenforAvtalelandSak(page);

    const hovedsidePage = new HovedsidePage(page);
    await hovedsidePage.goto();
    await hovedsidePage.klikkOpprettNySakKnapp();

    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);
    await valgtSak.click();

    // === AKSEPTANSEKRITERIUM 1 ===
    // Kun Årsavregning skal være tilgjengelig når det er åpen Henvendelse
    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak, ["Årsavregning"]);

    expect(await opprettNySakPage.harFeilmelding(), "Ingen feilmelding skal vises for gyldig scenario").toBe(false);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("AC2: 'Utenfor avtaleland - Behandlingen er opprettet' sak med åpen årsavregning funnet", async ({
    page,
  }, testInfo) => {
    test.setTimeout(45000); // Økt timeout siden vi oppretter sak + årsavregning

    const sakId = await opprettUtenforAvtalelandSak(page);

    const hovedsidePage = new HovedsidePage(page);

    await hovedsidePage.goto();
    await hovedsidePage.klikkOpprettNySakKnapp();

    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const eksisterendeSak = opprettNySakPage.finnSakBySaksnummer(sakId);
    await eksisterendeSak.click();

    await opprettNySakPage.velgBehandlingstypeRadio("Årsavregning");
    await opprettNySakPage.klikkOpprettNyBehandling();

    await page.waitForLoadState("domcontentloaded");

    await hovedsidePage.goto();
    await hovedsidePage.klikkOpprettNySakKnapp();

    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);
    await valgtSak.click();

    // === AKSEPTANSEKRITERIUM 2 ===
    // Kun Årsavregning skal være tilgjengelig når det er åpen Årsavregning
    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak, ["Årsavregning"]);

    expect(await opprettNySakPage.harFeilmelding(), "Ingen feilmelding skal vises for gyldig scenario").toBe(false);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("AC3: 'Utenfor avtaleland - Behandlingen er avsluttet' sak funnet", async ({ page }, testInfo) => {
    test.setTimeout(30000); // Økt timeout siden vi oppretter og avslutter sak

    const sakId = await opprettUtenforAvtalelandSak(page);

    const hovedsidePage = new HovedsidePage(page);
    const sokPage = new SokPage(page);
    const behandlingPage = new VisBehandlingPage(page);

    await hovedsidePage.goto();
    await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

    const sak = sokPage.finnSakBySaksnummer(sakId);
    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();
    await behandlingPage.avsluttBehandling("Søknaden er innvilget", sakId);

    await hovedsidePage.goto();
    await hovedsidePage.klikkOpprettNySakKnapp();

    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);
    await valgtSak.click();

    // === AKSEPTANSEKRITERIUM 3 ===
    // Alle behandlingstyper skal være tilgjengelige når alle behandlinger er avsluttet
    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak, [
      "Ny vurdering",
      "Klage",
      "Henvendelse",
      "Årsavregning",
    ]);

    expect(await opprettNySakPage.harFeilmelding(), "Ingen feilmelding skal vises for gyldig scenario").toBe(false);

    await runAxeAnalyze(page, testInfo.title);
  });
});
