import { test } from "../../recording/fixtures";
import { HovedsidePage } from "../../pages/hovedside.page";

test("Hovedsiden lastes korrekt og viser forventede seksjoner", async ({ page, apiRecorder }, testInfo) => {
  const mainPage = new HovedsidePage(page);

  await mainPage.goto();

  await mainPage.verifiserOpprettNySakKnapp();
});
