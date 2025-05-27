import { expect, Page } from "@playwright/test";

/**
 * Helper function to search for an ID
 * @param page - The Playwright page object
 * @param id - The ID to search for
 */
export async function mainPageSearch(page: Page, id: string): Promise<void> {
  // Navigate to the homepage
  await page.goto("/");

  // Wait for the page to load
  await page.waitForLoadState("networkidle");

  // Check that the search form is visible
  await expect(page.locator("form.sokeskjema")).toBeVisible();

  // Find the search input field and enter the search term
  const searchInput = page.locator("form.sokeskjema input[type='text']");

  // If the search input is not found, it's an error
  const searchInputCount = await searchInput.count();
  expect(searchInputCount > 0, "Search input field 'Søk sak:' not found").toBeTruthy();

  // Fill the search input with the provided ID
  await searchInput.fill(id);

  // Find the search button and click it
  const searchButton = page.locator("form.sokeskjema .sokeskjema__knapp button");

  // If the search button is not found, it's an error
  const searchButtonCount = await searchButton.count();
  expect(searchButtonCount > 0, "Search button not found").toBeTruthy();

  // Click the search button
  await searchButton.click();

  // Wait for the search results to load
  await page.waitForLoadState("networkidle");
}
