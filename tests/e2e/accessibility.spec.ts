import { expect, test } from "@playwright/test";
import { mainPageSearch, USER_ID_INVALID, USER_ID_VALID } from "./testUtils";
import { runAxeAnalyze } from "./axeUtils";

test("@accessibility main page should have no accessibility violations (Axe)", async ({ page }, testInfo) => {
  await page.goto("/");

  await runAxeAnalyze(page, testInfo.title);
});

test("@accessibility search result with valid ID should have no accessibility violations (Axe)", async ({
  page,
}, testInfo) => {
  // Use the helper function to search for a valid ID
  await mainPageSearch(page, USER_ID_VALID);

  // Verify that we're on the search results page
  await expect(page).toHaveURL("/melosys/sok");
  await expect(page.locator("h1:has-text('Saksoversikt')")).toBeVisible();

  await runAxeAnalyze(page, testInfo.title);
});

test("@accessibility search result with invalid ID should have no accessibility violations (Axe)", async ({
  page,
}, testInfo) => {
  // Use a clearly invalid ID that doesn't match any valid pattern
  // Use the helper function to search for the invalid ID
  await mainPageSearch(page, USER_ID_INVALID);

  // Verify that we're on the search results page
  await expect(page).toHaveURL("/melosys/sok");
  await expect(page.locator("h1:has-text('Saksoversikt')")).toBeVisible();

  await runAxeAnalyze(page, testInfo.title);
});
