import { expect, test } from "../../../recording/fixtures";
import { getTestMode } from "../../../config/mode";
import { runAxeAnalyze } from "../../../utils/axeUtils";
import { HovedsidePage, USER_ID_VALID } from "../../../pages/hovedside.page";
import { OpprettNySakPage } from "../../../pages/opprett-ny-sak/opprett-ny-sak.page";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../../utils/testUtils";
import { hentPrepopulertSakUrl } from "../../../utils/testdataUtils";
import { BehandlingPage } from "../../../pages/behandling/behandling.page";

/**
 * Test akseptansekriterier for 'Utenfor avtaleland'-saker
 *
 * Disse testene verifiserer de spesifikke akseptansekriteriene:
 * 1. Sak med åpen ikke-årsavregning → kun Årsavregning tilgjengelig
 * 2. Sak med åpen årsavregning → kun Årsavregning tilgjengelig
 * 3. Sak med alle avsluttede → alle behandlingstyper tilgjengelig
 */
test.describe("'Utenfor avtaleland' behandlingslogikk", () => {
  let opprettNySakPage: OpprettNySakPage;

  test.beforeEach(async ({ page, apiRecorder }) => {
    const mainPage = new HovedsidePage(page);
    opprettNySakPage = new OpprettNySakPage(page);

    await mainPage.goto();

    await mainPage.klikkOpprettNySakKnapp();
  });

  test("Utenfor avtaleland med åpen behandling - kun årsavregning tilgjengelig", async ({
    page,
    apiRecorder,
  }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter sak

    // Bruk prepopulert FTRL-sak med UNDER_BEHANDLING status
    const sakId = "MEL-1014";

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

  test("Utenfor avtaleland med åpen årsavregning - finner sak", async ({ page, apiRecorder }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter sak + årsavregning

    // Bruk prepopulert FTRL-sak med UNDER_BEHANDLING status
    const sakId = "MEL-1014";

    const hovedsidePage = new HovedsidePage(page);

    await hovedsidePage.goto();
    await hovedsidePage.klikkOpprettNySakKnapp();

    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const eksisterendeSak = opprettNySakPage.finnSakBySaksnummer(sakId);
    await eksisterendeSak.click();

    await opprettNySakPage.velgBehandlingstypeRadio("Årsavregning");

    // For Årsavregning må vi velge en behandlingsårsak før vi kan opprette behandlingen
    await opprettNySakPage.velgBehandlingsaarsak("Søknad");

    // Click and wait for navigation to complete (behandling creation triggers navigation to frontpage)
    // This ensures the POST is fully completed and captured in recordings
    await Promise.all([
      page.waitForURL(/\/melosys\/$/, { timeout: 15000 }),
      opprettNySakPage.klikkOpprettNyBehandling(),
    ]);

    // Allow the POST response to be fully captured by the recorder
    await page.waitForLoadState("networkidle");

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

  test("Utenfor avtaleland med avsluttet behandling - alle behandlingstyper tilgjengelige", async ({
    page,
    apiRecorder,
  }, testInfo) => {
    // Skip in playback mode: This test closes a behandling then verifies behandlingstyper.
    // The mock server returns pre-recorded behandlingstyper that don't reflect the closed state,
    // because the recordings were captured with a different behandling state.
    // The API returns only "Årsavregning" instead of all 4 types because it still sees the behandling as open.
    test.skip(
      getTestMode() === "playback",
      "Write-then-read pattern: behandlingstyper don't update after closing behandling in playback",
    );
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter og avslutter sak

    const saksnummer = "MEL-1020";
    const behandlingPage = new BehandlingPage(page, saksnummer);

    // Hent URL til prepopulert FTRL-sak og naviger direkte dit
    const url = hentPrepopulertSakUrl(saksnummer);
    await behandlingPage.goto(url);

    await behandlingPage.avsluttBehandling("Søknaden er innvilget", "Bekreft");

    const hovedsidePage = new HovedsidePage(page);

    await hovedsidePage.goto();
    await hovedsidePage.klikkOpprettNySakKnapp();

    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = opprettNySakPage.finnSakBySaksnummer(saksnummer);
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
