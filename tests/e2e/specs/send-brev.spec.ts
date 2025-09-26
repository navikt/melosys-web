import { test } from "@playwright/test";
import { HovedsidePage, USER_ID_VALID } from "../pages/hovedside.page";
import { SendBrevPage } from "../pages/send-brev.page";
import { assertErrors } from "../utils/testUtils";

let sb: SendBrevPage;

// Gjenbrukbar setup-funksjon
async function setupSendBrevTest(page: any) {
  const mainPage = new HovedsidePage(page);
  sb = new SendBrevPage(page);

  // 1) Åpne hovedside og velg første "Yrkesaktiv" sak (brukersak)
  await mainPage.goto();
  await mainPage.verifiserHovedside();
  await mainPage.visSak(USER_ID_VALID, "Yrkesaktiv - Årsavregning");
  await sb.clickSendBrevTab();
}

test.describe("Verifiser disable/enable av 'Send brev' knapp", () => {
  test.beforeEach(async ({ page }) => {
    await setupSendBrevTest(page);
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

test.describe("Validering av brevmaler for mottaker 'Bruker eller brukers fullmektig'", () => {
  test.beforeEach(async ({ page }) => {
    await setupSendBrevTest(page);
  });

  test("Korrekt validering for brevmal 'Melding om manglende opplysninger til bruker'", async ({ page }) => {
    await sb.selectMottakerByLabel("Bruker eller brukers fullmektig");
    await sb.selectBrevmalByLabel("Melding om manglende opplysninger til bruker");
    await sb.clickSendBrev();

    await assertErrors(page, [
      "Du må skrive inn innledningstekst i fritekstfeltet",
      "Du må skrive inn hva mottaker skal sende inn",
    ]);
  });

  test("Korrekt validering for brevmal 'Fritekstbrev til bruker'", async ({ page }) => {
    await sb.selectMottakerByLabel("Bruker eller brukers fullmektig");
    await sb.selectBrevmalByLabel("Fritekstbrev til bruker");
    await sb.clickSendBrev();

    await assertErrors(page, [
      "Du må velge overskrift til brevet",
      "Du må skrive inn hovedtekst til brevet",
      "Du må velge type brev",
    ]);
  });
});

test.describe("Validering av årsavregning brevmaler", () => {
  test("Korrekt validering for brevmal 'Innhenting av inntektsopplysninger for årsavregning'", async ({ page }) => {
    await setupSendBrevTest(page);
    await sb.selectMottakerByLabel("Bruker eller brukers fullmektig");
    await sb.selectBrevmalByLabel("Innhenting av inntektsopplysninger for årsavregning");
    await sb.clickSendBrev();

    await assertErrors(page, ["Du må velge minst én av standardtekst eller fritekst"]);
  });
});
