import { expect, test } from "@playwright/test";
import { mainPageSearch, USER_ID_INVALID, USER_ID_VALID } from "./testUtils";
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

  // Check that the "Opprett ny sak/behandling" button is present in the header
  await expect(page.locator("button:has-text('Opprett ny sak/behandling')")).toBeVisible();

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
  await mainPageSearch(page, USER_ID_VALID);

  // Verify that we're on the search results page
  await expect(page).toHaveURL("/melosys/sok");
  await expect(page.locator("h1:has-text('Saksoversikt')")).toBeVisible();

  // Verify that the search results show the correct ID
  await expect(page.locator(`h2:has-text('Resultater for f.nr./d-nr. ${USER_ID_VALID}')`)).toBeVisible();

  // Verify that the "no results" message does NOT appear
  await expect(page.locator(`text=Fant ingen saker knyttet til f.nr./d-nr. ${USER_ID_VALID}`)).not.toBeVisible();

  // Verify that at least one search result is displayed
  await expect(page.locator(".fagsak")).toBeVisible();

  await runAxeAnalyze(page, testInfo.title);
});

test("@accessibility search for invalid ID and verify error message", async ({ page }, testInfo) => {
  await page.goto("/");

  // Use a clearly invalid ID that doesn't match any valid pattern
  await mainPageSearch(page, USER_ID_INVALID);

  // Verify that we're on the search results page
  await expect(page).toHaveURL("/melosys/sok");
  await expect(page.locator("h1:has-text('Saksoversikt')")).toBeVisible();

  // Verify that the search results show the correct ID
  await expect(page.locator(`h2:has-text('Resultater for saksnummer ${USER_ID_INVALID}')`)).toBeVisible();

  // Verify that the "no results" message is displayed
  await expect(page.locator(`text=Fant ingen saker knyttet til saksnummer ${USER_ID_INVALID}`)).toBeVisible();

  await runAxeAnalyze(page, testInfo.title);
});

test("@accessibility clicking the 'Opprett ny sak/behandling' button navigates to the create new case page", async ({
  page,
}, testInfo) => {
  await page.goto("/");

  // Wait for the page to load
  await page.waitForLoadState("networkidle");

  // Find and click the "Opprett ny sak/behandling" button
  const createButton = page.locator("button:has-text('Opprett ny sak/behandling')");
  await expect(createButton).toBeVisible();
  await createButton.click();

  // Wait for navigation to complete
  await page.waitForLoadState("networkidle");

  // Verify that we've navigated to the create new case page
  await expect(page).toHaveURL("/melosys/opprettnysak");

  // Verify that the main elements are present on the create new case page

  // Check for the radion button group "Hvem skal saken opprettes på?"
  await expect(page.locator(".opprettnysak .undertittel:has-text('Hvem skal saken opprettes på?')")).toBeVisible();
  await expect(page.locator(".opprettnysak .navds-radio__content:has-text('Bruker')")).toBeVisible();
  await expect(page.locator(".opprettnysak .navds-radio__content:has-text('Virksomhet')")).toBeVisible();
  await expect(page.locator(".opprettnysak .navds-radio input[value='BRUKER']")).toBeChecked();

  // Check for the input field "Informasjon om bruker"
  await expect(page.locator(".opprettnysak .undertittel:has-text('Informasjon om bruker')")).toBeVisible();
  await expect(page.locator(".opprettnysak label:has-text('Brukers f.nr. eller d-nr.:')")).toBeVisible();
  await expect(page.locator(".opprettnysak input[name='brukerID']")).toBeVisible();

  // Check for the checkbox "Legg behandlingen i mine oppgaver" which should be unchecked
  await expect(page.locator(".navds-checkbox:has-text('Legg behandlingen i mine oppgaver')")).toBeVisible();
  await expect(page.locator("input[name='skalTilordnes']")).not.toBeChecked();

  // Check for the primary button "Opprett ny behandling" and the tertiary button "Avbryt"
  await expect(page.locator("button:has-text('Opprett ny behandling')")).toBeVisible();
  await expect(page.locator("button:has-text('Avbryt')")).toBeVisible();

  await runAxeAnalyze(page, testInfo.title);
});
