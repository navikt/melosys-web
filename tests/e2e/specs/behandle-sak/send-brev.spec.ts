import { test, Page } from "@playwright/test";
import { SendBrevPage } from "../../pages/behandling/send-brev.page";
import { assertErrors } from "../../utils/testUtils";
import { SokPage } from "../../pages/sok.page";
import { BehandlingPage } from "../../pages/behandling/behandling.page";
import { runAxeAnalyze } from "../../utils/axeUtils";
import { opprettAvtalelandSak, opprettUtenforAvtalelandSakMedAarsavregning } from "../../utils/testdataUtils";

let sb: SendBrevPage;

// Gjenbrukbar setup-funksjon som oppretter egen testdata
async function setupSendBrevTest(page: Page) {
  const sokPage = new SokPage(page);
  const behandlingPage = new BehandlingPage(page);
  sb = new SendBrevPage(page);

  // Opprett egen Avtaleland-sak for denne testen
  const sak = await opprettAvtalelandSak(page);

  await sokPage.klikkVisBehandling(sak);
  await behandlingPage.verifiserBehandlingsside();

  await page.waitForLoadState("domcontentloaded");
  await sb.clickSendBrevTab();
}

test.describe("Verifiser disable/enable av 'Send brev' knapp", () => {
  test.beforeEach(async ({ page }) => {
    await setupSendBrevTest(page);
  });

  test("'Send brev' knappen er disabled når hverken mottaker eller brevmal er valgt ", async ({ page }, testInfo) => {
    await sb.assertSendButtonDisabled();
    await runAxeAnalyze(page, testInfo.title);
  });

  test("'Send brev' knappen er disabled når mottaker er valgt men ikke brevmal", async ({ page }, testInfo) => {
    await sb.selectFirstMottaker();
    await sb.assertSendButtonDisabled();
    await runAxeAnalyze(page, testInfo.title);
  });

  test("'Send brev' knappen blir enabled når både mottaker og brevmal er valgt", async ({ page }, testInfo) => {
    await sb.selectFirstMottaker();
    await sb.selectFirstBrevmal();
    await sb.assertSendButtonEnabled();
    await runAxeAnalyze(page, testInfo.title);
  });
});

test.describe("Validering av brevmaler for mottaker 'Bruker eller brukers fullmektig'", () => {
  test.beforeEach(async ({ page }) => {
    await setupSendBrevTest(page);
  });

  test("Korrekt validering for brevmal 'Melding om manglende opplysninger til bruker'", async ({ page }, testInfo) => {
    await sb.selectMottakerByLabel("Bruker eller brukers fullmektig");
    await sb.selectBrevmalByLabel("Melding om manglende opplysninger til bruker");
    await sb.clickSendBrev();

    await assertErrors(page, [
      "Du må skrive inn innledningstekst i fritekstfeltet",
      "Du må skrive inn hva mottaker skal sende inn",
    ]);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Korrekt validering for brevmal 'Fritekstbrev til bruker'", async ({ page }, testInfo) => {
    await sb.selectMottakerByLabel("Bruker eller brukers fullmektig");
    await sb.selectBrevmalByLabel("Fritekstbrev til bruker");
    await sb.clickSendBrev();

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
    test.setTimeout(60000); // Økt timeout siden vi oppretter sak med årsavregning
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);
    sb = new SendBrevPage(page);

    // Opprett egen FTRL-sak med årsavregning for denne testen
    const sak = await opprettUtenforAvtalelandSakMedAarsavregning(page);

    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    await page.waitForLoadState("domcontentloaded");
    await sb.clickSendBrevTab();

    await sb.selectMottakerByLabel("Bruker eller brukers fullmektig");
    await sb.selectBrevmalByLabel("Innhenting av inntektsopplysninger for årsavregning");
    await sb.clickSendBrev();

    await assertErrors(page, ["Du må velge minst én av standardtekst eller fritekst"]);

    await runAxeAnalyze(page, testInfo.title);
  });
});
