import { Page, expect } from "@playwright/test";
import { HovedsidePage, USER_ID_VALID } from "../pages/hovedside.page";
import { OpprettNySakPage } from "../pages/opprett-ny-sak.page";
import { SokPage } from "../pages/sok.page";
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
