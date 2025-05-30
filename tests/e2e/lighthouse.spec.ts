import { test } from "@playwright/test";
import { auditThresholds, runLighthouseAudit } from "./lighthouseUtils";
import { MainPage, USER_ID_INVALID, USER_ID_VALID } from "./pages/main.page";

test("main page should pass Lighthouse audits", async ({ page, browser }) => {
  const context = await browser.newContext();
  const mainPage = new MainPage(page);

  await mainPage.goto();

  await mainPage.verifyMainPage();

  await runLighthouseAudit(mainPage.page, "lighthouse-main-page-report", auditThresholds);

  await context.close();
});

test("search results with valid ID should pass Lighthouse audits", async ({ page, browser }) => {
  const context = await browser.newContext();
  const mainPage = new MainPage(page);

  await mainPage.goto();

  await mainPage.verifyMainPage();

  await mainPage.search(USER_ID_VALID);

  await mainPage.verifyValidSearchResults(USER_ID_VALID);

  await runLighthouseAudit(page, "lighthouse-valid-search-report", auditThresholds, "valid search results");

  await context.close();
});

test("search results with invalid ID should pass Lighthouse audits", async ({ page, browser }) => {
  const context = await browser.newContext();
  const mainPage = new MainPage(page);

  await mainPage.goto();

  await mainPage.verifyMainPage();

  await mainPage.search(USER_ID_INVALID);

  await mainPage.verifyInvalidSearchResults(USER_ID_INVALID);

  await runLighthouseAudit(page, "lighthouse-invalid-search-report", auditThresholds, "invalid search results");

  await context.close();
});
