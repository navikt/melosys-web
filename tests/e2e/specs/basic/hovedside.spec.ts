import { expect, test } from "@playwright/test";
import { runAxeAnalyze } from "../../utils/axeUtils";
import { HovedsidePage } from "../../pages/hovedside.page";

test("Hovedsiden lastes korrekt og viser forventede seksjoner", async ({ page }, testInfo) => {
  const mainPage = new HovedsidePage(page);

  await mainPage.goto();

  await mainPage.verifiserHovedside();

  await expect(mainPage.page.locator("button:has-text('Opprett ny sak/behandling')")).toBeVisible();

  await runAxeAnalyze(page, testInfo.title);
});
