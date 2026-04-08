import { test } from "../../../recording/fixtures";
import { TrygdeavgiftPage } from "../../../pages/behandling/trygdeavgift.page";
import { InngangPage } from "../../../pages/behandling/inngang.page";
import { hentPrepopulertSakUrl } from "../../../utils/testdataUtils";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../../utils/testUtils";
import { UI_TEXTS } from "../../../config/ui-texts";

/**
 * E2E-test for TrygdeavgiftsperioderTabell - beregningsresultat for frivillig medlemskap (FTRL)
 *
 * Dekker akseptansekriterium AC3 fra MELOSYS-7989:
 * - AC3: Helse/pensjonsdel → Dekning-kolonnen viser "Helsedel" og "Pensjonsdel"
 *
 * Tester:
 * - FTRL YRKESAKTIV (MEL-1022): Inngang → Virksomhet → Bestemmelse → Perioder → Trygdeavgift
 *
 * Strategi:
 * - Frivillig § 2-8 med "Helse- og pensjonsdel" trygdedekning
 * - Ikke-skattepliktig + Næringsinntekt → 25%-regel → helse/pensjonsdel splittes
 * - Ekte API-kall mot /trygdeavgift/beregning
 *
 * NB: FTRL PENSJONIST mangler prepopulert testdata-sak (alle FTRL-saker er YRKESAKTIV)
 */

test.describe("TrygdeavgiftsperioderTabell - frivillig medlemskap", () => {
  /**
   * Navigerer gjennom FTRL-stegvelgeren: Inngang → Virksomhet → Bestemmelse → Perioder → Trygdeavgift
   * Setter opp § 2-8 (frivillig) med "Helse- og pensjonsdel" trygdedekning
   */
  async function navigerFtrlTilTrygdeavgift(
    page: import("@playwright/test").Page,
    saksnummer: "MEL-1022",
  ): Promise<TrygdeavgiftPage> {
    const inngangPage = new InngangPage(page, saksnummer);
    await inngangPage.goto(hentPrepopulertSakUrl(saksnummer));

    await inngangPage.verifiserSteg("Oppgi opplysninger fra søknaden");
    await inngangPage.fyllUtInngangMinimum("01.01.2026", "Sverige", "31.12.2026");
    await inngangPage.velgTrygdedekning("Helse- og pensjonsdel (§ 2-9)");
    await page.waitForTimeout(300);
    await inngangPage.klikkBekreftOgFortsett();

    const trygdeavgiftPage = new TrygdeavgiftPage(page, saksnummer);
    await trygdeavgiftPage.verifiserSteg("Virksomhet");
    await trygdeavgiftPage.velgFørsteVirksomhet();
    await trygdeavgiftPage.klikkBekreftOgFortsett();

    await trygdeavgiftPage.verifiserSteg("Bestemmelse");
    await trygdeavgiftPage.velgBestemmelse("§ 2-8");
    await trygdeavgiftPage.klikkBekreftOgFortsett();

    await trygdeavgiftPage.verifiserSteg("Medlemskapsperioder");
    await trygdeavgiftPage.klikkBekreftOgFortsett();

    await trygdeavgiftPage.verifiserSteg(UI_TEXTS.STEG.TRYGDEAVGIFT);
    await page
      .waitForResponse((resp) => resp.url().includes("/trygdeavgift/beregning") && resp.request().method() === "GET", {
        timeout: 10000,
      })
      .catch(() => {});

    return trygdeavgiftPage;
  }

  test("FTRL Yrkesaktiv AC3: helse/pensjonsdel → Dekning-kolonnen viser Helsedel og Pensjonsdel", async ({
    page,
    apiRecorder,
  }) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const trygdeavgiftPage = await navigerFtrlTilTrygdeavgift(page, "MEL-1022");

    await trygdeavgiftPage.velgSkattepliktig(0, false);
    await trygdeavgiftPage.velgInntektskilde("Næringsinntekt fra Norge");
    await trygdeavgiftPage.fyllInnBruttoinntektOgVentPåBeregning("20000");

    await trygdeavgiftPage.verifiserHelsePensjonsdel();
  });
});
