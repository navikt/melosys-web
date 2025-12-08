import { test } from "@playwright/test";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../../utils/testUtils";
import { hentPrepopulertSakUrl } from "../../../utils/testdataUtils";
import { runAxeAnalyze } from "../../../utils/axeUtils";
import { StegvelgerPage } from "../../../pages/behandling/stegvelger.page";

/**
 * E2E-tester for Stegvelger i EU/EØS IKKE_YRKESAKTIV saksbehandling
 *
 * For IKKE_YRKESAKTIV vises et skjema i Inngang-steget med:
 * - Fra og med (fom) - påkrevd
 * - Til og med (tom) - valgfri
 * - Land - påkrevd
 *
 * "Bekreft og fortsett" er deaktivert inntil skjemaet er gyldig utfylt.
 */
test.describe("EU/EØS Stegvelger - Navigasjon", () => {
  test("EU/EØS Ikke yrkesaktiv - Navigasjon gjennom steg med minimum input", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
    const saksnummer = "MEL-1052";
    const stegvelgerPage = new StegvelgerPage(page, saksnummer);

    const url = hentPrepopulertSakUrl(saksnummer);
    await stegvelgerPage.goto(url);

    // === STEG 1: Inngang ===
    await stegvelgerPage.verifiserSteg(/inngang|opplysninger/i);
    await stegvelgerPage.verifiserAntallSteg(1);
    await stegvelgerPage.verifiserBekreftKnappDeaktivert();

    // Fyll ut minimum: fom-dato og land
    await stegvelgerPage.fyllUtEosIkkeYrkesaktivInngang("01.01.2024", "Sverige");
    await stegvelgerPage.verifiserBekreftKnappAktivert();
    await stegvelgerPage.bekreftOgFortsett();

    // === STEG 2: Neste steg ===
    await stegvelgerPage.verifiserAntallSteg(2);
    // Verifiser at vi har navigert videre (ikke lenger på Inngang)
    await stegvelgerPage.verifiserSteg(new RegExp(`^(?!.*inngang).*$`, "i"));

    await runAxeAnalyze(page, testInfo.title);
  });

  test("EU/EØS Ikke yrkesaktiv - Navigasjon frem og tilbake", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
    const saksnummer = "MEL-1052";
    const stegvelgerPage = new StegvelgerPage(page, saksnummer);

    const url = hentPrepopulertSakUrl(saksnummer);
    await stegvelgerPage.goto(url);

    // Start på Inngang
    await stegvelgerPage.verifiserSteg(/inngang|opplysninger/i);
    await stegvelgerPage.verifiserAntallSteg(1);

    // Fyll ut og gå videre
    await stegvelgerPage.fyllUtEosIkkeYrkesaktivInngang("01.01.2024", "Sverige");
    await stegvelgerPage.bekreftOgFortsett();

    // Hent tittel på neste steg
    const andreStegTittel = await stegvelgerPage.hentStegTittel();
    await stegvelgerPage.verifiserAntallSteg(2);

    // Gå tilbake til Inngang via Tilbake-knapp
    await stegvelgerPage.gåTilbake();
    await stegvelgerPage.verifiserSteg(/inngang|opplysninger/i);
    await stegvelgerPage.verifiserAntallSteg(2); // Progressbar beholder 2 steg

    // Gå frem igjen via Bekreft-knapp
    await stegvelgerPage.bekreftOgFortsett();
    await stegvelgerPage.verifiserSteg(new RegExp(andreStegTittel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
    await stegvelgerPage.verifiserAntallSteg(2);

    // Gå tilbake via klikk på steg 1 i progressbar
    await stegvelgerPage.klikkPåSteg(1);
    await stegvelgerPage.verifiserSteg(/inngang|opplysninger/i);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("EU/EØS Ikke yrkesaktiv - Bekreft-knapp forblir deaktivert ved ugyldig input", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
    const saksnummer = "MEL-1053";
    const stegvelgerPage = new StegvelgerPage(page, saksnummer);

    const url = hentPrepopulertSakUrl(saksnummer);
    await stegvelgerPage.goto(url);

    await stegvelgerPage.verifiserSteg(/inngang|opplysninger/i);

    // Knappen skal være deaktivert ved start
    await stegvelgerPage.verifiserBekreftKnappDeaktivert();

    // Fyll ut kun dato (uten land) - knappen bør fortsatt være deaktivert
    const fomInput = page.getByLabel(/fra og med/i);
    await fomInput.fill("01.01.2024");
    await page.waitForTimeout(500);

    // Knappen skal fortsatt være deaktivert siden land mangler
    await stegvelgerPage.verifiserBekreftKnappDeaktivert();

    await runAxeAnalyze(page, testInfo.title);
  });
});
