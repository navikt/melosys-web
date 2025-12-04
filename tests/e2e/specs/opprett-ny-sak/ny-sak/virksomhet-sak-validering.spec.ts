import { test } from "../../../recording/fixtures";
import { runAxeAnalyze } from "../../../utils/axeUtils";
import { HovedsidePage, ORG_NUMBER_VALID } from "../../../pages/hovedside.page";
import { OpprettNySakPage } from "../../../pages/opprett-ny-sak/opprett-ny-sak.page";
import { assertFieldError, assertNyBehandlingOpprettet } from "../../../utils/testUtils";

let opprettNySakPage: OpprettNySakPage;

test.describe("'Opprett ny sak for virksomhet", () => {
  // Kjør tester serielt fordi de deler module-level state (opprettNySakPage)
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page, apiRecorder }) => {
    const mainPage = new HovedsidePage(page);
    opprettNySakPage = new OpprettNySakPage(page);

    await mainPage.goto();
    await mainPage.klikkOpprettNySakKnapp();
  });

  test("Manglende påkrevde felt - viser feilmeldinger", async ({ page, apiRecorder }, testInfo) => {
    await opprettNySakPage.velgVirksomhet();
    await opprettNySakPage.fyllInnOrganisasjonsnummer("123456789");
    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertFieldError(page, "Fant ingen navn på dette organisasjonsnummeret");

    await runAxeAnalyze(page, testInfo.title);
  });

  test('Opprett sak for sakstype "EU/EØS-land" og verifiser at det ikke oppstår noen feil', async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.velgVirksomhet();
    await opprettNySakPage.fyllInnOrganisasjonsnummer(ORG_NUMBER_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await opprettNySakPage.verifiserSakstypeSelect();

    await opprettNySakPage.velgSakstype("EU/EØS-land");
    await opprettNySakPage.velgSakstema("Medlemskap og lovvalg");
    await opprettNySakPage.velgBehandlingstema("Virksomhet");
    await opprettNySakPage.velgBehandlingstype("Henvendelse");
    await opprettNySakPage.velgBehandlingsaarsak("Søknad");

    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertNyBehandlingOpprettet(page);

    await runAxeAnalyze(page, testInfo.title);
  });

  test('Opprett sak for sakstype "Avtaleland" og verifiser at det ikke oppstår noen feil', async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.velgVirksomhet();
    await opprettNySakPage.fyllInnOrganisasjonsnummer(ORG_NUMBER_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await opprettNySakPage.verifiserSakstypeSelect();

    await opprettNySakPage.velgSakstype("Avtaleland");
    await opprettNySakPage.velgSakstema("Medlemskap og lovvalg");
    await opprettNySakPage.velgBehandlingstema("Virksomhet");
    await opprettNySakPage.velgBehandlingstype("Henvendelse");
    await opprettNySakPage.velgBehandlingsaarsak("Søknad");

    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertNyBehandlingOpprettet(page);

    await runAxeAnalyze(page, testInfo.title);
  });
});
