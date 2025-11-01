import { test, Page, expect } from "@playwright/test";
import { HovedsidePage, USER_ID_VALID } from "../../../pages/hovedside.page";
import { OpprettNySakPage } from "../../../pages/opprett-ny-sak/opprett-ny-sak.page";
import { BehandlingPage } from "../../../pages/behandling/behandling.page";
import { SokPage } from "../../../pages/sok.page";
import { runAxeAnalyze } from "../../../utils/axeUtils";
import { assertNyBehandlingOpprettet, getSaksnummerFraLocator } from "../../../utils/testUtils";

let opprettNySakPage: OpprettNySakPage;

async function setupOpprettNySakTester(page: Page) {
  const mainPage = new HovedsidePage(page);
  opprettNySakPage = new OpprettNySakPage(page);

  await mainPage.goto();
  await mainPage.klikkOpprettNySakKnapp();
}

/**
 * Denne testen oppretter en kompleks sak med flere behandlinger for å skape
 * testdata som gir alle behandlingstyper tilgjengelig når behandlinger er avsluttet.
 *
 * Sekvens:
 * 1. Opprett Førstegangsbehandling og ferdigbehandle med fakturering
 * 2. Opprett Årsavregningsbehandling i samme sak og avslutt med "Ferdigbehandlet"
 * 3. Opprett Henvendelse i samme sak
 *
 * Dette skal resultere i at alle behandlingstyper (Ny vurdering, Klage, Henvendelse, Årsavregning)
 * blir tilgjengelige for fremtidige behandlinger på saken.
 */
test.describe("Opprett kompleks sak med flere behandlingstyper", () => {
  test("Opprett Avtaleland-sak med Førstegangsbehandling for å skape testdata", async ({ page }, testInfo) => {
    const hovedsidePage = new HovedsidePage(page);
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);

    await setupOpprettNySakTester(page);

    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await opprettNySakPage.velgSakstype("Avtaleland");
    await opprettNySakPage.velgSakstema("Medlemskap og lovvalg");
    await opprettNySakPage.velgBehandlingstema("Yrkesaktiv");
    await opprettNySakPage.velgBehandlingstype("Førstegangsbehandling");
    await opprettNySakPage.velgBehandlingsaarsak("Søknad");

    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertNyBehandlingOpprettet(page);

    await hovedsidePage.goto();
    await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

    const saker = await sokPage.finnÅpneSaker("Avtaleland");
    expect(saker.length, "Fant ingen åpne 'Avtaleland' saker").toBeGreaterThan(0);

    await sokPage.klikkVisBehandling(saker[0]);
    await behandlingPage.verifiserBehandlingsside();

    await behandlingPage.avsluttBehandling("Søknaden er innvilget", getSaksnummerFraLocator(saker[0]));

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Opprett 'Utenfor avtaleland' sak med Førstegangsbehandling for å skape testdata", async ({
    page,
  }, testInfo) => {
    const hovedsidePage = new HovedsidePage(page);
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);

    await setupOpprettNySakTester(page);

    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await opprettNySakPage.velgSakstype("Utenfor avtaleland");
    await opprettNySakPage.velgSakstema("Medlemskap og lovvalg");
    await opprettNySakPage.velgBehandlingstema("Yrkesaktiv");
    await opprettNySakPage.velgBehandlingstype("Førstegangsbehandling");
    await opprettNySakPage.velgBehandlingsaarsak("Søknad");
    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertNyBehandlingOpprettet(page);

    await hovedsidePage.goto();
    await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

    const saker = await sokPage.finnÅpneSaker("Utenfor avtaleland");
    expect(saker.length, "Fant ingen åpne 'Utenfor avtaleland' saker").toBeGreaterThan(0);

    await sokPage.klikkVisBehandling(saker[0]);
    await behandlingPage.verifiserBehandlingsside();

    await behandlingPage.avsluttBehandling("Søknaden er innvilget", getSaksnummerFraLocator(saker[0]));

    // Opprett Årsavregning på samme sak
    await hovedsidePage.goto();

    // Søk først for å bekrefte at saken eksisterer og er synkronisert
    await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

    await hovedsidePage.klikkOpprettNySakKnapp();
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const eksisterendeSaker = await opprettNySakPage.finnAlleSaker({
      sakstype: "Utenfor avtaleland",
      behandlingsstatus: "Behandlingen er avsluttet",
    });
    expect(eksisterendeSaker.length, "Fant ingen avsluttede 'Utenfor avtaleland' saker").toBeGreaterThan(0);

    await eksisterendeSaker[0].click();
    await opprettNySakPage.velgBehandlingstypeRadio("Årsavregning");
    await opprettNySakPage.velgBehandlingsaarsak("Søknad");
    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertNyBehandlingOpprettet(page);

    await hovedsidePage.goto();
    await runAxeAnalyze(page, testInfo.title);
  });
});
