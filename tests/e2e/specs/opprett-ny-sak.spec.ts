import { test } from "@playwright/test";
import { runAxeAnalyze } from "../utils/axeUtils";
import { HovedsidePage, USER_ID_VALID } from "../pages/hovedside.page";
import { OpprettNySakPage } from "../pages/opprett-ny-sak.page";

test("Klikk på 'Opprett ny sak/behandling' navigerer til opprett ny sak siden", async ({ page }, testInfo) => {
  const mainPage = new HovedsidePage(page);
  const newCasePage = new OpprettNySakPage(page);

  await mainPage.goto();
  await mainPage.clickCreateNewCaseButton();
  await newCasePage.verifyAllElements();

  await runAxeAnalyze(page, testInfo.title);
});

test("Verifiser feilmeldinger ved klikk på 'Opprett ny behandling' når ingen påkrevde felter er fylt ut", async ({
  page,
}, testInfo) => {
  const mainPage = new HovedsidePage(page);
  const newCasePage = new OpprettNySakPage(page);

  await mainPage.goto();
  await mainPage.clickCreateNewCaseButton();

  await newCasePage.verifyNewCasePage();
  await newCasePage.clickOpprettNyBehandling();
  await newCasePage.verifyManglendeBrukerIdErrors();

  await runAxeAnalyze(page, testInfo.title);
});

test("Verifiser feilmeldinger ved klikk på 'Opprett ny behandling' når behandlingsårsak mangler", async ({
  page,
}, testInfo) => {
  const mainPage = new HovedsidePage(page);
  const newCasePage = new OpprettNySakPage(page);

  await mainPage.goto();
  await mainPage.clickCreateNewCaseButton();

  await newCasePage.verifyNewCasePage();
  await newCasePage.fillUserID(USER_ID_VALID);
  await newCasePage.selectOpprettNySak();
  await newCasePage.clickOpprettNyBehandling();

  await newCasePage.verifyManglendeValgEksisterendaSakEllerOpprettNyErrors();

  await runAxeAnalyze(page, testInfo.title);
});

test("Fyll ut f.nr og velg 'Opprett ny sak' for å opprette ny behandling", async ({ page }, testInfo) => {
  const mainPage = new HovedsidePage(page);
  const newCasePage = new OpprettNySakPage(page);

  await mainPage.goto();
  await mainPage.clickCreateNewCaseButton();

  await newCasePage.verifyNewCasePage();
  await newCasePage.fillUserIDAndCreateNewCase(USER_ID_VALID);

  await runAxeAnalyze(page, testInfo.title);
});
