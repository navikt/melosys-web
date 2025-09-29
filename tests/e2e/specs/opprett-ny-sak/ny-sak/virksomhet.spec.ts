import { expect, test } from "@playwright/test";
import { runAxeAnalyze } from "../../../utils/axeUtils";
import { HovedsidePage, ORG_NUMBER_VALID } from "../../../pages/hovedside.page";
import { OpprettNySakPage } from "../../../pages/opprett-ny-sak.page";
import { assertFieldError, assertNyBehandlingOpprettet } from "../../../utils/testUtils";

let opprettNySakPage: OpprettNySakPage;

async function setupOpprettNySakTester(page: any) {
  const mainPage = new HovedsidePage(page);
  opprettNySakPage = new OpprettNySakPage(page);
  await mainPage.goto();
  await mainPage.klikkOpprettNySakKnapp();
}

test.describe("'Opprett ny sak for virksomhet", () => {
  test.beforeEach(async ({ page }) => {
    await setupOpprettNySakTester(page);
  });

  test("Klikk på 'Opprett ny behandling' når påkrevede felt mangler og verifiser feilmeldinger", async ({
    page,
  }, testInfo) => {
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

    await expect(opprettNySakPage.page.locator("select[name='sakstype']")).toBeVisible();

    await opprettNySakPage.velgSakstype("EU/EØS-land");
    await opprettNySakPage.velgSakstema();
    await opprettNySakPage.velgBehandlingstema();
    await opprettNySakPage.velgBehandlingstype();
    await opprettNySakPage.velgBehandlingsaarsak();

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

    await expect(opprettNySakPage.page.locator("select[name='sakstype']")).toBeVisible();

    await opprettNySakPage.velgSakstype("Avtaleland");
    await opprettNySakPage.velgSakstema();
    await opprettNySakPage.velgBehandlingstema();
    await opprettNySakPage.velgBehandlingstype();
    await opprettNySakPage.velgBehandlingsaarsak();

    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertNyBehandlingOpprettet(page);

    await runAxeAnalyze(page, testInfo.title);
  });
});
