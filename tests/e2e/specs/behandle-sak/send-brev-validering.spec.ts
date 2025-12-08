import { Page, test } from "@playwright/test";
import { SendBrevPage } from "../../pages/behandling/send-brev.page";
import { assertErrors, TIMEOUT_FOR_COMPLEX_TESTS } from "../../utils/testUtils";
import { runAxeAnalyze } from "../../utils/axeUtils";
import { hentPrepopulertSakUrl } from "../../utils/testdataUtils";

let sendBrevPage: SendBrevPage;

// Gjenbrukbar setup-funksjon som oppretter egen testdata
async function setupSendBrevTest(page: Page, saksnummer: string) {
  sendBrevPage = new SendBrevPage(page, saksnummer);

  // Hent URL til prepopulert Avtaleland-sak og naviger direkte dit
  const url = hentPrepopulertSakUrl(saksnummer);
  await sendBrevPage.goto(url);

  await page.waitForLoadState("domcontentloaded");
  await sendBrevPage.clickSendBrevTab();
}

test.describe("Verifiser disable/enable av 'Send brev' knapp", () => {
  test("'Send brev' knappen er disabled når hverken mottaker eller brevmal er valgt ", async ({ page }, testInfo) => {
    await setupSendBrevTest(page, "MEL-1003");
    await sendBrevPage.verifiserSendKnappDeaktivert();
    await runAxeAnalyze(page, testInfo.title);
  });

  test("'Send brev' knappen er disabled når mottaker er valgt men ikke brevmal", async ({ page }, testInfo) => {
    await setupSendBrevTest(page, "MEL-1004");
    await sendBrevPage.selectFirstMottaker();
    await sendBrevPage.verifiserSendKnappDeaktivert();
    await runAxeAnalyze(page, testInfo.title);
  });

  test("'Send brev' knappen blir enabled når både mottaker og brevmal er valgt", async ({ page }, testInfo) => {
    await setupSendBrevTest(page, "MEL-1005");
    await sendBrevPage.selectFirstMottaker();
    await sendBrevPage.selectFirstBrevmal();
    await sendBrevPage.verifiserSendKnappAktivert();
    await runAxeAnalyze(page, testInfo.title);
  });
});

test.describe("Validering av brevmaler for mottaker 'Bruker eller brukers fullmektig'", () => {
  test("Korrekt validering for brevmal 'Melding om manglende opplysninger til bruker'", async ({ page }, testInfo) => {
    await setupSendBrevTest(page, "MEL-1006");
    await sendBrevPage.selectMottakerByLabel("Bruker eller brukers fullmektig");
    await sendBrevPage.selectBrevmalByLabel("Melding om manglende opplysninger til bruker");
    await sendBrevPage.clickSendBrev();

    await assertErrors(page, [
      "Du må velge minst én av standardtekst eller fritekst",
      "Du må skrive inn hva mottaker skal sende inn",
    ]);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Korrekt validering for brevmal 'Fritekstbrev til bruker'", async ({ page }, testInfo) => {
    await setupSendBrevTest(page, "MEL-1007");
    await sendBrevPage.selectMottakerByLabel("Bruker eller brukers fullmektig");
    await sendBrevPage.selectBrevmalByLabel("Fritekstbrev til bruker");
    await sendBrevPage.clickSendBrev();

    await assertErrors(page, [
      "Du må velge overskrift til brevet",
      "Du må skrive inn hovedtekst til brevet",
      "Du må velge type brev",
    ]);

    await runAxeAnalyze(page, testInfo.title);
  });
});

test.describe("Validering av årsavregning brevmaler", () => {
  test("Korrekt validering for brevmal 'Innhenting av inntektsopplysninger for årsavregning'", async ({
    page,
  }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter sak med årsavregning
    const saksnummer = "MEL-1023";
    sendBrevPage = new SendBrevPage(page, saksnummer);

    // Hent URL til prepopulert FTRL-sak med årsavregning og naviger direkte dit
    const url = hentPrepopulertSakUrl(saksnummer);
    await sendBrevPage.goto(url);

    await page.waitForLoadState("domcontentloaded");
    await sendBrevPage.clickSendBrevTab();

    await sendBrevPage.selectMottakerByLabel("Bruker eller brukers fullmektig");
    await sendBrevPage.selectBrevmalByLabel("Innhenting av inntektsopplysninger for årsavregning");
    await sendBrevPage.clickSendBrev();

    await assertErrors(page, ["Du må velge minst én av standardtekst eller fritekst"]);

    await runAxeAnalyze(page, testInfo.title);
  });
});
