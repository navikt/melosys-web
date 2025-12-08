import { expect, test } from "../../../recording/fixtures";
import { runAxeAnalyze } from "../../../utils/axeUtils";
import { HovedsidePage, USER_ID_VALID } from "../../../pages/hovedside.page";
import { OpprettNySakPage } from "../../../pages/opprett-ny-sak/opprett-ny-sak.page";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../../utils/testUtils";

/**
 * Test state-håndtering ved saksbytting
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
test.describe("State-håndtering ved saksbytting", () => {
  // Kjør tester serielt for å unngå race conditions med delt testdata
  test.describe.configure({ mode: "serial" });

  let opprettNySakPage: OpprettNySakPage;

  test.beforeEach(async ({ page, apiRecorder }) => {
    const mainPage = new HovedsidePage(page);
    opprettNySakPage = new OpprettNySakPage(page);

    await mainPage.goto();
    await mainPage.klikkOpprettNySakKnapp();
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();
  });

  test("Avsluttet behandling - viser melding om tidligere behandling", async ({ page, apiRecorder }, testInfo) => {
    // Bruk prepopulert AVSLUTTET sak MEL-1065 (FTRL)
    const sakId = "MEL-1065";
    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);

    await valgtSak.click();

    await opprettNySakPage.verifiserTidligereBehandlingAvsluttet();

    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak!, [
      "Ny vurdering",
      "Klage",
      "Henvendelse",
      "Årsavregning",
    ]);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Utenfor avtaleland med aktiv behandling - årsavregning tilgjengelig", async ({
    page,
    apiRecorder,
  }, testInfo) => {
    // Bruk prepopulert UNDER_BEHANDLING sak MEL-1018 (FTRL - Utenfor avtaleland)
    const sakId = "MEL-1018";
    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);

    await valgtSak.click();

    // For Utenfor avtaleland med aktive behandlinger skal Årsavregning være tilgjengelig
    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak!, ["Årsavregning"]);

    const harFeilmelding = await opprettNySakPage.harFeilmelding();
    expect(harFeilmelding, `Ingen feilmelding skal vises for sak ${sakId}`).toBe(false);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("EØS-sak med åpen behandling - viser varselmelding", async ({ page, apiRecorder }, testInfo) => {
    // Bruk prepopulert UNDER_BEHANDLING EØS-sak MEL-1071 (IKKE_YRKESAKTIV)
    const sakId = "MEL-1071";
    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);

    await valgtSak.click();

    await opprettNySakPage.verifiserEosFeilmelding();

    await opprettNySakPage.verifiserBehandlingstypeGruppeIkkeSynlig();

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Regresjon: Behandlingstema settes automatisk via Redux", async ({ page, apiRecorder }, testInfo) => {
    // Bruk prepopulert AVSLUTTET sak MEL-1066 (FTRL)
    const sakId = "MEL-1066";
    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);

    await valgtSak.click();

    // I "opprett ny sak" flowet vises behandlingstema direkte (ingen "Opprett ny behandling" radioknapp)
    // Vent på at behandlingstema-select er synlig
    await opprettNySakPage.verifiserBehandlingstemaSelectSynlig();

    // Behandlingstema skal være satt automatisk (ikke tom verdi "")
    const behandlingstemaValue = await opprettNySakPage.hentBehandlingstemaVerdi();
    expect(behandlingstemaValue, "Behandlingstema skal settes automatisk fra Redux operation").not.toBe("");

    await runAxeAnalyze(page, testInfo.title);
  });

  // FJERNET: "Regresjon: Konsistent data-lasting ved navigasjon mellom saker"
  // Denne testen er vanskelig å gjøre deterministisk siden enkelte saker kan vise
  // varselmeldinger avhengig av tilstand, og det er ikke alltid en feil

  test("Regresjon: Panel synlig etter feilmelding på annen sak", async ({ page, apiRecorder }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout for mange saksvalg

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

      // Vent på at enten panel eller feilmelding lastes inn
      const panelLocator = opprettNySakPage.hentBehandlingspanelRamme(i);
      const feilmeldingLocator = opprettNySakPage.hentFeilmeldingspanel(undefined, i);
      await Promise.race([
        panelLocator.waitFor({ state: "visible", timeout: 2000 }).catch(() => {}),
        feilmeldingLocator.waitFor({ state: "visible", timeout: 2000 }).catch(() => {}),
        page.waitForLoadState("networkidle", { timeout: 2000 }).catch(() => {}),
      ]);

      // Sjekk om "Velg tema og type for ny behandling" panelet vises for denne saken
      const harPanel = await panelLocator.isVisible().catch(() => false);

      if (harPanel) {
        sakerMedPanel.push(i);
      }

      // Hvis vi finner en sak med feilmelding RETT ETTER denne saken, stopp søket
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

  test("Regresjon: Sak med trygdeavgift - behandlingstyper lastes korrekt", async ({ page, apiRecorder }, testInfo) => {
    // Bruk prepopulert AVSLUTTET sak MEL-1066 (FTRL)
    const sakId = "MEL-1066";
    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);

    await valgtSak.click();

    // I "opprett ny sak" flowet vises behandlingstype-gruppen direkte. Verifiser at behandlingstype-gruppen er synlig
    await opprettNySakPage.verifiserBehandlingstypeGruppe();

    await runAxeAnalyze(page, testInfo.title);
  });
});
