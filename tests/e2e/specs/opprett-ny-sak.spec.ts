import { test } from "@playwright/test";
import { runAxeAnalyze } from "../utils/axeUtils";
import { MelosysHovedsidePage } from "../pages/melosys-hovedside.page";
import { OpprettNySakPage } from "../pages/opprett-ny-sak.page";

test("clicking the 'Opprett ny sak/behandling' button navigates to the create new case page", async ({
  page,
}, testInfo) => {
  const mainPage = new MelosysHovedsidePage(page);
  const newCasePage = new OpprettNySakPage(page);

  await mainPage.goto();

  await mainPage.clickCreateNewCaseButton();

  await newCasePage.verifyAllElements();

  await runAxeAnalyze(page, testInfo.title);
});
