import { test, expect } from "@playwright/test";
import { generateReportPaths, runLighthouseAudit, searchFor } from "./testUtils";

const auditThresholds = {
  "best-practices": 100,
  seo: 100,
};

test("main page should pass Lighthouse audits", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("/");

  // Verify that we are on the main page
  await expect(page).toHaveURL("/melosys");

  const reportInfo = generateReportPaths("lighthouse-main-page-report");

  await runLighthouseAudit(page, reportInfo, auditThresholds);

  await context.close();
});

test("search results with valid ID should pass Lighthouse audits", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  // Use the helper function to search for a valid ID
  await searchFor(page, "30056928150");

  // Verify that we're on the search results page
  await expect(page).toHaveURL("/melosys/sok");
  await expect(page.locator("h1:has-text('Saksoversikt')")).toBeVisible();

  const reportInfo = generateReportPaths("lighthouse-valid-search-report");

  await runLighthouseAudit(page, reportInfo, auditThresholds, "valid search results");

  await context.close();
});

test("search results with invalid ID should pass Lighthouse audits", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  // Use a clearly invalid ID that doesn't match any valid pattern
  const invalidID = "INVALID123";

  // Use the helper function to search for the invalid ID
  await searchFor(page, invalidID);

  // Verify that we're on the search results page
  await expect(page).toHaveURL("/melosys/sok");
  await expect(page.locator("h1:has-text('Saksoversikt')")).toBeVisible();

  const reportInfo = generateReportPaths("lighthouse-invalid-search-report");

  await runLighthouseAudit(page, reportInfo, auditThresholds, "invalid search results");

  await context.close();
});
