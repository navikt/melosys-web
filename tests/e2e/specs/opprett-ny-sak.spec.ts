import { test } from "@playwright/test";
import { runAxeAnalyze } from "../utils/axeUtils";
import { MelosysHovedsidePage } from "../pages/melosys-hovedside.page";
import { OpprettNySakPage } from "../pages/opprett-ny-sak.page";

test("Klikk på 'Opprett ny sak/behandling' knappen navigerer til opprett ny sak siden", async ({ page }, testInfo) => {
  const mainPage = new MelosysHovedsidePage(page);
  const newCasePage = new OpprettNySakPage(page);

  await mainPage.goto();

  await mainPage.clickCreateNewCaseButton();

  await newCasePage.verifyAllElements();

  await runAxeAnalyze(page, testInfo.title);
});
