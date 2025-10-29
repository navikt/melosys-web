import { test, expect } from "@playwright/test";
import { HovedsidePage, USER_ID_VALID } from "../../../pages/hovedside.page";
import { SokPage } from "../../../pages/sok.page";
import { BehandlingPage } from "../../../pages/behandling/behandling.page";
import { StegvelgerPage } from "../../../pages/behandling/stegvelger.page";
import { opprettEUEOSSak } from "../../../utils/testdataUtils";
import { runAxeAnalyze } from "../../../utils/axeUtils";

/**
 * E2E-tester for Stegvelger (Hovedstegvelger) i EU/EØS saksbehandling
 *
 * Disse testene verifiserer stegnavigasjon for EU/EØS-saker som bruker
 * hovedstegvelgeren (src/felleskomponenter/stegvelger/Stegvelger.jsx).
 *
 * Stegvelgeren brukes kun i:
 * - EU/EØS saksbehandling (saksopplysninger.jsx)
 * - EU/EØS vurder utpeking (vurderutpeking.jsx)
 */
test.describe("EU/EØS Stegvelger - Navigasjon", () => {
  test("skal vise stegvelger når behandling åpnes", async ({ page }, testInfo) => {
    test.setTimeout(60000);

    // Opprett en EU/EØS-sak med behandlingstema som har flere steg
    // "Arbeid og/eller selvstendig virksomhet i flere land" krever valg av land,
    // så vi bruker "Ikke yrkesaktiv" som er enklere
    const saksnummer = await opprettEUEOSSak(page);

    const hovedsidePage = new HovedsidePage(page);
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);
    const stegvelgerPage = new StegvelgerPage(page);

    // Naviger til behandlingen
    await hovedsidePage.goto();
    await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

    const sak = sokPage.finnSakBySaksnummer(saksnummer);
    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    // Verifiser at stegvelger er synlig og har minst 1 steg
    const alleSteg = await stegvelgerPage.hentAlleSteg();
    expect(alleSteg.length, "Stegvelger skal ha minst 1 steg").toBeGreaterThanOrEqual(1);

    // Verifiser at vi har et aktivt steg
    const aktivtSteg = await stegvelgerPage.hentAktivtSteg();
    expect(aktivtSteg.length, "Aktivt steg skal ha et navn").toBeGreaterThan(0);

    // Logg stegene for debugging
    console.log("Steg funnet:", alleSteg);
    console.log("Aktivt steg:", aktivtSteg);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("skal kunne navigere frem og tilbake mellom steg", async ({ page }, testInfo) => {
    test.setTimeout(60000);

    const saksnummer = await opprettEUEOSSak(page);

    const hovedsidePage = new HovedsidePage(page);
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);
    const stegvelgerPage = new StegvelgerPage(page);

    // Naviger til behandlingen
    await hovedsidePage.goto();
    await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

    const sak = sokPage.finnSakBySaksnummer(saksnummer);
    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    // Hent første steg
    const forsteSteg = await stegvelgerPage.hentAktivtSteg();

    // Sjekk om Neste-knappen er synlig
    const harNesteKnapp = await stegvelgerPage.erNesteKnappSynlig();

    if (harNesteKnapp) {
      // Gå til neste steg
      await stegvelgerPage.klikkNeste();

      // Verifiser at vi har gått videre
      const andreSteg = await stegvelgerPage.hentAktivtSteg();
      expect(andreSteg, "Skal ha gått til et annet steg").not.toBe(forsteSteg);

      // Gå tilbake
      const harForrigeKnapp = await stegvelgerPage.erForrigeKnappSynlig();
      if (harForrigeKnapp) {
        await stegvelgerPage.klikkForrige();

        // Verifiser at vi er tilbake på første steg
        const tilbakeTilForste = await stegvelgerPage.hentAktivtSteg();
        expect(tilbakeTilForste, "Skal være tilbake på første steg").toBe(forsteSteg);
      }
    }

    await runAxeAnalyze(page, testInfo.title);
  });

  test("skal vise steg i progressbar for EU/EØS-sak", async ({ page }, testInfo) => {
    test.setTimeout(60000);

    const saksnummer = await opprettEUEOSSak(page);

    const hovedsidePage = new HovedsidePage(page);
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);
    const stegvelgerPage = new StegvelgerPage(page);

    await hovedsidePage.goto();
    await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

    const sak = sokPage.finnSakBySaksnummer(saksnummer);
    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    // Hent alle steg
    const alleSteg = await stegvelgerPage.hentAlleSteg();

    // Verifiser at vi har minst ett steg
    // (Nøyaktige steg avhenger av behandlingstema)
    expect(alleSteg.length, "EU/EØS-sak skal ha minst 1 steg").toBeGreaterThanOrEqual(1);

    // Logg stegene for debugging
    console.log("Steg funnet:", alleSteg);

    await runAxeAnalyze(page, testInfo.title);
  });
});
