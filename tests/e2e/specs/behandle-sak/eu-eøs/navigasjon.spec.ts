import { test } from "../../../recording/fixtures";
import { TIMEOUT_FOR_COMPLEX_TESTS, setDatoFelt } from "../../../utils/testUtils";
import { hentPrepopulertSakUrl } from "../../../utils/testdataUtils";
import { StegvelgerPage } from "../../../pages/behandling/stegvelger.page";
import { UI_TEXTS } from "../../../config/ui-texts";

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
  test("EU/EØS Ikke yrkesaktiv - Navigasjon gjennom steg med minimum input", async ({
    page,
    apiRecorder,
  }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
    const saksnummer = "MEL-1052";
    const stegvelgerPage = new StegvelgerPage(page, saksnummer);

    const url = hentPrepopulertSakUrl(saksnummer);
    await stegvelgerPage.goto(url);

    // === STEG 1: Inngang ===
    await stegvelgerPage.verifiserSteg(UI_TEXTS.STEG.OPPGI_OPPLYSNINGER);

    // Fyll ut minimum: fom-dato og land (metoden sjekker selv om data allerede er utfylt)
    await stegvelgerPage.fyllUtEosIkkeYrkesaktivInngang("01.01.2024", "Sverige");
    await stegvelgerPage.verifiserBekreftKnappAktivert();
    await stegvelgerPage.klikkBekreftOgFortsett();

    // === STEG 2: Neste steg ===
    // Verifiser at vi har navigert videre (ikke lenger på Inngang)
    await stegvelgerPage.verifiserSteg(UI_TEXTS.STEG.BESTEMMELSE_OG_VURDERING);
  });

  test("EU/EØS Ikke yrkesaktiv - Navigasjon frem og tilbake", async ({ page, apiRecorder }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
    const saksnummer = "MEL-1051";
    const stegvelgerPage = new StegvelgerPage(page, saksnummer);

    const url = hentPrepopulertSakUrl(saksnummer);
    await stegvelgerPage.goto(url);

    // Start på Inngang
    await stegvelgerPage.verifiserSteg(UI_TEXTS.STEG.OPPGI_OPPLYSNINGER);

    // Fyll ut og gå videre
    await stegvelgerPage.fyllUtEosIkkeYrkesaktivInngang("01.01.2024", "Sverige");
    await stegvelgerPage.klikkBekreftOgFortsett();

    // Hent tittel på neste steg
    const andreStegTittel = await stegvelgerPage.hentStegTittel();

    // Gå tilbake til Inngang via Tilbake-knapp
    await stegvelgerPage.gåTilbake();
    await stegvelgerPage.verifiserSteg(UI_TEXTS.STEG.OPPGI_OPPLYSNINGER);

    // Gå frem igjen via Bekreft-knapp
    await stegvelgerPage.klikkBekreftOgFortsett();
    await stegvelgerPage.verifiserSteg(andreStegTittel);

    // Gå tilbake via klikk på steg 1 i progressbar
    await stegvelgerPage.klikkPåSteg(1);
    await stegvelgerPage.verifiserSteg(UI_TEXTS.STEG.OPPGI_OPPLYSNINGER);
  });

  test("EU/EØS Ikke yrkesaktiv - Bekreft-knapp forblir deaktivert ved ugyldig input", async ({
    page,
    apiRecorder,
  }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);
    const saksnummer = "MEL-1053";
    const stegvelgerPage = new StegvelgerPage(page, saksnummer);

    const url = hentPrepopulertSakUrl(saksnummer);
    await stegvelgerPage.goto(url);

    await stegvelgerPage.verifiserSteg(UI_TEXTS.STEG.OPPGI_OPPLYSNINGER);

    // Knappen skal være deaktivert ved start
    await stegvelgerPage.verifiserBekreftOgFortsettKnappDeaktivert();

    // Fyll ut kun dato (uten land) - knappen bør fortsatt være deaktivert
    await setDatoFelt("Fra og med", "01.01.2024", page);

    // Wait for form validation to complete
    await page
      .waitForFunction(
        () => {
          const buttons = Array.from(document.querySelectorAll("button"));
          return buttons.some((btn) => btn.textContent?.includes("Bekreft og fortsett"));
        },
        { timeout: 2000 },
      )
      .catch(() => {});

    // Knappen skal fortsatt være deaktivert siden land mangler
    await stegvelgerPage.verifiserBekreftOgFortsettKnappDeaktivert();
  });
});
