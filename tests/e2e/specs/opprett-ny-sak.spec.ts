import { expect, test } from "@playwright/test";
import { runAxeAnalyze } from "../utils/axeUtils";
import { HovedsidePage, USER_ID_VALID, ORG_NUMBER_VALID } from "../pages/hovedside.page";
import { OpprettNySakPage } from "../pages/opprett-ny-sak.page";
import { SokPage } from "../pages/sok.page";
import { assertFieldError, assertFieldErrorsWithLabels } from "../utils/testUtils";

let opprettNySakPage: OpprettNySakPage;
const TIMEOUT_BETWEEN_FIELD_SELECT = 100;

async function setupOpprettNySakTester(page: any) {
  const mainPage = new HovedsidePage(page);
  opprettNySakPage = new OpprettNySakPage(page);
  await mainPage.goto();
  await mainPage.klikkOpprettNySakKnapp();
}

test.describe("'Opprett ny sak/behandling' hovedside", () => {
  test.beforeEach(async ({ page }) => {
    await setupOpprettNySakTester(page);
  });
  test("Klikk på 'Opprett ny sak/behandling' og verifiser at alle forventede elementer er tilstede", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.verifiserAlleElementer();
    await runAxeAnalyze(page, testInfo.title);
  });

  test("Klikk på 'Opprett ny behandling' når ingen påkrevde felter er fylt ut og verifiser feilmeldinger", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.klikkOpprettNyBehandling();
    await opprettNySakPage.verifiserManglendeBrukerIdFeil();

    await runAxeAnalyze(page, testInfo.title);
  });
});

test.describe("'Opprett ny sak for bruker", () => {
  test.beforeEach(async ({ page }) => {
    await setupOpprettNySakTester(page);
  });

  test("Verifiser feilmeldinger ved klikk på 'Opprett ny behandling' når påkrevede felt mangler", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();
    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertFieldErrorsWithLabels(page, [
      { fieldLabel: "Sakstype", errorText: "Velg sakstype" },
      { fieldLabel: "Sakstema", errorText: "Velg sakstema" },
      { fieldLabel: "Behandlingstema", errorText: "Velg behandlingstema" },
      { fieldLabel: "Behandlingstype", errorText: "Velg behandlingstype" },
      { fieldLabel: "Årsak", errorText: "Velg behandlingsårsak" },
    ]);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Fyll ut f.nr og velg 'Opprett ny sak' for å opprette ny behandling", async ({ page }, testInfo) => {
    // Fyll ut bruker-ID og velg "Opprett ny sak"
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    // Fyll ut alle påkrevde dropdown-felt
    await opprettNySakPage.velgSakstype();
    await page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgSakstema();
    await page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingstema();
    await page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingstype();
    await page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingsaarsak();

    // Klikk for å opprette
    await opprettNySakPage.klikkOpprettNyBehandling();

    await runAxeAnalyze(page, testInfo.title);
  });

  test('Opprett sak for sakstype "EU/EØS-land" og verifiser at den finnes i søkeresultater', async ({
    page,
  }, testInfo) => {
    await setupOpprettNySakTester(page);
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await expect(opprettNySakPage.page.locator("select[name='sakstype']")).toBeVisible();

    await opprettNySakPage.velgSakstype("EU/EØS-land");
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgSakstema();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingstema();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingstype();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingsaarsak();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);

    await opprettNySakPage.setFraDato("01.01.2024");
    await opprettNySakPage.setTilDato("31.12.2024");
    await opprettNySakPage.setLand("Norge");

    await opprettNySakPage.klikkOpprettNyBehandling();
    await opprettNySakPage.verifiserOpprettelseAvNySak();

    const mainPage = new HovedsidePage(page);
    await mainPage.goto();
    await mainPage.søk(USER_ID_VALID);

    const sokPage = new SokPage(page);
    await sokPage.verifyValidSearchResults(USER_ID_VALID);

    await runAxeAnalyze(page, testInfo.title);
  });

  test('Opprett sak for sakstype "Avtaleland" og verifiser at den finnes i søkeresultater', async ({
    page,
  }, testInfo) => {
    await setupOpprettNySakTester(page);
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await expect(opprettNySakPage.page.locator("select[name='sakstype']")).toBeVisible();

    await opprettNySakPage.velgSakstype("Avtaleland");
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgSakstema();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingstema();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingstype();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingsaarsak();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);

    await opprettNySakPage.klikkOpprettNyBehandling();
    await opprettNySakPage.verifiserOpprettelseAvNySak();

    const mainPage = new HovedsidePage(page);
    await mainPage.goto();
    await mainPage.søk(USER_ID_VALID);

    const sokPage = new SokPage(page);
    await sokPage.verifyValidSearchResults(USER_ID_VALID);

    await runAxeAnalyze(page, testInfo.title);
  });

  test('Opprett sak for sakstype "Utenfor avtaleland" og verifiser at den finnes i søkeresultater', async ({
    page,
  }, testInfo) => {
    await setupOpprettNySakTester(page);
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await expect(opprettNySakPage.page.locator("select[name='sakstype']")).toBeVisible();

    await opprettNySakPage.velgSakstype("Utenfor avtaleland");
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgSakstema();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingstema();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingstype();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingsaarsak();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);

    await opprettNySakPage.klikkOpprettNyBehandling();
    await opprettNySakPage.verifiserOpprettelseAvNySak();

    const mainPage = new HovedsidePage(page);
    await mainPage.goto();
    await mainPage.søk(USER_ID_VALID);

    const sokPage = new SokPage(page);
    await sokPage.verifyValidSearchResults(USER_ID_VALID);

    await runAxeAnalyze(page, testInfo.title);
  });

  test('Opprett sak for sakstype "EU/EØS-land" med behandlingstype "Årsavregning" og verifiser at den finnes i søkeresultater', async ({
    page,
  }, testInfo) => {
    await setupOpprettNySakTester(page);
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await expect(opprettNySakPage.page.locator("select[name='sakstype']")).toBeVisible();

    await opprettNySakPage.velgSakstype("Utenfor avtaleland");
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgSakstema();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingstema();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingstype("Årsavregning");
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingsaarsak();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);

    await opprettNySakPage.klikkOpprettNyBehandling();
    await opprettNySakPage.verifiserOpprettelseAvNySak();

    const mainPage = new HovedsidePage(page);
    await mainPage.goto();
    await mainPage.søk(ORG_NUMBER_VALID);

    const sokPage = new SokPage(page);
    await sokPage.verifyValidOrgSearchResults(ORG_NUMBER_VALID);

    await runAxeAnalyze(page, testInfo.title);
  });
});

