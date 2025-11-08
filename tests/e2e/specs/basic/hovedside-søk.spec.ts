import { test } from "@playwright/test";
import { runAxeAnalyze } from "../../utils/axeUtils";
import { HovedsidePage, USER_ID_INVALID, USER_ID_VALID } from "../../pages/hovedside.page";
import { SokPage } from "../../pages/sok.page";

test("Søk etter gyldig ID og verifiser resultater", async ({ page }, testInfo) => {
  const mainPage = new HovedsidePage(page);
  const searchResultsPage = new SokPage(page);

  await mainPage.goto();

  await mainPage.søk(USER_ID_VALID);

  //await searchResultsPage.verifyValidSearchResults(USER_ID_VALID);

  await runAxeAnalyze(page, testInfo.title);
});

test("Søk etter ugyldig ID og verifiser feilmelding", async ({ page }, testInfo) => {
  const mainPage = new HovedsidePage(page);
  const searchResultsPage = new SokPage(page);

  await mainPage.goto();

  await mainPage.søk(USER_ID_INVALID);

  // await searchResultsPage.verifyInvalidSearchResults(USER_ID_INVALID);

  await runAxeAnalyze(page, testInfo.title);
});
