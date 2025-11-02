import { Page, expect, Locator } from "@playwright/test";
import { HovedsidePage, USER_ID_VALID } from "../pages/hovedside.page";
import { OpprettNySakPage } from "../pages/opprett-ny-sak/opprett-ny-sak.page";
import { SokPage } from "../pages/sok.page";
import { BehandlingPage } from "../pages/behandling/behandling.page";
import { assertNyBehandlingOpprettet } from "./testUtils";

/**
 * Opprett en ny Avtaleland-sak med Førstegangsbehandling
 * @returns Locator for den opprettede saken (med saksnummer tilgjengelig via getSaksnummer())
 */
export async function opprettAvtalelandSak(page: Page): Promise<Locator> {
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

  return saker[0];
}

/**
 * Opprett en ny FTRL-sak (Utenfor avtaleland) med Førstegangsbehandling
 * @returns Locator for den opprettede saken (med saksnummer tilgjengelig via getSaksnummer())
 */
export async function opprettUtenforAvtalelandSak(page: Page): Promise<Locator> {
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

  return saker[0];
}

/**
 * Avslutt en behandling på en sak
 * @param page - Playwright Page
 * @param sak - Locator for saken (fra finnÅpneSaker eller lignende)
 * @param vedtaksType - Vedtaket som skal registreres (f.eks. "Søknaden er innvilget")
 */
export async function avsluttBehandling(
  page: Page,
  sak: Locator,
  vedtaksType:
    | "Søknaden er innvilget"
    | "Søknaden er avslått"
    | "Avslå søknad pga. manglende opplysninger"
    | "Ferdigbehandlet"
    | "Søknaden/klagen er trukket"
    | "Behandlingen er bortfalt",
): Promise<void> {
  const sokPage = new SokPage(page);
  const sakId = await sokPage.getSaksnummer(sak);

  await sokPage.klikkVisBehandling(sak);
  const behandlingPage = new BehandlingPage(page);
  await behandlingPage.verifiserBehandlingsside();
  await behandlingPage.avsluttBehandling(vedtaksType, sakId);
}

/**
 * Opprett en ny Utenfor avtaleland-sak med Førstegangsbehandling, avslutt den, og opprett Årsavregning
 * @returns Locator for saken med årsavregning-behandlingen
 */
export async function opprettUtenforAvtalelandSakMedAarsavregning(page: Page): Promise<Locator> {
  const sokPage = new SokPage(page);

  // 1. Opprett Førstegangsbehandling
  const sak = await opprettUtenforAvtalelandSak(page);
  const sakId = await sokPage.getSaksnummer(sak);

  // 2. Avslutt Førstegangsbehandling
  await avsluttBehandling(page, sak, "Søknaden er innvilget");

  // 3. Opprett Årsavregning på samme sak
  const hovedsidePage = new HovedsidePage(page);
  await hovedsidePage.goto();
  await hovedsidePage.klikkOpprettNySakKnapp();
  const opprettNySakPage = new OpprettNySakPage(page);
  await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
  await opprettNySakPage.velgKnyttTilEksisterendeSak();

  const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);
  await valgtSak.click();
  await opprettNySakPage.velgBehandlingstypeRadio("Årsavregning");
  await opprettNySakPage.velgBehandlingsaarsak("Søknad");
  await opprettNySakPage.klikkOpprettNyBehandling();

  await assertNyBehandlingOpprettet(page);

  // Finn saken med årsavregning
  await hovedsidePage.goto();
  await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

  const saker = await sokPage.finnÅpneSaker("Utenfor avtaleland", "Årsavregning");
  expect(saker.length, "Fant ingen åpne 'Utenfor avtaleland - Årsavregning' saker").toBeGreaterThan(0);

  return saker[0];
}

/**
 * Opprett en ny EØS pensjonist-sak med trygdeavgift og Førstegangsbehandling
 * Dette er en spesialsak som skal kunne opprette årsavregning selv med åpne behandlinger (MELOSYS-7603)
 * @returns Locator for den opprettede saken
 */
export async function opprettEøsPensjonistSakMedTrygdeavgift(page: Page): Promise<Locator> {
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

  return saker[0];
}

/**
 * Opprett en ny EU/EØS-sak med spesifisert behandlingstema
 * @param page
 * @param behandlingstema - F.eks. "Ikke yrkesaktiv" (default, enklest å opprette)
 * @returns Locator for den opprettede saken
 */
export async function opprettEUEOSSak(
  page: Page,
  behandlingstema:
    | "Utsendt arbeidstaker / skip / direkte til artikkel 16"
    | "Utsendt selvstendig næringsdrivende / skip / direkte til artikkel 16"
    | "Arbeid og/eller selvstendig virksomhet i flere land"
    | "Offentlig tjenesteperson/flyvende personell"
    | "Arbeid kun i Norge"
    | "Ikke yrkesaktiv"
    | "Pensjonist/uføretrygdet"
    | "Forespørsel fra trygdemyndighet"
    | "Forespørsel om trygdetid" = "Ikke yrkesaktiv",
): Promise<Locator> {
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

  return saker[0];
}
