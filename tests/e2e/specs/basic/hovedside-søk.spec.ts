import { test } from "../../recording/fixtures";
import { HovedsidePage, USER_ID_INVALID, USER_ID_VALID } from "../../pages/hovedside.page";
import { SokPage } from "../../pages/sok.page";

test("Søk etter gyldig ID og verifiser resultater", async ({ page, apiRecorder }, testInfo) => {
  const mainPage = new HovedsidePage(page);

  await mainPage.goto();
  const searchResultsPage = new SokPage(page);

  await mainPage.søk(USER_ID_VALID);

  await searchResultsPage.verifiserGyldigeSøkeresultater(USER_ID_VALID);
});

test("Søk etter ugyldig ID og verifiser feilmelding", async ({ page, apiRecorder }, testInfo) => {
  const mainPage = new HovedsidePage(page);
  const searchResultsPage = new SokPage(page);

  await mainPage.goto();

  await mainPage.søk(USER_ID_INVALID);

  await searchResultsPage.verifiserUgyldigeSøkeresultater(USER_ID_INVALID);
});
