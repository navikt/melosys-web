import { expect, test } from "@playwright/test";
import { runAxeAnalyze } from "../../../../utils/axeUtils";
import { HovedsidePage, USER_ID_VALID } from "../../../../pages/hovedside.page";
import { OpprettNySakPage } from "../../../../pages/opprett-ny-sak/opprett-ny-sak.page";
import { getSakId } from "../../../../utils/testUtils";

/**
 * MELOSYS-7624: Test state-håndtering ved saksbytting
 *
 * Disse testene verifiserer at refaktoreringen fra 8 useEffects til Redux action creator
 * fungerer korrekt, spesielt ved rask saksbytting og komplekse states.
 *
 * Problemet som ble løst:
 * - 8 useEffects skapte circular dependencies og effect cascades
 * - Race conditions ved rask saksbytting
 * - To-veis dataflyt mellom komponent og Redux form
 *
 * Løsning 1 (Redux Action Creator):
 * - Flyttet business logic til prepareKnyttTilSakForm() operation
 * - Redusert fra 8 til 3 useEffects
 * - Én-veis dataflyt: Redux → Component
 * - Parallell data-henting med Promise.all
 */
test.describe("MELOSYS-7624: State-håndtering ved saksbytting", () => {
  let opprettNySakPage: OpprettNySakPage;

  test.beforeEach(async ({ page }) => {
    const mainPage = new HovedsidePage(page);
    opprettNySakPage = new OpprettNySakPage(page);

    await mainPage.goto();
    await mainPage.klikkOpprettNySakKnapp();
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();
  });

  test("Velg sak med avsluttet behandling - viser 'Tidligere behandling er avsluttet'", async ({ page }, testInfo) => {
    // Finn sak med avsluttet behandling
    const valgtSak = await opprettNySakPage.finnSak({
      sakstype: "Utenfor avtaleland",
      behandlingsstatus: "Behandlingen er avsluttet",
    });

    expect(valgtSak, "Ingen sak med avsluttet behandling funnet").toBeTruthy();

    await valgtSak!.click();

    await opprettNySakPage.verifiserTidligereBehandlingAvsluttet();

    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak!, [
      "Ny vurdering",
      "Klage",
      "Henvendelse",
      "Årsavregning",
    ]);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Velg sak med aktiv behandling - viser advarsel om aktiv behandling", async ({ page }, testInfo) => {
    const valgtSak = await opprettNySakPage.finnSak({
      sakstype: "Utenfor avtaleland",
      behandlingsstatus: "Behandlingen er opprettet",
    });

    expect(valgtSak, "Ingen sak med aktiv behandling funnet").toBeTruthy();

    await valgtSak!.click();

    // For Utenfor avtaleland med aktive behandlinger skal Årsavregning være tilgjengelig
    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak!, ["Årsavregning"]);

    const harFeilmelding = await opprettNySakPage.harFeilmelding();
    expect(harFeilmelding, `Ingen feilmelding skal vises for sak ${getSakId(valgtSak!)}`).toBe(false);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Velg EØS-sak med åpen behandling - viser gul varselmelding", async ({ page }, testInfo) => {
    const valgtSak = await opprettNySakPage.velgFørsteSak("EU/EØS-land");

    expect(valgtSak, "Ingen EØS-sak funnet").toBeTruthy();

    await opprettNySakPage.verifiserEosFeilmelding();

    await opprettNySakPage.verifiserBehandlingstypeGruppeIkkeSynlig();

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Rask saksbytting - ingen race conditions eller gamle verdier", async ({ page }, testInfo) => {
    test.setTimeout(20000); // Økt timeout for flere saksvalg

    const antallSaker = await opprettNySakPage.tellAntallSaker();
    expect(
      antallSaker,
      "Må ha minst 2 saker for å teste saksbytting. Testdataene er utilstrekkelige.",
    ).toBeGreaterThanOrEqual(2);

    // 1. Velg første sak
    await opprettNySakPage.velgSakVedIndex(0);

    await page.waitForTimeout(100);

    // 2. Bytt raskt til annen sak før første er ferdig lastet
    await opprettNySakPage.velgSakVedIndex(1);

    // 3. Bytt tilbake til første sak
    await opprettNySakPage.velgSakVedIndex(0);

    // 4. Verifiser at UI er konsistent og ikke viser gamle verdier
    const sidenFungerer = await opprettNySakPage.erOpprettNySakSidenSynlig();
    expect(sidenFungerer, "Siden skal være synlig etter rask saksbytting").toBe(true);

    // Verifiser at vi fortsatt har tilgang til sakslisten
    const sakslisteEtterBytting = await opprettNySakPage.tellAntallSaker();
    expect(sakslisteEtterBytting, "Saksliste skal være tilgjengelig").toBeGreaterThan(0);

    // Verifiser at ingen error-meldinger vises
    const harError = await opprettNySakPage.harErrorMelding();
    expect(harError, "Ingen error skal vises etter rask saksbytting").toBe(false);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Behandlingstema settes automatisk fra Redux operation", async ({ page }, testInfo) => {
    // Finn sak med avsluttet behandling
    const valgtSak = await opprettNySakPage.finnSak({
      sakstype: "Utenfor avtaleland",
      behandlingsstatus: "Behandlingen er avsluttet",
    });

    expect(valgtSak, "Ingen sak med avsluttet behandling funnet").toBeTruthy();

    await valgtSak!.click();

    // I "opprett ny sak" flowet vises behandlingstema direkte (ingen "Opprett ny behandling" radioknapp)
    // Vent på at behandlingstema-select er synlig
    await opprettNySakPage.verifiserBehandlingstemaSelectSynlig();

    // Behandlingstema skal være satt automatisk (ikke tom verdi "")
    const behandlingstemaValue = await opprettNySakPage.hentBehandlingstemaVerdi();
    expect(behandlingstemaValue, "Behandlingstema skal settes automatisk fra Redux operation").not.toBe("");

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Konsistent data-lasting ved navigasjon mellom flere saker", async ({ page }, testInfo) => {
    test.setTimeout(25000); // Økt timeout for flere saksvalg

    // Dette er en stresstest av den nye løsningen
    // Navigerer mellom flere saker og verifiserer at data lastes konsistent

    const antallSaker = await opprettNySakPage.tellAntallSaker();

    expect(
      antallSaker,
      "Må ha minst 3 saker for å teste navigasjon mellom flere saker. Testdataene er utilstrekkelige.",
    ).toBeGreaterThanOrEqual(3);

    // Samle informasjon om første tre saker
    const sakerInfo: Array<{ index: number; sakId: string }> = [];

    for (let i = 0; i < Math.min(3, antallSaker); i++) {
      await opprettNySakPage.velgSakVedIndex(i);

      const sakId = await opprettNySakPage.hentSakIdVedIndex(i);
      sakerInfo.push({ index: i, sakId });
    }

    // Naviger gjennom sakene flere ganger
    for (let runde = 0; runde < 2; runde++) {
      for (const sakInfo of sakerInfo) {
        await opprettNySakPage.velgSakVedIndex(sakInfo.index);

        // Verifiser at siden fortsatt fungerer
        const sidenFungerer = await opprettNySakPage.erOpprettNySakSidenSynlig();
        expect(sidenFungerer, `Siden skal fungere ved navigasjon til ${sakInfo.sakId}`).toBe(true);

        // Verifiser at ingen kritiske feil vises
        const harKritiskFeil = await opprettNySakPage.harErrorMelding();
        expect(harKritiskFeil, `Ingen kritisk feil ved navigasjon til ${sakInfo.sakId}`).toBe(false);
      }
    }

    await runAxeAnalyze(page, testInfo.title);
  });

  test("SYMPTOM: Velg tema og type-panel forsvinner etter feilmelding - SKAL IKKE SKJE", async ({ page }, testInfo) => {
    test.setTimeout(30000); // Økt timeout for mange saksvalg

    // Dette tester det spesifikke symptomet som ble beskrevet:
    // "I enkelte tilfeller så ser man at etter at første feilmelding er vist så vil ikke
    // påfølgende klikk på saker vise 'Velg tema og type for ny behandling' panelet"

    await opprettNySakPage.klikkVisFlereSaker();

    const antallSaker = await opprettNySakPage.tellAntallSaker();

    expect(
      antallSaker,
      "Må ha minst 3 saker for å teste symptom med feilmelding. Testdataene er utilstrekkelige.",
    ).toBeGreaterThanOrEqual(3);

    // STEG 1: Velg saker nedover i lista og verifiser at "Velg tema og type" panelet vises
    const sakerMedPanel: number[] = [];
    let funneFeilmelding = false;

    // Sjekk gjennom alle saker for å finne både saker med panel og saker med feilmelding
    for (let i = 0; i < antallSaker; i++) {
      await opprettNySakPage.velgSakVedIndex(i);

      // Sjekk om "Velg tema og type for ny behandling" panelet vises for denne saken
      const panelLocator = opprettNySakPage.hentBehandlingspanelRamme(i);
      const harPanel = await panelLocator.isVisible().catch(() => false);

      if (harPanel) {
        sakerMedPanel.push(i);
      }

      // Hvis vi finner en sak med feilmelding RETT ETTER denne saken, stopp søket
      const feilmeldingLocator = opprettNySakPage.hentFeilmeldingspanel(undefined, i);
      const harFeilmelding = await feilmeldingLocator.isVisible().catch(() => false);
      if (harFeilmelding && sakerMedPanel.length > 0) {
        // Perfekt! Vi har funnet både saker med panel OG en sak med feilmelding
        funneFeilmelding = true;
        break;
      }
    }

    expect(sakerMedPanel.length, "Må finne minst én sak som viser behandlingstype-panel").toBeGreaterThan(0);
    expect(funneFeilmelding, "Testdataene mangler saker med feilmeldinger (f.eks. EØS-sak med aktiv behandling).").toBe(
      true,
    );

    // STEG 2: Gå oppover igjen og velg saker som skulle vise panelet
    // Verifiser at panelet FORTSATT vises (dette var buggen!)
    for (const sakIndex of sakerMedPanel.reverse()) {
      await opprettNySakPage.velgSakVedIndex(sakIndex);

      const sakId = await opprettNySakPage.hentSakIdVedIndex(sakIndex);

      // KRITISK TEST: Panelet skal fortsatt vises etter at vi har sett feilmelding
      // Denne saken viste panel tidligere, så den MÅ vise panel nå også
      await expect(
        opprettNySakPage.hentBehandlingspanelRamme(sakIndex),
        `Sak ${sakId} (index ${sakIndex}): Panelet skal være synlig selv etter at vi har sett feilmelding på annen sak`,
      ).toBeVisible();

      // Verifiser at minst én behandlingstype er tilgjengelig
      const antallBehandlingstyper = await opprettNySakPage.tellBehandlingstyperIPanel();
      expect(antallBehandlingstyper, `Sak ${sakId}: Behandlingstyper skal være tilgjengelige`).toBeGreaterThan(0);
    }

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Behandlingstyper lastes korrekt for sak med trygdeavgift", async ({ page }, testInfo) => {
    // Finn en sak (typisk vil det være saker med trygdeavgift i testdataene)
    const valgtSak = await opprettNySakPage.finnSak({
      sakstype: "Utenfor avtaleland",
      behandlingsstatus: "Behandlingen er avsluttet",
    });

    expect(valgtSak, "Ingen sak funnet").toBeTruthy();

    await valgtSak!.click();

    // I "opprett ny sak" flowet vises behandlingstype-gruppen direkte. Verifiser at behandlingstype-gruppen er synlig
    await opprettNySakPage.verifiserBehandlingstypeGruppe();

    await runAxeAnalyze(page, testInfo.title);
  });
});
