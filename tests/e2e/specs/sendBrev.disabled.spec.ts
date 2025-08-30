import { test } from "@playwright/test";
import { MelosysHovedsidePage } from "../pages/melosys-hovedside.page";
import { SendBrevPage } from "../pages/sendBrev.page";

let sb: SendBrevPage;

test.describe("SendBrev - disabled/enabled state", () => {
  test.beforeEach(async ({ page }) => {
    const mainPage = new MelosysHovedsidePage(page);
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

  test("knappen er disabled når ingenting er valgt (mangler mottaker og brevmal)", async () => {
    await sb.assertSendButtonDisabled();
  });

  test("knappen er disabled når mottaker er valgt men brevmal ikke er valgt", async () => {
    await sb.selectFirstMottaker();
    await sb.assertSendButtonDisabled();
  });

  test("knappen blir enabled når både mottaker og brevmal er valgt (sanity)", async () => {
    await sb.selectFirstMottaker();
    await sb.selectFirstBrevmal();
    await sb.assertSendButtonEnabled();
  });
});
