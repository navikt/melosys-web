import { test, expect } from "@playwright/test";

test("basic test - homepage loads correctly", async ({ page }) => {
  // Navigate to the homepage
  await page.goto("/");

  // Wait for the page to load
  await page.waitForLoadState("networkidle");

  // Check that the page has loaded by verifying some content is visible
  // Note: You may need to adjust this selector based on your actual application structure
  await expect(page).toHaveTitle(/Melosys/);

  // Take a screenshot for reference
  await page.screenshot({ path: "tests/e2e/artifacts/screenshots/homepage.png", fullPage: true });
});
