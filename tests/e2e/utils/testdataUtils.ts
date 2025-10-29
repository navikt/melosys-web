import { Page, expect } from "@playwright/test";
import { HovedsidePage, USER_ID_VALID } from "../pages/hovedside.page";
import { OpprettNySakPage } from "../pages/opprett-ny-sak/opprett-ny-sak.page";
import { SokPage } from "../pages/sok.page";
import { BehandlingPage } from "../pages/behandling/behandling.page";
import { assertNyBehandlingOpprettet } from "./testUtils";

/**
 * Opprett en ny Avtaleland-sak med Førstegangsbehandling
 * @returns Saksnummer (f.eks. "MEL-123")
 */
export async function opprettAvtalelandSak(page: Page): Promise<string> {
  const hovedsidePage = new HovedsidePage(page);
  const opprettNySakPage = new OpprettNySakPage(page);
  const sokPage = new SokPage(page);

  await hovedsidePage.goto();
  await hovedsidePage.klikkOpprettNySakKnapp();

  await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
  await opprettNySakPage.velgOpprettNySak();

  await opprettNySakPage.velgSakstype("Avtaleland");
  await opprettNySakPage.velgSakstema("Medlemskap og lovvalg");
  await opprettNySakPage.velgBehandlingstema("Yrkesaktiv");
  await opprettNySakPage.velgBehandlingstype("Førstegangsbehandling");
  await opprettNySakPage.velgBehandlingsaarsak("Søknad");

  await opprettNySakPage.klikkOpprettNyBehandling();
  await assertNyBehandlingOpprettet(page);

  // Finn den nyopprettede saken
  await hovedsidePage.goto();
  await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

  const saker = await sokPage.finnÅpneSaker("Avtaleland");
  expect(saker.length, "Fant ingen åpne 'Avtaleland' saker etter opprettelse").toBeGreaterThan(0);

  return await sokPage.getSaksnummer(saker[0]);
}

/**
 * Opprett en ny FTRL-sak (Utenfor avtaleland) med Førstegangsbehandling
 * @returns Saksnummer (f.eks. "MEL-123")
 */
export async function opprettUtenforAvtalelandSak(page: Page): Promise<string> {
  const hovedsidePage = new HovedsidePage(page);
  const opprettNySakPage = new OpprettNySakPage(page);
  const sokPage = new SokPage(page);

  await hovedsidePage.goto();
  await hovedsidePage.klikkOpprettNySakKnapp();

  await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
  await opprettNySakPage.velgOpprettNySak();

  await opprettNySakPage.velgSakstype("Utenfor avtaleland");
  await opprettNySakPage.velgSakstema("Medlemskap og lovvalg");
  await opprettNySakPage.velgBehandlingstema("Yrkesaktiv");
  await opprettNySakPage.velgBehandlingstype("Førstegangsbehandling");
  await opprettNySakPage.velgBehandlingsaarsak("Søknad");

  await opprettNySakPage.klikkOpprettNyBehandling();
  await assertNyBehandlingOpprettet(page);

  // Finn den nyopprettede saken
  await hovedsidePage.goto();
  await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

  const saker = await sokPage.finnÅpneSaker("Utenfor avtaleland");
  expect(saker.length, "Fant ingen åpne 'Utenfor avtaleland' saker etter opprettelse").toBeGreaterThan(0);

  return await sokPage.getSaksnummer(saker[0]);
}

/**
 * Opprett en ny Utenfor avtaleland-sak med Førstegangsbehandling, avslutt den, og opprett Årsavregning
 * @returns Saksnummer (f.eks. "MEL-123")
 */
export async function opprettUtenforAvtalelandSakMedAarsavregning(page: Page): Promise<string> {
  const hovedsidePage = new HovedsidePage(page);
  const sokPage = new SokPage(page);
  const behandlingPage = new BehandlingPage(page);
  const opprettNySakPage = new OpprettNySakPage(page);

  // 1. Opprett Førstegangsbehandling
  const sakId = await opprettUtenforAvtalelandSak(page);

  // 2. Avslutt Førstegangsbehandling
  await hovedsidePage.goto();
  await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

  const sak = sokPage.finnSakBySaksnummer(sakId);
  await sokPage.klikkVisBehandling(sak);
  await behandlingPage.verifiserBehandlingsside();
  await behandlingPage.avsluttBehandling("Søknaden er innvilget", sakId);

  // 3. Opprett Årsavregning på samme sak
  await hovedsidePage.goto();
  await hovedsidePage.klikkOpprettNySakKnapp();
  await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
  await opprettNySakPage.velgKnyttTilEksisterendeSak();

  const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);
  await valgtSak.click();
  await opprettNySakPage.velgBehandlingstypeRadio("Årsavregning");
  await opprettNySakPage.velgBehandlingsaarsak("Søknad");
  await opprettNySakPage.klikkOpprettNyBehandling();

  await assertNyBehandlingOpprettet(page);

  return sakId;
}

/**
 * Opprett en ny EØS pensjonist-sak med trygdeavgift og Førstegangsbehandling
 * Dette er en spesialsak som skal kunne opprette årsavregning selv med åpne behandlinger (MELOSYS-7603)
 * @returns Saksnummer (f.eks. "MEL-123")
 */
