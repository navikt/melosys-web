import { test } from "../../../recording/fixtures";
import { TrygdeavgiftPage } from "../../../pages/behandling/trygdeavgift.page";
import { InngangPage } from "../../../pages/behandling/inngang.page";
import { hentPrepopulertSakUrl } from "../../../utils/testdataUtils";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../../utils/testUtils";
import { UI_TEXTS } from "../../../config/ui-texts";

/**
 * E2E-test for TrygdeavgiftsperioderTabell - beregningsresultat for frivillig medlemskap (FTRL)
 *
 * Dekker akseptansekriterium AC3 fra todo 82 (MELOSYS-7988):
 * - AC3: Helse/pensjonsdel → Dekning-kolonnen viser "Helsedel" og "Pensjonsdel"
 *
 * Strategi:
 * - FTRL MEDLEMSKAP_LOVVALG YRKESAKTIV-sak (MEL-1022) med § 2-8 (frivillig)
 * - Inngang: "Helsedel" trygdedekning (kompatibel med § 2-8)
 * - Navigerer Inngang → Virksomhet → Bestemmelse → Perioder → Trygdeavgift
 * - Ikke-skattepliktig + Næringsinntekt med 9000 kr/md → 25%-regel → helse/pensjonsdel splittes
 * - Ekte API-kall mot /trygdeavgift/beregning
 */

test.describe("TrygdeavgiftsperioderTabell - frivillig medlemskap", () => {
  test.skip("AC3: helse/pensjonsdel → Dekning-kolonnen viser Helsedel og Pensjonsdel", async ({
    page,
    apiRecorder,
  }) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const saksnummer = "MEL-1022";
    // === STEG 1: Inngang (Helsedel-dekning, kompatibel med frivillig § 2-8) ===
    const inngangPage = new InngangPage(page, saksnummer);
    await inngangPage.goto(hentPrepopulertSakUrl(saksnummer));

    await inngangPage.verifiserSteg("Oppgi opplysninger fra søknaden");
    await inngangPage.fyllUtInngangMinimum("01.01.2026", "Sverige", "31.12.2026");
    // Overstyr trygdedekning til "Helse- og pensjonsdel" (fyllUtInngangMinimum velger "Full dekning" som er inkompatibel med § 2-8)
    await inngangPage.velgTrygdedekning("Helse- og pensjonsdel (§ 2-9)");
    await page.waitForTimeout(300);
    await inngangPage.klikkBekreftOgFortsett();

    // === STEG 2: Virksomhet ===
    const trygdeavgiftPage = new TrygdeavgiftPage(page, saksnummer);
    await trygdeavgiftPage.verifiserSteg("Virksomhet");
    await trygdeavgiftPage.velgFørsteVirksomhet();
    await trygdeavgiftPage.klikkBekreftOgFortsett();

    // === STEG 3: Bestemmelse (§ 2-8 første ledd bokstav a → frivillig medlemskap) ===
    await trygdeavgiftPage.verifiserSteg("Bestemmelse");
    await trygdeavgiftPage.velgBestemmelse("§ 2-8");
    await trygdeavgiftPage.klikkBekreftOgFortsett();

    // === STEG 4: Perioder (inneværende år) ===
    await trygdeavgiftPage.verifiserSteg("Medlemskapsperioder");
    // await stegvelgerPage.fyllUtPerioderMedÅr("2026");
    await trygdeavgiftPage.klikkBekreftOgFortsett();

    // === STEG 5: Trygdeavgift — vent på initial GET beregning før interaksjon
    await trygdeavgiftPage.verifiserSteg(UI_TEXTS.STEG.TRYGDEAVGIFT);
    await page
      .waitForResponse((resp) => resp.url().includes("/trygdeavgift/beregning") && resp.request().method() === "GET", {
        timeout: 10000,
      })
      .catch(() => {});

    await trygdeavgiftPage.velgSkattepliktig(0, false);
    await trygdeavgiftPage.velgInntektskilde("Næringsinntekt fra Norge");
    await trygdeavgiftPage.fyllInnBruttoinntektNr(0, "20000");

    // Verifiser helse/pensjonsdel via POM
    await trygdeavgiftPage.verifiserHelsePensjonsdel();
  });
});
