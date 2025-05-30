import { expect, test } from "@playwright/test";
import { runAxeAnalyze } from "./axeUtils";
import { MainPage, USER_ID_INVALID, USER_ID_VALID } from "./pages/main.page";
import { auditThresholds, runLighthouseAudit } from "./lighthouseUtils";

test("@accessibility main page loads correctly and displays expected sections", async ({ page }, testInfo) => {
  const mainPage = new MainPage(page);

  await mainPage.goto();

  // Verify that we are on the main page with all expected elements
  await mainPage.verifyMainPage();

  // Check that the "Opprett ny sak/behandling" button is present in the header
  await expect(mainPage.getCreateNewCaseButton()).toBeVisible();

  await runAxeAnalyze(page, testInfo.title);
  await runLighthouseAudit(page, "lighthouse-invalid-search-report", auditThresholds, "invalid search results");
});

test("@accessibility clicking on a task navigates to the details page", async ({ page }, testInfo) => {
  const mainPage = new MainPage(page);

  await mainPage.goto();

  await mainPage.verifyMainPage();

  // Click on the first task link and get its href
  const taskLinkHref = await mainPage.clickFirstTaskLink();

  // Verify that we've navigated to a URL that contains the taskLink
  expect(page.url(), "Expected URL to contain the taskLink's href after clicking").toContain(taskLinkHref);

  await runAxeAnalyze(mainPage.page, testInfo.title);
  await runLighthouseAudit(mainPage.page, testInfo.title, auditThresholds, "invalid search results");
});

test("@accessibility search for a valid ID and verify results", async ({ page }, testInfo) => {
  const mainPage = new MainPage(page);

  await mainPage.goto();

  await mainPage.search(USER_ID_VALID);

  await mainPage.verifyValidSearchResults(USER_ID_VALID);

  await runAxeAnalyze(mainPage.page, testInfo.title);
  await runLighthouseAudit(mainPage.page, testInfo.title, auditThresholds, "invalid search results");
});

test("@accessibility search for invalid ID and verify error message", async ({ page }, testInfo) => {
  const mainPage = new MainPage(page);

  await mainPage.goto();

  await mainPage.search(USER_ID_INVALID);

  await mainPage.verifyInvalidSearchResults(USER_ID_INVALID);

  await runAxeAnalyze(mainPage.page, testInfo.title);
  await runLighthouseAudit(mainPage.page, testInfo.title, auditThresholds, "invalid search results");
});

test("@accessibility clicking the 'Opprett ny sak/behandling' button navigates to the create new case page", async ({
  page,
}, testInfo) => {
  const mainPage = new MainPage(page);

  await mainPage.goto();

  await mainPage.clickCreateNewCaseButton();

  await expect(page).toHaveURL("/melosys/opprettnysak");

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

  await runAxeAnalyze(mainPage.page, testInfo.title);
  await runLighthouseAudit(mainPage.page, testInfo.title, auditThresholds, "invalid search results");
});
