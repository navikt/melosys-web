import { test } from "../../recording/fixtures";
import { SendBrevPage } from "../../pages/behandling/send-brev.page";
import { assertErrors, TIMEOUT_FOR_COMPLEX_TESTS } from "../../utils/testUtils";
import { hentPrepopulertSakUrl, PrepopulertSaksnummer } from "../../utils/testdataUtils";
import { Page } from "@playwright/test";

/**
 * Gjenbrukbar setup-funksjon som oppretter egen testdata
 * Returnerer sendBrevPage for å unngå race conditions ved parallell kjøring
 */
async function setupSendBrevTest(page: Page, saksnummer: PrepopulertSaksnummer): Promise<SendBrevPage> {
  const sendBrevPage = new SendBrevPage(page, saksnummer);

  // Hent URL til prepopulert Avtaleland-sak og naviger direkte dit
  const url = hentPrepopulertSakUrl(saksnummer);
  await sendBrevPage.goto(url);

  await page.waitForLoadState("domcontentloaded");
  await sendBrevPage.clickSendBrevTab();

  return sendBrevPage;
}

test.describe("Verifiser disable/enable av 'Send brev' knapp", () => {
  test("'Send brev' knappen er disabled når hverken mottaker eller brevmal er valgt ", async ({
    page,
    apiRecorder,
  }, testInfo) => {
    const sendBrevPage = await setupSendBrevTest(page, "MEL-1003");
    await sendBrevPage.verifiserSendKnappDeaktivert();
  });

  test("'Send brev' knappen er disabled når mottaker er valgt men ikke brevmal", async ({
    page,
    apiRecorder,
  }, testInfo) => {
    const sendBrevPage = await setupSendBrevTest(page, "MEL-1004");
    await sendBrevPage.selectFirstMottaker();
    await sendBrevPage.verifiserSendKnappDeaktivert();
  });

  test("'Send brev' knappen blir enabled når både mottaker og brevmal er valgt", async ({
    page,
    apiRecorder,
  }, testInfo) => {
    const sendBrevPage = await setupSendBrevTest(page, "MEL-1005");
    await sendBrevPage.selectFirstMottaker();
    await sendBrevPage.selectFirstBrevmal();
    await sendBrevPage.verifiserSendKnappAktivert();
  });
});

test.describe("Validering av brevmaler for mottaker 'Bruker eller brukers fullmektig'", () => {
  test("Korrekt validering for brevmal 'Melding om manglende opplysninger til bruker'", async ({
    page,
    apiRecorder,
  }, testInfo) => {
    const sendBrevPage = await setupSendBrevTest(page, "MEL-1006");
    await sendBrevPage.selectMottakerByLabel("Bruker eller brukers fullmektig");
    await sendBrevPage.selectBrevmalByLabel("Melding om manglende opplysninger til bruker");
    await sendBrevPage.clickSendBrev();

    await assertErrors(page, [
      "Du må velge minst én av standardtekst eller fritekst",
      "Du må skrive inn hva mottaker skal sende inn",
    ]);
  });

  test("Korrekt validering for brevmal 'Fritekstbrev til bruker'", async ({ page, apiRecorder }, testInfo) => {
    const sendBrevPage = await setupSendBrevTest(page, "MEL-1007");
    await sendBrevPage.selectMottakerByLabel("Bruker eller brukers fullmektig");
    await sendBrevPage.selectBrevmalByLabel("Fritekstbrev til bruker");
    await sendBrevPage.clickSendBrev();

    await assertErrors(page, [
      "Du må velge overskrift til brevet",
      "Du må skrive inn hovedtekst til brevet",
      "Du må velge type brev",
    ]);
  });
});

test.describe("Validering av årsavregning brevmaler", () => {
  // Skip: Pre-existing test failure - årsavregning brevmal validation issue
  // Fails in both record and playback modes (not mock server related)
  // TODO: Create JIRA ticket and fix the underlying issue
  test("Korrekt validering for brevmal 'Innhenting av inntektsopplysninger for årsavregning'", async ({
    page,
    apiRecorder,
  }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter sak med årsavregning
    const saksnummer = "MEL-1023";
    const sendBrevPage = new SendBrevPage(page, saksnummer);

    // Hent URL til prepopulert FTRL-sak med årsavregning og naviger direkte dit
    const url = hentPrepopulertSakUrl(saksnummer);
    await sendBrevPage.goto(url);

    await page.waitForLoadState("domcontentloaded");
    await sendBrevPage.clickSendBrevTab();

    await sendBrevPage.selectMottakerByLabel("Bruker eller brukers fullmektig");
    await sendBrevPage.selectBrevmalByLabel("Innhenting av inntektsopplysninger for årsavregning");
    await sendBrevPage.clickSendBrev();

    await assertErrors(page, ["Du må velge minst én av standardtekst eller fritekst"]);
  });
});
