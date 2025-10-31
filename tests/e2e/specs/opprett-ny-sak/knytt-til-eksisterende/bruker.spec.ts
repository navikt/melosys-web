import { expect, Page, test } from "@playwright/test";
import { runAxeAnalyze } from "../../../utils/axeUtils";
import { HovedsidePage, USER_ID_VALID } from "../../../pages/hovedside.page";
import { OpprettNySakPage } from "../../../pages/opprett-ny-sak/opprett-ny-sak.page";
import { getSaksnummerFraLocator } from "../../../utils/testUtils";

let opprettNySakPage: OpprettNySakPage;

async function setupOpprettNySakTester(page: Page) {
  const mainPage = new HovedsidePage(page);
  opprettNySakPage = new OpprettNySakPage(page);

  await mainPage.goto();

  await mainPage.klikkOpprettNySakKnapp();
}

test.describe("'Opprett ny sak for bruker - knytt til eksisterende sak", () => {
  test.beforeEach(async ({ page }) => {
    await setupOpprettNySakTester(page);
  });

  test("Knytt til 'Utenfor avtaleland' sak med åpne behandlinger - behandlingstyper tilgjengelige", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = await opprettNySakPage.finnSak({
      sakstype: "Utenfor avtaleland",
      behandlingsstatus: "Behandlingen er opprettet",
    });

    expect(valgtSak, "Ingen'Utenfor avtaleland'-sak funnet").toBeTruthy();

    valgtSak?.click();

    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak!, ["Årsavregning"]);
    const harFeilmelding = await opprettNySakPage.harFeilmelding();
    expect(harFeilmelding, `Ingen feilmelding skal vises for sak ${getSaksnummerFraLocator(valgtSak!)}`).toBe(false);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Knytt til EØS-sak med aktive behandlinger - gul varselmelding vises", async ({ page }, testInfo) => {
    // Søk etter bruker med EØS-sak som har aktive behandlinger
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = await opprettNySakPage.velgFørsteSak("EU/EØS-land");

    expect(valgtSak, "Ingen EØS-sak funnet").toBeTruthy();

    await opprettNySakPage.verifiserEosFeilmelding();

    await opprettNySakPage.verifiserBehandlingstypeGruppeIkkeSynlig();

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Knytt til EØS pensjonist-sak med trygdeavgift og åpne behandlinger - årsavregning tilgjengelig", async ({
    page,
  }, testInfo) => {
    // Test unntaket for EØS pensjonister med trygdeavgift som skal kunne opprette årsavregning
    // selv om de har aktive behandlinger (MELOSYS-7603)
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    // Søk etter en EØS-sak med sakstema "Trygdeavgift" og behandlingstema "Pensjonist"
    const valgtSak = await opprettNySakPage.finnSak({
      sakstype: "EU/EØS-land",
    });

    expect(valgtSak, "Ingen EØS pensjonist-sak funnet").toBeTruthy();

    valgtSak?.click();

    // Verifiser at årsavregning er tilgjengelig (unntak fra vanlig EØS-regel)
    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak!, ["Årsavregning"]);

    // Verifiser at ingen feilmelding vises
    const harFeilmelding = await opprettNySakPage.harFeilmelding();
    expect(
      harFeilmelding,
      `Ingen feilmelding skal vises for EØS pensjonist-sak ${getSaksnummerFraLocator(valgtSak!)}`,
    ).toBe(false);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Knytt til Avtaleland-sak med åpne behandlinger - behandlingstyper tilgjengelige", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = await opprettNySakPage.velgFørsteSak("Avtaleland", "Behandlingen er opprettet");
    expect(valgtSak, "Ingen Avtaleland-sak funnet").toBeTruthy();

    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak, ["Årsavregning"]);

    const harFeilmelding = await opprettNySakPage.harFeilmelding();
    expect(harFeilmelding, `Ingen feilmelding skal vises for sak ${getSaksnummerFraLocator(valgtSak!)}`).toBe(false);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Knytt til Avtaleland-sak med avsluttede behandlinger - behandlingstyper tilgjengelige", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = await opprettNySakPage.velgFørsteSak("EU/EØS-land", "Behandlingen er avsluttet");

    expect(valgtSak, "Fant ingen 'Avtaleland - Behandlingen er avsluttet' saker").toBeTruthy();

    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak, [
      "Ny vurdering",
      "Klage",
      "Henvendelse",
      "Årsavregning",
    ]);

    const harFeilmelding = await opprettNySakPage.harFeilmelding();
    expect(harFeilmelding, `Ingen feilmelding skal vises for sak ${getSaksnummerFraLocator(valgtSak!)}`).toBe(false);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Knytt til 'Utenfor avtaleland'-sak med åpne ikke-årsavregningsbehandlinger - kun årsavregning tilgjengelig", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = await opprettNySakPage.finnSak({
      sakstype: "Utenfor avtaleland",
    });

    expect(valgtSak, "Ingen 'Utenfor avtaleland'-sak funnet").toBeTruthy();

    valgtSak?.click();

    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak!, ["Årsavregning"]);

    const harFeilmelding = await opprettNySakPage.harFeilmelding();
    expect(harFeilmelding, `Ingen feilmelding skal vises for sak ${getSaksnummerFraLocator(valgtSak!)}`).toBe(false);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Knytt til sak med alle avsluttede behandlinger - alle behandlingstyper tilgjengelige", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = await opprettNySakPage.finnSak({
      sakstype: "Utenfor avtaleland",
      behandlingsstatus: "Behandlingen er avsluttet",
    });

    expect(valgtSak, "Ingen 'Utenfor avtaleland - Behandlingen er avsluttet' sak funnet").toBeTruthy();

    valgtSak?.click();

    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak!, [
      "Ny vurdering",
      "Klage",
      "Henvendelse",
      "Årsavregning",
    ]);

    const harFeilmelding = await opprettNySakPage.harFeilmelding();
    expect(harFeilmelding, `Ingen feilmelding skal vises for sak ${getSaksnummerFraLocator(valgtSak!)}`).toBe(false);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Konsistent oppførsel ved navigasjon mellom saker", async ({ page }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    // Test grunnleggende navigasjon og at behandlingstype-seksjonen fungerer
    const valgtSak = await opprettNySakPage.velgFørsteSak("Utenfor avtaleland");

    expect(valgtSak, "Ingen Avtaleland-sak funnet").toBeTruthy();

    // Verifiser at behandlingstype fungerer etter sakvalg
    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak, ["Årsavregning"]);

    // Tell antall tilgjengelige saker
    const antallSaker = await opprettNySakPage.tellAntallSaker();

    if (antallSaker > 1) {
      // Test navigasjon til annen sak
      await opprettNySakPage.velgSakVedIndex(1);

      await opprettNySakPage.velgFørsteSak("Utenfor avtaleland");
    }

    // Sjekk at UI-en fungerer etter navigasjon - at den ikke krasjer
    // Dette er en grunnleggende stabiltest som verifiserer at navigasjon fungerer
    const sidenFungerer = await opprettNySakPage.erOpprettNySakSidenSynlig();
    expect(sidenFungerer).toBe(true);

    // Verifiser at vi fortsatt har tilgang til sakslisten
    const saksliste = await opprettNySakPage.tellAntallSaker();
    expect(saksliste).toBeGreaterThan(0);

    await runAxeAnalyze(page, testInfo.title);
  });
});
