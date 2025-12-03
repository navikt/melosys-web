import { test } from "../../recording/fixtures";
import { runAxeAnalyze } from "../../utils/axeUtils";
import { HovedsidePage } from "../../pages/hovedside.page";
import { OpprettNySakPage } from "../../pages/opprett-ny-sak/opprett-ny-sak.page";
import { assertErrors } from "../../utils/testUtils";

let opprettNySakPage: OpprettNySakPage;

test.describe("'Opprett ny sak/behandling' hovedside", () => {
  test.beforeEach(async ({ page, apiRecorder }) => {
    const mainPage = new HovedsidePage(page);
    opprettNySakPage = new OpprettNySakPage(page);

    await mainPage.goto();
    await mainPage.klikkOpprettNySakKnapp();
  });
  test("Klikk på 'Opprett ny sak/behandling' og verifiser at alle forventede elementer er tilstede", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.verifiserAlleElementer();
    await runAxeAnalyze(page, testInfo.title);
  });

  test.skip("Klikk på 'Opprett ny behandling' når ingen påkrevde felter er fylt ut og verifiser feilmeldinger", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.klikkOpprettNyBehandling();
    await assertErrors(page, ["Skriv inn gyldig f.nr. eller d-nr."]);

    await runAxeAnalyze(page, testInfo.title);
  });
});
