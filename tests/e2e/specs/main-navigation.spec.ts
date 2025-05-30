import { expect, test } from "@playwright/test";
import { runAxeAnalyze } from "../utils/axeUtils";
import { MainPage, USER_ID_INVALID, USER_ID_VALID } from "../pages/main.page";
import { SearchResultsPage } from "../pages/search-results.page";
import { NewCasePage } from "../pages/new-case.page";
import { auditThresholds, runLighthouseAudit } from "../utils/lighthouseUtils";

test("main page loads correctly and displays expected sections", async ({ page }, testInfo) => {
  const mainPage = new MainPage(page);

  await mainPage.goto();

  await mainPage.verifyMainPage();

  await expect(mainPage.getCreateNewCaseButton()).toBeVisible();

  await runAxeAnalyze(page, testInfo.title);
  await runLighthouseAudit(page, "lighthouse-invalid-search-report", auditThresholds, "invalid search results");
});

test("clicking on a task navigates to the details page", async ({ page }, testInfo) => {
  const mainPage = new MainPage(page);

  await mainPage.goto();

  await mainPage.verifyMainPage();

  const taskLinkHref = await mainPage.clickFirstTaskLink();

  expect(page.url(), "Expected URL to contain the taskLink's href after clicking").toContain(taskLinkHref);

  await runAxeAnalyze(mainPage.page, testInfo.title);
  await runLighthouseAudit(mainPage.page, testInfo.title, auditThresholds, "invalid search results");
});

test("search for a valid ID and verify results", async ({ page }, testInfo) => {
  const mainPage = new MainPage(page);
  const searchResultsPage = new SearchResultsPage(page);

  await mainPage.goto();

  await mainPage.search(USER_ID_VALID);

  await searchResultsPage.verifyValidSearchResults(USER_ID_VALID);

  await runAxeAnalyze(page, testInfo.title);
  await runLighthouseAudit(page, testInfo.title, auditThresholds, "invalid search results");
});

test("search for invalid ID and verify error message", async ({ page }, testInfo) => {
  const mainPage = new MainPage(page);
  const searchResultsPage = new SearchResultsPage(page);

  await mainPage.goto();

  await mainPage.search(USER_ID_INVALID);

  await searchResultsPage.verifyInvalidSearchResults(USER_ID_INVALID);

  await runAxeAnalyze(page, testInfo.title);
  await runLighthouseAudit(page, testInfo.title, auditThresholds, "invalid search results");
});

test("clicking the 'Opprett ny sak/behandling' button navigates to the create new case page", async ({
  page,
}, testInfo) => {
  const mainPage = new MainPage(page);
  const newCasePage = new NewCasePage(page);

  await mainPage.goto();

  await mainPage.clickCreateNewCaseButton();

  await newCasePage.verifyAllElements();

  await runAxeAnalyze(page, testInfo.title);
  await runLighthouseAudit(page, testInfo.title, auditThresholds, "invalid search results");
});
