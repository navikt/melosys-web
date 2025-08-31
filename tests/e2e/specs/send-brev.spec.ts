import { test } from "@playwright/test";
import { HovedsidePage } from "../pages/hovedside.page";
import { SendBrevPage } from "../pages/send-brev.page";

let sb: SendBrevPage;

test.describe("Send brev - disabled/enabled state", () => {
  test.beforeEach(async ({ page }) => {
    const mainPage = new HovedsidePage(page);
    sb = new SendBrevPage(page);

    // 1) Åpne hovedside og velg første sak
    await mainPage.goto();
    await mainPage.verifyMainPage();
    await mainPage.clickFirstTaskLink();

    // 2) (Valgfritt) mock for stabilitet
    // await sb.mockInitialApis();

    // 3) Åpne "Send brev"-fanen i høyre kolonne
    await sb.clickSendBrevTab();
  });

  test("'Send brev' knappen er disabled når hverken mottaker og brevmal er valgt ", async () => {
    await sb.assertSendButtonDisabled();
  });

  test("'Send brev' knappen er disabled når mottaker er valgt men ikke brevmal", async () => {
    await sb.selectFirstMottaker();
    await sb.assertSendButtonDisabled();
  });

  test("'Send brev' knappen blir enabled når både mottaker og brevmal er valgt", async () => {
    await sb.selectFirstMottaker();
    await sb.selectFirstBrevmal();
    await sb.assertSendButtonEnabled();
  });
});
