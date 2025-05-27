import { test, expect } from "@playwright/test";
import { searchFor, runAxeAnalyze } from "./testUtils";

test("main page should have no accessibility violations (Axe)", async ({ page }, testInfo) => {
  await page.goto("/");

  const accessibilityViolations = await runAxeAnalyze(page, testInfo.title);
  expect(accessibilityViolations).toBe("");
});

test("search result with valid ID should have no accessibility violations (Axe)", async ({ page }, testInfo) => {
  // Use the helper function to search for a valid ID
  await searchFor(page, "30056928150");

  // Verify that we're on the search results page
  await expect(page).toHaveURL("/melosys/sok");
  await expect(page.locator("h1:has-text('Saksoversikt')")).toBeVisible();

  const accessibilityViolations = await runAxeAnalyze(page, testInfo.title);
  expect(accessibilityViolations).toBe("");
});

test("search result with invalid ID should have no accessibility violations (Axe)", async ({ page }, testInfo) => {
  // Use a clearly invalid ID that doesn't match any valid pattern
  const invalidID = "INVALID123";

  // Use the helper function to search for the invalid ID
  await searchFor(page, invalidID);

  // Verify that we're on the search results page
  await expect(page).toHaveURL("/melosys/sok");
  await expect(page.locator("h1:has-text('Saksoversikt')")).toBeVisible();

  const accessibilityViolations = await runAxeAnalyze(page, testInfo.title);
  expect(accessibilityViolations).toBe("");
});
