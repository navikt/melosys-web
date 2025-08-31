import { test } from "@playwright/test";
import { runAxeAnalyze } from "../utils/axeUtils";
import { HovedsidePage, USER_ID_VALID } from "../pages/hovedside.page";
import { OpprettNySakPage } from "../pages/opprett-ny-sak.page";
import { assertErrors, assertFieldErrorsWithLabels } from "../utils/testUtils";

let opprettNySakPage: OpprettNySakPage;

async function setupOpprettNySakTester(page: any) {
  const mainPage = new HovedsidePage(page);
  opprettNySakPage = new OpprettNySakPage(page);
  await mainPage.goto();
  await mainPage.clickCreateNewCaseButton();
}

test.describe("'Opprett ny sak/behandling' hovedside", () => {
  test.beforeEach(async ({ page }) => {
    await setupOpprettNySakTester(page);
  });
  test("Klikk på 'Opprett ny sak/behandling' og verifiser alle elementer", async ({ page }, testInfo) => {
    await opprettNySakPage.verifyAllElements();
    await runAxeAnalyze(page, testInfo.title);
  });

  test("Verifiser feilmeldinger ved klikk på 'Opprett ny behandling' når ingen påkrevde felter er fylt ut", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.clickOpprettNyBehandling();
    await opprettNySakPage.verifyManglendeBrukerIdErrors();

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
    await opprettNySakPage.fillUserID(USER_ID_VALID);
    await opprettNySakPage.selectOpprettNySak();
    await opprettNySakPage.clickOpprettNyBehandling();

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
    await opprettNySakPage.fillUserIDAndCreateNewCase(USER_ID_VALID);
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
    await opprettNySakPage.fillUserID(USER_ID_VALID);
    await opprettNySakPage.clickOpprettNyBehandling();

    await assertFieldErrorsWithLabels(page, [
      { fieldLabel: "Eksisterende sak", errorText: "Velg hvilken sak du ønsker å knytte behandlingen til" },
      { fieldLabel: "Årsak", errorText: "Velg behandlingsårsak" },
    ]);

    await runAxeAnalyze(page, testInfo.title);
  });
});
