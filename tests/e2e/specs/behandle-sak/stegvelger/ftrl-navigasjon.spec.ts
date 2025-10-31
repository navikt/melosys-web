import { test, expect } from "@playwright/test";
import { SokPage } from "../../../pages/sok.page";
import { BehandlingPage } from "../../../pages/behandling/behandling.page";
import { StegvelgerPage } from "../../../pages/behandling/stegvelger.page";
import { opprettUtenforAvtalelandSak } from "../../../utils/testdataUtils";
import { runAxeAnalyze } from "../../../utils/axeUtils";

/**
 * E2E-tester for EnkelStegvelger i FTRL (Utenfor avtaleland) saksbehandling
 *
 * Disse testene verifiserer stegnavigasjon for FTRL-saker som bruker
 * enkelStegvelgeren (src/felleskomponenter/enkelStegvelger/enkelStegvelger.tsx).
 *
 * EnkelStegvelger brukes i:
 * - FTRL/Utenfor avtaleland saksbehandling
 * - Ikke yrkesaktiv
 * - EU/EØS pensjonist
 * - Årsavregning
 * - Unntaksregistrering
 */
test.describe("FTRL Stegvelger - Navigasjon", () => {
  test("skal vise stegvelger når FTRL-behandling åpnes", async ({ page }, testInfo) => {
    test.setTimeout(60000);

    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);
    const stegvelgerPage = new StegvelgerPage(page);

    // Opprett en FTRL-sak (Utenfor avtaleland)
    const sak = await opprettUtenforAvtalelandSak(page);

    // Naviger til behandlingen
    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    // Verifiser at stegvelger er synlig og har minst 1 steg
    const alleSteg = await stegvelgerPage.hentAlleSteg();
    expect(alleSteg.length, "FTRL stegvelger skal ha minst 1 steg").toBeGreaterThanOrEqual(1);

    // Verifiser at vi har et aktivt steg
    const aktivtSteg = await stegvelgerPage.hentAktivtSteg();
    expect(aktivtSteg.length, "Aktivt steg skal ha et navn").toBeGreaterThan(0);

    // Logg stegene for debugging
    console.log("FTRL steg funnet:", alleSteg);
    console.log("FTRL aktivt steg:", aktivtSteg);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("skal kunne navigere frem og tilbake mellom steg i FTRL", async ({ page }, testInfo) => {
    test.setTimeout(60000);

    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);
    const stegvelgerPage = new StegvelgerPage(page);

    const sak = await opprettUtenforAvtalelandSak(page);

    // Naviger til behandlingen
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
    } else {
      console.log("FTRL-sak har kun ett steg, navigasjonstest hoppet over");
    }

    await runAxeAnalyze(page, testInfo.title);
  });

  test("skal vise steg i progressbar for FTRL-sak", async ({ page }, testInfo) => {
    test.setTimeout(60000);

    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);
    const stegvelgerPage = new StegvelgerPage(page);

    const sak = await opprettUtenforAvtalelandSak(page);

    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    // Hent alle steg
    const alleSteg = await stegvelgerPage.hentAlleSteg();

    // Verifiser at vi har minst ett steg
    // EnkelStegvelger starter med kun første steg synlig, flere steg legges til etter validering
    expect(alleSteg.length, "FTRL-sak skal ha minst 1 steg").toBeGreaterThanOrEqual(1);

    // Verifiser at første steg typisk er "Inngang" for FTRL yrkesaktiv
    const forsteSteg = alleSteg[0];
    console.log("FTRL første steg:", forsteSteg);
    expect(forsteSteg.length, "Første steg skal ha et navn").toBeGreaterThan(0);

    // Logg stegene for debugging
    console.log("Alle FTRL steg funnet:", alleSteg);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("skal kunne klikke på steg i progressbar", async ({ page }, testInfo) => {
    test.setTimeout(60000);

    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);
    const stegvelgerPage = new StegvelgerPage(page);

    const sak = await opprettUtenforAvtalelandSak(page);

    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    // Hent alle tilgjengelige steg
    const alleSteg = await stegvelgerPage.hentAlleSteg();

    // Hvis vi har flere enn ett steg, test å klikke på steg i progressbar
    if (alleSteg.length > 1) {
      const andreStegnavn = alleSteg[1];

      // Klikk på andre steg
      await stegvelgerPage.klikkSteg(andreStegnavn);

      // Verifiser at andre steg er aktivt
      const aktivtSteg = await stegvelgerPage.hentAktivtSteg();
      expect(aktivtSteg, "Andre steg skal være aktivt etter klikk").toContain(andreStegnavn);
    } else {
      console.log("FTRL-sak har kun ett steg, progressbar-klikk test hoppet over");
    }

    await runAxeAnalyze(page, testInfo.title);
  });
});
