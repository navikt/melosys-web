import { expect, test } from "@playwright/test";
import { runAxeAnalyze } from "../utils/axeUtils";
import { MelosysHovedsidePage, USER_ID_INVALID, USER_ID_VALID } from "../pages/melosys-hovedside.page";
import { SokPage } from "../pages/sok.page";

test("main page loads correctly and displays expected sections", async ({ page }, testInfo) => {
  const mainPage = new MelosysHovedsidePage(page);

  await mainPage.goto();

  await mainPage.verifyMainPage();

  await expect(mainPage.getCreateNewCaseButton()).toBeVisible();

  await runAxeAnalyze(page, testInfo.title);
});

test("search for a valid ID and verify results", async ({ page }, testInfo) => {
  const mainPage = new MelosysHovedsidePage(page);
  const searchResultsPage = new SokPage(page);

  await mainPage.goto();

  await mainPage.search(USER_ID_VALID);

  await searchResultsPage.verifyValidSearchResults(USER_ID_VALID);

  await runAxeAnalyze(page, testInfo.title);
});

test("search for invalid ID and verify error message", async ({ page }, testInfo) => {
  const mainPage = new MelosysHovedsidePage(page);
  const searchResultsPage = new SokPage(page);

  await mainPage.goto();

  await mainPage.search(USER_ID_INVALID);

  await searchResultsPage.verifyInvalidSearchResults(USER_ID_INVALID);

  await runAxeAnalyze(page, testInfo.title);
});
