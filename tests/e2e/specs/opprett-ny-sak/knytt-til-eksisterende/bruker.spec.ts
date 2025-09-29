import { expect, test } from "@playwright/test";
import { runAxeAnalyze } from "../../../utils/axeUtils";
import { HovedsidePage, USER_ID_VALID } from "../../../pages/hovedside.page";
import { OpprettNySakPage } from "../../../pages/opprett-ny-sak.page";

let opprettNySakPage: OpprettNySakPage;

async function setupOpprettNySakTester(page: any) {
  const mainPage = new HovedsidePage(page);
  opprettNySakPage = new OpprettNySakPage(page);
  await mainPage.goto();
  await mainPage.klikkOpprettNySakKnapp();
}

test.describe("'Opprett ny sak for bruker - knytt til eksisterende sak", () => {
  test.beforeEach(async ({ page }) => {
    await setupOpprettNySakTester(page);
  });

  test("Knytt til FTRL-sak med åpne behandlinger - behandlingstyper tilgjengelige", async ({ page }, testInfo) => {
    // Søk etter bruker med FTRL-sak
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = await opprettNySakPage.velgFirstFTRLSak();

    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak, ["Årsavregning"]);

    const sakId = (valgtSak as any)._sakId || "ukjent";
    await expect(
      page.locator(".feilmelding_innrykk"),
      `Ingen feilmelding skal vises for sak ${sakId}`,
    ).not.toBeVisible();

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Knytt til EØS-sak med aktive behandlinger - gul varselmelding vises", async ({ page }, testInfo) => {
    // Søk etter bruker med EØS-sak som har aktive behandlinger
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = await opprettNySakPage.velgFirstEOSSak();

    await expect(valgtSak).toBeVisible();

    await expect(
      page.locator(".feilmelding_innrykk").filter({
        hasText: "Du kan ikke opprette en ny behandling på eksisterende sak med en aktiv/pågående behandling",
      }),
    ).toBeVisible();

    const behandlingstypeGruppe = page.getByRole("group", { name: "Behandlingstype" });
    await expect(behandlingstypeGruppe).not.toBeVisible();

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Knytt til AVTALELAND-sak med åpne behandlinger - behandlingstyper tilgjengelige", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = await opprettNySakPage.velgFirstAvtalelandSak();
    await expect(valgtSak).toBeVisible();

    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak, ["Årsavregning"]);

    const sakId = (valgtSak as any)._sakId || "ukjent";
    await expect(
      page.locator(".feilmelding_innrykk"),
      `Ingen feilmelding skal vises for sak ${sakId}`,
    ).not.toBeVisible();

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Knytt til AVTALELAND-sak med avsluttede behandlinger - behandlingstyper tilgjengelige", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = await opprettNySakPage.velgFirstAvtalelandSak("er avsluttet");
    await expect(valgtSak).toBeVisible();

    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak, [
      "Ny vurdering",
      "Klage",
      "Henvendelse",
      "Årsavregning",
    ]);

    const sakId = (valgtSak as any)._sakId || "ukjent";
    await expect(
      page.locator(".feilmelding_innrykk"),
      `Ingen feilmelding skal vises for sak ${sakId}`,
    ).not.toBeVisible();

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Knytt til FTRL-sak med åpne ikke-årsavregningsbehandlinger - kun årsavregning tilgjengelig", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = await opprettNySakPage.velgFirstFTRLSak();

    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak, ["Årsavregning"]);

    const sakId = (valgtSak as any)._sakId || "ukjent";
    await expect(
      page.locator(".feilmelding_innrykk"),
      `Ingen feilmelding skal vises for sak ${sakId}`,
    ).not.toBeVisible();

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Knytt til sak med alle avsluttede behandlinger - alle behandlingstyper tilgjengelige", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = await opprettNySakPage.velgFirstFTRLSak("er avsluttet");

    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak, [
      "Ny vurdering",
      "Klage",
      "Henvendelse",
      "Årsavregning",
    ]);

    const sakId = (valgtSak as any)._sakId || "ukjent";
    await expect(
      page.locator(".feilmelding_innrykk"),
      `Ingen feilmelding skal vises for sak ${sakId}`,
    ).not.toBeVisible();

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Konsistent oppførsel ved navigasjon mellom saker", async ({ page }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    // Test grunnleggende navigasjon og at behandlingstype-seksjonen fungerer
    const valgtSak = await opprettNySakPage.velgUtenforAvtalelandSak();
    await page.waitForTimeout(1000);

    // Verifiser at behandlingstype fungerer etter sakvalg
    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak, ["Årsavregning"]);

    // Tell antall tilgjengelige saker
    const antallSaker = await page.locator(".customRadioPanel").count();

    if (antallSaker > 1) {
      // Test navigasjon til annen sak
      const andreSak = page.locator(".customRadioPanel").nth(1);
      await andreSak.click();
      await page.waitForTimeout(1500); // Vent på UI-oppdatering

      await opprettNySakPage.velgUtenforAvtalelandSak();
      await page.waitForTimeout(1500);
    }

    // Sjekk at UI-en fungerer etter navigasjon - at den ikke krasjer
    // Dette er en grunnleggende stabiltest som verifiserer at navigasjon fungerer
    const sidenFungerer = await page.locator(".opprettnysak").isVisible();
    expect(sidenFungerer).toBe(true);

    // Verifiser at vi fortsatt har tilgang til sakslisten
    const saksliste = await page.locator(".customRadioPanel").count();
    expect(saksliste).toBeGreaterThan(0);

    await runAxeAnalyze(page, testInfo.title);
  });
});
