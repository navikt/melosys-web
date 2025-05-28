import { expect, test } from "@playwright/test";
import { mainPageSearch } from "./testUtils";
import { runAxeAnalyze } from "./axeUtils";

test("@accessibility main page loads correctly and displays expected sections", async ({ page }, testInfo) => {
  await page.goto("/");

  // Wait for the page to load
  await page.waitForLoadState("networkidle");

  // Verify that we are on the main page
  await expect(page).toHaveURL("/melosys");
  await expect(page).toHaveTitle(/Melosys/);

  // Check that the "Mine oppgaver" heading is visible
  await expect(page.locator("h1:has-text('Mine oppgaver')")).toBeVisible();

  // Check that the oppgaver count is displayed
  await expect(page.locator("text=/\\d+ oppgaver/")).toBeVisible();

  await runAxeAnalyze(page, testInfo.title);
});

test("@accessibility clicking on a task navigates to the details page", async ({ page }, testInfo) => {
  await page.goto("/");

  // Wait for the page to load
  await page.waitForLoadState("networkidle");

  // Find the first task link and click it
  // Note: This test assumes there is at least one task available. If no tasks are available, the test will fail
  const taskLink = page.locator(".behandlingOppgave__link").first();

  // Ensure there is at least one task available
  await expect(taskLink, "No tasks available to test").toHaveCount(1);

  // Get the taskLink's href attribute
  const taskLinkHref = await taskLink.getAttribute("href");

  // Click on the task
  await taskLink.click();

  // Wait for navigation to complete
  await page.waitForLoadState("networkidle");

  // Verify that we've navigated to a URL that contains the taskLink
  expect(page.url(), "Expected URL to contain the taskLink's href after clicking").toContain(taskLinkHref);

  await runAxeAnalyze(page, testInfo.title);
});

test("@accessibility search for a valid ID and verify results", async ({ page }, testInfo) => {
  await page.goto("/");

  // Use the helper function to search for the specific ID
  await mainPageSearch(page, "30056928150");

  // Verify that we're on the search results page
  await expect(page).toHaveURL("/melosys/sok");
  await expect(page.locator("h1:has-text('Saksoversikt')")).toBeVisible();

  // Verify that the search results show the correct ID
  await expect(page.locator("h2:has-text('Resultater for f.nr./d-nr. 30056928150')")).toBeVisible();

  // Verify that the "no results" message does NOT appear
  await expect(page.locator(`text=Fant ingen saker knyttet til f.nr./d-nr. 30056928150`)).not.toBeVisible();

  // Verify that at least one search result is displayed
  await expect(page.locator(".fagsak")).toBeVisible();

  await runAxeAnalyze(page, testInfo.title);
});

test("@accessibility search for invalid ID and verify error message", async ({ page }, testInfo) => {
  await page.goto("/");

  // Use a clearly invalid ID that doesn't match any valid pattern
  await mainPageSearch(page, "INVALID123");

  // Verify that we're on the search results page
  await expect(page).toHaveURL("/melosys/sok");
  await expect(page.locator("h1:has-text('Saksoversikt')")).toBeVisible();

  // Verify that the search results show the correct ID
  await expect(page.locator(`h2:has-text('Resultater for saksnummer INVALID123')`)).toBeVisible();

  // Verify that the "no results" message is displayed
  await expect(page.locator(`text=Fant ingen saker knyttet til saksnummer INVALID123`)).toBeVisible();

  await runAxeAnalyze(page, testInfo.title);
});
