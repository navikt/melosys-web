import { test } from "@playwright/test";
import { HovedsidePage } from "../pages/hovedside.page";
import { SendBrevPage } from "../pages/send-brev.page";

let sb: SendBrevPage;

// Gjenbrukbar setup-funksjon
async function setupSendBrevTest(page: any) {
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

  test("Korrekt validering for brevmal 'Melding om manglende opplysninger til bruker'", async () => {
    await sb.selectMottakerByLabel("Bruker eller brukers fullmektig");
    await sb.selectBrevmalByLabel("Melding om manglende opplysninger til bruker");
    await sb.clickSendBrev();

    // Verifiser feilmeldinger ved feltene
    await sb.assertFieldError("Innledningstekst", "Du må skrive inn innledningstekst i fritekstfeltet");
    await sb.assertFieldError("Hva skal mottakeren sende inn?", "Du må skrive inn hva mottaker skal sende inn");

    // Verifiser at samme feilmeldinger vises i oppsummeringen
    await sb.assertSummaryErrors([
      "Du må skrive inn innledningstekst i fritekstfeltet",
      "Du må skrive inn hva mottaker skal sende inn",
    ]);
  });

  test("Korrekt validering for brevmal 'Fritekstbrev til bruker'", async () => {
    await sb.selectMottakerByLabel("Bruker eller brukers fullmektig");
    await sb.selectBrevmalByLabel("Fritekstbrev til bruker");
    await sb.clickSendBrev();

    // Verifiser feilmeldinger ved feltene
    await sb.assertFieldError("Hovedtekst til brev", "Du må skrive inn hovedtekst til brevet");
    await sb.assertFieldError("Type brev", "Du må velge type brev");

    // Verifiser at samme feilmeldinger vises i oppsummeringen
    await sb.assertSummaryErrors([
      "Du må velge overskrift til brevet",
      "Du må skrive inn hovedtekst til brevet",
      "Du må velge type brev",
    ]);
  });

  test("Korrekt validering for brevmal 'Innhenting av inntektsopplysninger for årsavregning'", async () => {
    await sb.selectMottakerByLabel("Bruker eller brukers fullmektig");
    await sb.selectBrevmalByLabel("Innhenting av inntektsopplysninger for årsavregning");
    await sb.clickSendBrev();

    // Verifiser feilmeldinger ved feltene
    await sb.assertFieldError("standardtekst eller fritekst", "Du må velge minst én av standardtekst eller fritekst");

    // Verifiser at samme feilmeldinger vises i oppsummeringen
    await sb.assertSummaryErrors(["Du må velge minst én av standardtekst eller fritekst"]);
  });
});
