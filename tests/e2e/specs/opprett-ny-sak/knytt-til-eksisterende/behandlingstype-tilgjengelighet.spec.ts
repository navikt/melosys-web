import { expect, test } from "../../../recording/fixtures";
import { HovedsidePage, USER_ID_VALID } from "../../../pages/hovedside.page";
import { OpprettNySakPage } from "../../../pages/opprett-ny-sak/opprett-ny-sak.page";

let opprettNySakPage: OpprettNySakPage;

test.describe("'Opprett ny sak for bruker - knytt til eksisterende sak", () => {
  test.beforeEach(async ({ page, apiRecorder }) => {
    const mainPage = new HovedsidePage(page);
    opprettNySakPage = new OpprettNySakPage(page);

    await mainPage.goto();
    await mainPage.klikkOpprettNySakKnapp();
  });

  test("Utenfor avtaleland med åpne behandlinger - viser behandlingstyper", async ({ page, apiRecorder }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    // Bruk prepopulert OPPRETTET sak MEL-1060 (FTRL)
    const sakId = "MEL-1060";
    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);

    await valgtSak.click();

    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak!, ["Årsavregning"]);
    const harFeilmelding = await opprettNySakPage.harFeilmelding();
    expect(harFeilmelding, `Ingen feilmelding skal vises for sak ${sakId}`).toBe(false);
  });

  test("EØS-sak med aktive behandlinger - viser varselmelding", async ({ page, apiRecorder }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    // Bruk prepopulert EU/EØS-sak MEL-1051 (IKKE_YRKESAKTIV, UNDER_BEHANDLING)
    const sakId = "MEL-1051";
    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);

    await valgtSak.click();

    await opprettNySakPage.verifiserEosFeilmelding();

    await opprettNySakPage.verifiserBehandlingstypeGruppeIkkeSynlig();
  });

  test("EØS pensjonist med trygdeavgift - årsavregning tilgjengelig", async ({ page, apiRecorder }, testInfo) => {
    // Test unntaket for EØS pensjonister med trygdeavgift som skal kunne opprette årsavregning
    // selv om de har aktive behandlinger
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    // Bruk prepopulert EØS pensjonist-sak MEL-1055 (EU_EOS, PENSJONIST)
    const sakId = "MEL-1055";
    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);

    await valgtSak.click();

    // Verifiser at årsavregning er tilgjengelig (unntak fra vanlig EØS-regel)
    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak!, ["Årsavregning"]);

    // Verifiser at ingen feilmelding vises
    const harFeilmelding = await opprettNySakPage.harFeilmelding();
    expect(harFeilmelding, `Ingen feilmelding skal vises for EØS pensjonist-sak ${sakId}`).toBe(false);
  });

  test("Avtaleland med åpne behandlinger - viser varselmelding", async ({ page, apiRecorder }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    // Bruk prepopulert Avtaleland-sak MEL-1012 (OPPRETTET)
    // Avtaleland-saker med aktive behandlinger viser varselmelding og skjuler behandlingstyper
    const sakId = "MEL-1012";
    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);

    await valgtSak.click();

    // Avtaleland med aktiv behandling skal vise varselmelding (samme som EØS)
    await opprettNySakPage.verifiserEosFeilmelding();

    // Behandlingstype-gruppen skal IKKE være synlig
    await opprettNySakPage.verifiserBehandlingstypeGruppeIkkeSynlig();
  });

  test("Avtaleland med avsluttede behandlinger - alle behandlingstyper tilgjengelige", async ({
    page,
    apiRecorder,
  }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    // Bruk prepopulert AVSLUTTET Avtaleland-sak MEL-1064
    const sakId = "MEL-1064";
    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);

    await valgtSak.click();

    // Avtaleland-saker har IKKE Årsavregning som behandlingstype
    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak, ["Ny vurdering", "Klage", "Henvendelse"]);

    const harFeilmelding = await opprettNySakPage.harFeilmelding();
    expect(harFeilmelding, `Ingen feilmelding skal vises for sak ${sakId}`).toBe(false);
  });

  test("Utenfor avtaleland med åpne behandlinger - kun årsavregning tilgjengelig", async ({
    page,
    apiRecorder,
  }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    // Bruk prepopulert UNDER_BEHANDLING sak MEL-1013 (FTRL)
    const sakId = "MEL-1013";
    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);

    await valgtSak.click();

    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak!, ["Årsavregning"]);

    const harFeilmelding = await opprettNySakPage.harFeilmelding();
    expect(harFeilmelding, `Ingen feilmelding skal vises for sak ${sakId}`).toBe(false);
  });

  test("Alle behandlinger avsluttet - alle behandlingstyper tilgjengelige", async ({ page, apiRecorder }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    // Bruk prepopulert AVSLUTTET sak MEL-1070 (FTRL)
    const sakId = "MEL-1070";
    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);

    await valgtSak.click();

    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak!, [
      "Ny vurdering",
      "Klage",
      "Henvendelse",
      "Årsavregning",
    ]);

    const harFeilmelding = await opprettNySakPage.harFeilmelding();
    expect(harFeilmelding, `Ingen feilmelding skal vises for sak ${sakId}`).toBe(false);
  });

  test("Konsistent oppførsel ved navigasjon mellom saker", async ({ page, apiRecorder }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    // Test grunnleggende navigasjon og at behandlingstype-seksjonen fungerer
    // Bruk prepopulert OPPRETTET Utenfor avtaleland-sak MEL-1059
    const sakId1 = "MEL-1059";
    const valgtSak1 = opprettNySakPage.finnSakBySaksnummer(sakId1);

    await valgtSak1.click();

    // Verifiser at behandlingstype fungerer etter sakvalg
    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak1, ["Årsavregning"]);

    // Test navigasjon til annen sak (MEL-1060)
    const sakId2 = "MEL-1060";
    const valgtSak2 = opprettNySakPage.finnSakBySaksnummer(sakId2);

    await valgtSak2.click();

    // Verifiser at behandlingstype fortsatt fungerer etter navigasjon
    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak2, ["Årsavregning"]);

    // Sjekk at UI-en fungerer etter navigasjon - at den ikke krasjer
    const sidenFungerer = await opprettNySakPage.erOpprettNySakSidenSynlig();
    expect(sidenFungerer).toBe(true);
  });
});