test.describe("'Opprett ny sak for virksomhet", () => {
  test.beforeEach(async ({ page }) => {
    await setupOpprettNySakTester(page);
  });

  test("Verifiser feilmeldinger ved klikk på 'Opprett ny behandling' når påkrevede felt mangler", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.velgVirksomhet();
    await opprettNySakPage.fyllInnOrganisasjonsnummer("123456789");
    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertFieldError(page, "Fant ingen navn på dette organisasjonsnummeret");

    await runAxeAnalyze(page, testInfo.title);
  });

  test('Opprett sak for sakstype "EU/EØS-land" og verifiser at den finnes i søkeresultater', async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.velgVirksomhet();
    await opprettNySakPage.fyllInnOrganisasjonsnummer(ORG_NUMBER_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await expect(opprettNySakPage.page.locator("select[name='sakstype']")).toBeVisible();

    await opprettNySakPage.velgSakstype("EU/EØS-land");
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgSakstema();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingstema();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingstype();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingsaarsak();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);

    await opprettNySakPage.klikkOpprettNyBehandling();
    await opprettNySakPage.verifiserOpprettelseAvNySak();

    const mainPage = new HovedsidePage(page);
    await mainPage.goto();
    await mainPage.søk(ORG_NUMBER_VALID);

    const sokPage = new SokPage(page);
    await sokPage.verifyValidOrgSearchResults(ORG_NUMBER_VALID);

    await runAxeAnalyze(page, testInfo.title);
  });

  test('Opprett sak for sakstype "Avtaleland" og verifiser at den finnes i søkeresultater', async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.velgVirksomhet();
    await opprettNySakPage.fyllInnOrganisasjonsnummer(ORG_NUMBER_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await expect(opprettNySakPage.page.locator("select[name='sakstype']")).toBeVisible();

    await opprettNySakPage.velgSakstype("Avtaleland");
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgSakstema();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingstema();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingstype();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);
    await opprettNySakPage.velgBehandlingsaarsak();
    await opprettNySakPage.page.waitForTimeout(TIMEOUT_BETWEEN_FIELD_SELECT);

    await opprettNySakPage.klikkOpprettNyBehandling();
    await opprettNySakPage.verifiserOpprettelseAvNySak();

    const mainPage = new HovedsidePage(page);
    await mainPage.goto();
    await mainPage.søk(ORG_NUMBER_VALID);

    const sokPage = new SokPage(page);
    await sokPage.verifyValidOrgSearchResults(ORG_NUMBER_VALID);

    await runAxeAnalyze(page, testInfo.title);
  });
});
