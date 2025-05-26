import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import { generateReportPaths, runLighthouseAudit, searchFor } from "./testUtils";

const BASE_URL = "http://localhost:3000";

// Define thresholds for Lighthouse audits
const auditThresholds = {
  "best-practices": 100,
  seo: 100,
};

test("main page should have no accessibility violations on homepage (Axe)", async ({ page }) => {
  await page.goto(BASE_URL);

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

  expect(results.violations).toEqual([]);
});

test("search result should have no accessibility violations on search results with valid ID (Axe)", async ({
  page,
}) => {
  // Use the helper function to search for a valid ID
  await searchFor(page, "30056928150");

  // Verify that we're on the search results page
  await expect(page.locator("h1:has-text('Saksoversikt')")).toBeVisible();

  // Run accessibility tests
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

  expect(results.violations).toEqual([]);
});

test("search result should have no accessibility violations on search results with invalid ID (Axe)", async ({
  page,
}) => {
  // Use a clearly invalid ID that doesn't match any valid pattern
  const invalidID = "INVALID123";

  // Use the helper function to search for the invalid ID
  await searchFor(page, invalidID);

  // Verify that we're on the search results page
  await expect(page.locator("h1:has-text('Saksoversikt')")).toBeVisible();

  // Run accessibility tests
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

  expect(results.violations).toEqual([]);
});

test("main page should pass Lighthouse audits (SEO, best-practices)", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(BASE_URL);

  // Generate report paths
  const reportInfo = generateReportPaths("lighthouse-report");

  // Run the Lighthouse audit
  await runLighthouseAudit(page, reportInfo, auditThresholds);

  await context.close();
});

test("search results with valid ID should pass Lighthouse audits (SEO, best-practices)", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  // Use the helper function to search for a valid ID
  await searchFor(page, "30056928150");

  // Verify that we're on the search results page
  await expect(page.locator("h1:has-text('Saksoversikt')")).toBeVisible();

  // Generate report paths
  const reportInfo = generateReportPaths("lighthouse-valid-search-report");

  // Run the Lighthouse audit
  await runLighthouseAudit(page, reportInfo, auditThresholds, "valid search results");

  await context.close();
});

test("search results with invalid ID should pass Lighthouse audits (SEO, best-practices)", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  // Use a clearly invalid ID that doesn't match any valid pattern
  const invalidID = "INVALID123";

  // Use the helper function to search for the invalid ID
  await searchFor(page, invalidID);

  // Verify that we're on the search results page
  await expect(page.locator("h1:has-text('Saksoversikt')")).toBeVisible();

  // Generate report paths
  const reportInfo = generateReportPaths("lighthouse-invalid-search-report");

  // Run the Lighthouse audit
  await runLighthouseAudit(page, reportInfo, auditThresholds, "invalid search results");

  await context.close();
});
