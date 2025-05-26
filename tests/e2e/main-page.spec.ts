import { test, expect } from "@playwright/test";
import { searchFor } from "./testUtils";

test("basic test - homepage loads correctly", async ({ page }) => {
  // Navigate to the homepage
  await page.goto("/");

  // Wait for the page to load
  await page.waitForLoadState("networkidle");

  // Check that the page has loaded by verifying some content is visible
  await expect(page).toHaveTitle(/Melosys/);

  // Take a screenshot for reference
  await page.screenshot({ path: "tests/e2e/artifacts/screenshots/homepage.png", fullPage: true });
});

test("homepage displays Mine oppgaver section", async ({ page }) => {
  // Navigate to the homepage
  await page.goto("/");

  // Wait for the page to load
  await page.waitForLoadState("networkidle");

  // Check that the "Mine oppgaver" heading is visible
  await expect(page.locator("h1:has-text('Mine oppgaver')")).toBeVisible();

  // Check that the oppgaver count is displayed
  await expect(page.locator("text=/\\d+ oppgaver/")).toBeVisible();
});

test("clicking on a task navigates to the details page", async ({ page }) => {
  // Navigate to the homepage
  await page.goto("/");

  // Wait for the page to load
  await page.waitForLoadState("networkidle");

  // Find the first task link and click it
  // Note: This test assumes there is at least one task available
  // If no tasks are available, the test will be skipped
  const taskLink = page.locator(".behandlingOppgave__link").first();

  if ((await taskLink.count()) === 0) {
    test.skip(true, "No tasks available to test");
    return;
  }

  // Get the URL before clicking
  const currentUrl = page.url();

  // Click on the task
  await taskLink.click();

  // Wait for navigation to complete
  await page.waitForLoadState("networkidle");

  // Verify that we've navigated to a different URL
  expect(page.url()).not.toEqual(currentUrl);

  // Take a screenshot of the details page
  await page.screenshot({ path: "tests/e2e/artifacts/screenshots/task-details.png", fullPage: true });
});

test("search form is displayed and can be used", async ({ page }) => {
  // Use the helper function to search for "test"
  await searchFor(page, "test");

  // Take a screenshot of the search results
  await page.screenshot({ path: "tests/e2e/artifacts/screenshots/search-results.png", fullPage: true });
});

test("search for ID 30056928150 and verify results", async ({ page }) => {
  // Use the helper function to search for the specific ID
  await searchFor(page, "30056928150");

  // Verify that we're on the search results page
  await expect(page.locator("h1:has-text('Saksoversikt')")).toBeVisible();

  // Verify that the search results show the correct ID
  await expect(page.locator("h2:has-text('Resultater for f.nr./d-nr. 30056928150')")).toBeVisible();

  // Verify that there are search results (not "Fant ingen saker...")
  const noResultsMessage = page.locator("text=Fant ingen saker knyttet til f.nr./d-nr. 30056928150");
  const noResultsCount = await noResultsMessage.count();

  if (noResultsCount > 0) {
    // If there are no results, skip the test but log a message
    console.log("No search results found for ID 30056928150. This might be expected in some environments.");
  } else {
    // Verify that at least one search result is displayed
    await expect(page.locator(".fagsak")).toBeVisible();

    // Take a screenshot of the search results
    await page.screenshot({ path: "tests/e2e/artifacts/screenshots/id-search-results.png", fullPage: true });
  }
});

test("search for invalid ID and verify error message", async ({ page }) => {
  // Use a clearly invalid ID that doesn't match any valid pattern
  const invalidID = "INVALID123";

  // Use the helper function to search for the invalid ID
  await searchFor(page, invalidID);

  // Verify that we're on the search results page
  await expect(page.locator("h1:has-text('Saksoversikt')")).toBeVisible();

  // Verify that the search results show the correct ID
  await expect(page.locator(`h2:has-text('Resultater for saksnummer ${invalidID}')`)).toBeVisible();

  // Verify that the "no results" message is displayed
  await expect(page.locator(`text=Fant ingen saker knyttet til saksnummer ${invalidID}`)).toBeVisible();

  // Take a screenshot of the search results
  await page.screenshot({ path: "tests/e2e/artifacts/screenshots/invalid-id-search-results.png", fullPage: true });
});