export async function opprettEøsPensjonistSakMedTrygdeavgift(page: Page): Promise<string> {
  const hovedsidePage = new HovedsidePage(page);
  const opprettNySakPage = new OpprettNySakPage(page);
  const sokPage = new SokPage(page);

  await hovedsidePage.goto();
  await hovedsidePage.klikkOpprettNySakKnapp();

  await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
  await opprettNySakPage.velgOpprettNySak();

  await opprettNySakPage.velgSakstype("EU/EØS-land");
  await opprettNySakPage.velgSakstema("Trygdeavgift");
  await opprettNySakPage.velgBehandlingstema("Pensjonist/uføretrygdet");
  await opprettNySakPage.velgBehandlingstype("Førstegangsbehandling");
  await opprettNySakPage.velgBehandlingsaarsak("Søknad");

  await opprettNySakPage.klikkOpprettNyBehandling();
  await assertNyBehandlingOpprettet(page);

  // Finn den nyopprettede saken
  await hovedsidePage.goto();
  await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

  const saker = await sokPage.finnÅpneSaker("EU/EØS-land");
  expect(saker.length, "Fant ingen åpne 'EU/EØS-land' saker etter opprettelse").toBeGreaterThan(0);

  return await sokPage.getSaksnummer(saker[0]);
}

/**
 * Opprett en ny EU/EØS-sak med offentlig ansatt og Førstegangsbehandling
 * Brukes for testing av periode-steg for offentlig ansatt (MELOSYS-7659)
 * @returns Saksnummer (f.eks. "MEL-123")
 */
export async function opprettEuEøsOffentligAnsattSak(page: Page): Promise<string> {
  const hovedsidePage = new HovedsidePage(page);
  const opprettNySakPage = new OpprettNySakPage(page);
  const sokPage = new SokPage(page);

  await hovedsidePage.goto();
  await hovedsidePage.klikkOpprettNySakKnapp();

  await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
  await opprettNySakPage.velgOpprettNySak();

  await opprettNySakPage.velgSakstype("EU/EØS-land");
  await opprettNySakPage.velgSakstema("Medlemskap og lovvalg");
  await opprettNySakPage.velgBehandlingstema("Offentlig tjenesteperson/flyvende personell");
  await opprettNySakPage.velgBehandlingstype("Førstegangsbehandling");
  await opprettNySakPage.velgBehandlingsaarsak("Søknad");

  await opprettNySakPage.setFraDato("01.01.2024");
  await opprettNySakPage.setTilDato("31.12.2024");
  await opprettNySakPage.setLand("Norge");

  await opprettNySakPage.klikkOpprettNyBehandling();
  await assertNyBehandlingOpprettet(page);

  // Vent litt for å la backend fullføre lagring av saken
  await page.waitForTimeout(1000);

  // Finn den nyopprettede saken
  await hovedsidePage.goto();
  await page.waitForLoadState("networkidle");
  await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);
  await page.waitForLoadState("networkidle");

  const saker = await sokPage.finnÅpneSaker("EU/EØS-land");
  expect(saker.length, "Fant ingen åpne 'EU/EØS-land' saker etter opprettelse").toBeGreaterThan(0);

  return await sokPage.getSaksnummer(saker[0]);
}

/**
 * Opprett en ny EU/EØS-sak med spesifisert behandlingstema
 * @param page
 * @param behandlingstema - F.eks. "Ikke yrkesaktiv" (default, enklest å opprette)
 * @returns Saksnummer (f.eks. "MEL-123")
 */
export async function opprettEUEOSSak(
  page: Page,
  behandlingstema:
    | "Yrkesaktiv"
    | "Ikke yrkesaktiv"
    | "Pensjonist/uføretrygdet"
    | "Forespørsel fra trygdemyndighet"
    | "Forespørsel om trygdetid"
    | "Anmodning om unntak"
    | "Registrering unntak"
    | "A1 / Anmodning om unntak på papir"
    | "Søknad om unntak fra folketrygden"
    | "Utstedt arbeidstaker / skip / direkte til artikkel 16"
    | "Utstedt selvstendig næringsdrivende / skip / direkte til artikkel 16"
    | "Arbeid og/eller selvstendig virksomhet i flere land"
    | "Offentlig tjenesteperson/flyvende personell"
    | "Arbeid kun i Norge"
    | "Virksomhet" = "Ikke yrkesaktiv",
): Promise<string> {
  const hovedsidePage = new HovedsidePage(page);
  const opprettNySakPage = new OpprettNySakPage(page);
  const sokPage = new SokPage(page);

  await hovedsidePage.goto();
  await hovedsidePage.klikkOpprettNySakKnapp();

  await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
  await opprettNySakPage.velgOpprettNySak();

  await opprettNySakPage.velgSakstype("EU/EØS-land");
  await opprettNySakPage.velgSakstema("Medlemskap og lovvalg");
  await opprettNySakPage.velgBehandlingstema(behandlingstema);
  await opprettNySakPage.velgBehandlingstype("Førstegangsbehandling");
  await opprettNySakPage.velgBehandlingsaarsak("Søknad");

  await opprettNySakPage.klikkOpprettNyBehandling();
  await assertNyBehandlingOpprettet(page);

  // Finn den nyopprettede saken
  await hovedsidePage.goto();
  await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

  const saker = await sokPage.finnÅpneSaker("EU/EØS-land");
  expect(saker.length, "Fant ingen åpne 'EU/EØS-land' saker etter opprettelse").toBeGreaterThan(0);

  return await sokPage.getSaksnummer(saker[0]);
}
