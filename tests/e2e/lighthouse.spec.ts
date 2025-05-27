import { expect, test } from "@playwright/test";
import { mainPageSearch } from "./testUtils";
import { runLighthouseAudit } from "./lighthouseUtils";

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
  await expect(page).toHaveTitle(/Melosys/);

  await runLighthouseAudit(page, "lighthouse-main-page-report", auditThresholds);

  await context.close();
});

test("search results with valid ID should pass Lighthouse audits", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  // Use the helper function to search for a valid ID
  await mainPageSearch(page, "30056928150");

  // Verify that we're on the search results page
  await expect(page).toHaveURL("/melosys/sok");
  await expect(page.locator("h1:has-text('Saksoversikt')")).toBeVisible();

  await runLighthouseAudit(page, "lighthouse-valid-search-report", auditThresholds, "valid search results");

  await context.close();
});

test("search results with invalid ID should pass Lighthouse audits", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  // Use a clearly invalid ID that doesn't match any valid pattern
  // Use the helper function to search for the invalid ID
  await mainPageSearch(page, "INVALID123");

  // Verify that we're on the search results page
  await expect(page).toHaveURL("/melosys/sok");
  await expect(page.locator("h1:has-text('Saksoversikt')")).toBeVisible();

  await runLighthouseAudit(page, "lighthouse-invalid-search-report", auditThresholds, "invalid search results");

  await context.close();
});
