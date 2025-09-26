import { expect, test } from "@playwright/test";
import { runAxeAnalyze } from "../utils/axeUtils";
import { HovedsidePage, ORG_NUMBER_VALID, USER_ID_VALID } from "../pages/hovedside.page";
import { OpprettNySakPage } from "../pages/opprett-ny-sak.page";
import { assertErrors, assertFieldError, assertNyBehandlingOpprettet } from "../utils/testUtils";

let opprettNySakPage: OpprettNySakPage;

async function setupOpprettNySakTester(page: any) {
  const mainPage = new HovedsidePage(page);
  opprettNySakPage = new OpprettNySakPage(page);
  await mainPage.goto();
  await mainPage.klikkOpprettNySakKnapp();
}

test.describe("'Opprett ny sak/behandling' hovedside", () => {
  test.beforeEach(async ({ page }) => {
    await setupOpprettNySakTester(page);
  });
  test("Klikk på 'Opprett ny sak/behandling' og verifiser at alle forventede elementer er tilstede", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.verifiserAlleElementer();
    await runAxeAnalyze(page, testInfo.title);
  });

  test("Klikk på 'Opprett ny behandling' når ingen påkrevde felter er fylt ut og verifiser feilmeldinger", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.klikkOpprettNyBehandling();
    await assertErrors(page, ["Skriv inn gyldig f.nr. eller d-nr."]);

    await runAxeAnalyze(page, testInfo.title);
  });
});

test.describe("'Opprett ny sak for bruker", () => {
  test.beforeEach(async ({ page }) => {
    await setupOpprettNySakTester(page);
  });

  test("Klikk på 'Opprett ny behandling' for 'Eksisterende sak' når påkrevede felt mangler og verifiser feilmeldinger", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    // Verfiser at eksisterende sak er valgt som default
    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertErrors(page, ["Velg hvilken sak du ønsker å knytte behandlingen til", "Velg behandlingsårsak"]);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Klikk på 'Opprett ny behandling' for 'Opprett ny sak' når påkrevede felt mangler og verifiser feilmeldinger", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();
    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertErrors(page, [
      "Velg sakstype",
      "Velg sakstema",
      "Velg behandlingstema",
      "Velg behandlingstype",
      "Velg behandlingsårsak",
    ]);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Klikk 'Opprett ny behandling' for 'Opprett ny sak' med alle påkrevede felt fyllt inn", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    // Fyll ut alle påkrevde dropdown-felt
    await opprettNySakPage.velgSakstype();
    await opprettNySakPage.velgSakstema();
    await opprettNySakPage.velgBehandlingstema();
    await opprettNySakPage.velgBehandlingstype();
    await opprettNySakPage.velgBehandlingsaarsak();

    await opprettNySakPage.setLand("Norge");
    await opprettNySakPage.setFraDato("01.01.2024");
    await opprettNySakPage.setTilDato("31.12.2024");

    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertNyBehandlingOpprettet(page);

    await runAxeAnalyze(page, testInfo.title);
  });

  test('Opprett sak for sakstype "EU/EØS-land" og verifiser at det ikke oppstår noen feil', async ({
    page,
  }, testInfo) => {
    await setupOpprettNySakTester(page);
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await expect(opprettNySakPage.page.locator("select[name='sakstype']")).toBeVisible();

    await opprettNySakPage.velgSakstype("EU/EØS-land");
    await opprettNySakPage.velgSakstema();
    await opprettNySakPage.velgBehandlingstema();
    await opprettNySakPage.velgBehandlingstype();
    await opprettNySakPage.velgBehandlingsaarsak();

    await opprettNySakPage.setFraDato("01.01.2024");
    await opprettNySakPage.setTilDato("31.12.2024");
    await opprettNySakPage.setLand("Norge");

    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertNyBehandlingOpprettet(page);

    await runAxeAnalyze(page, testInfo.title);
  });

  test('Opprett sak for sakstype "EU/EØS-land", sakstema "Medlemsskap og lovvalg", uten å velge fra- til-dato og verifiser at det ikke oppstår noen feil', async ({
    page,
  }, testInfo) => {
    await setupOpprettNySakTester(page);
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await expect(opprettNySakPage.page.locator("select[name='sakstype']")).toBeVisible();

    await opprettNySakPage.velgSakstype("EU/EØS-land");
    await opprettNySakPage.velgSakstema();
    await opprettNySakPage.velgBehandlingstema();
    await opprettNySakPage.velgBehandlingstype();
    await opprettNySakPage.velgBehandlingsaarsak();

    // await opprettNySakPage.setFraDato("01.01.2024");
    // await opprettNySakPage.setTilDato("31.12.2024");
    await opprettNySakPage.setLand("Norge");

    await opprettNySakPage.klikkOpprettNyBehandling();

    // TODO: Vi forventer her en feilmelding om at fra-til dato mangler, men det er ikke implementert og kallet
    // går til backend som returnerer en feil.

    await runAxeAnalyze(page, testInfo.title);
  });

  test('Opprett sak for sakstype "EU/EØS-land", sakstema "Medlemsskap og lovvalg", uten å velge land og verifiser at det ikke oppstår noen feil', async ({
    page,
  }, testInfo) => {
    await setupOpprettNySakTester(page);
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await expect(opprettNySakPage.page.locator("select[name='sakstype']")).toBeVisible();

    await opprettNySakPage.velgSakstype("EU/EØS-land");
    await opprettNySakPage.velgSakstema();
    await opprettNySakPage.velgBehandlingstema();
    await opprettNySakPage.velgBehandlingstype();
    await opprettNySakPage.velgBehandlingsaarsak();

    await opprettNySakPage.setFraDato("01.01.2024");
    await opprettNySakPage.setTilDato("31.12.2024");
    // await opprettNySakPage.setLand("Norge");

    await opprettNySakPage.klikkOpprettNyBehandling();

    // TODO: Vi forventer her en feilmelding om at land mangler, men det er ikke implementert
    await assertErrors(page, ["Velg minst ett land"]);

    await runAxeAnalyze(page, testInfo.title);
  });

  test('Opprett sak for sakstype "Avtaleland" og verifiser at det ikke oppstår noen feil', async ({
    page,
  }, testInfo) => {
    await setupOpprettNySakTester(page);
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await expect(opprettNySakPage.page.locator("select[name='sakstype']")).toBeVisible();

    await opprettNySakPage.velgSakstype("Avtaleland");
    await opprettNySakPage.velgSakstema();
    await opprettNySakPage.velgBehandlingstema();
    await opprettNySakPage.velgBehandlingstype();
    await opprettNySakPage.velgBehandlingsaarsak();

    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertNyBehandlingOpprettet(page);

    await runAxeAnalyze(page, testInfo.title);
  });

  test('Opprett sak for sakstype "Utenfor avtaleland" og verifiser at det ikke oppstår noen feil', async ({
    page,
  }, testInfo) => {
    await setupOpprettNySakTester(page);
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await expect(opprettNySakPage.page.locator("select[name='sakstype']")).toBeVisible();

    await opprettNySakPage.velgSakstype("Utenfor avtaleland");
    await opprettNySakPage.velgSakstema();
    await opprettNySakPage.velgBehandlingstema();
    await opprettNySakPage.velgBehandlingstype();
    await opprettNySakPage.velgBehandlingsaarsak();

    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertNyBehandlingOpprettet(page);

    await runAxeAnalyze(page, testInfo.title);
  });

  test('Opprett sak for sakstype "Utenfor avtaleland" med behandlingstype "Årsavregning" og verifiser at det ikke oppstår noen feil', async ({
    page,
  }, testInfo) => {
    await setupOpprettNySakTester(page);
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await expect(opprettNySakPage.page.locator("select[name='sakstype']")).toBeVisible();

    await opprettNySakPage.velgSakstype("Utenfor avtaleland");
    await opprettNySakPage.velgSakstema();
    await opprettNySakPage.velgBehandlingstema();
    await opprettNySakPage.velgBehandlingstype("Årsavregning");
    await opprettNySakPage.velgBehandlingsaarsak();

    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertNyBehandlingOpprettet(page);

    await runAxeAnalyze(page, testInfo.title);
  });
});

test.describe("'Opprett ny sak for virksomhet", () => {
  test.beforeEach(async ({ page }) => {
    await setupOpprettNySakTester(page);
  });

  test("Klikk på 'Opprett ny behandling' når påkrevede felt mangler og verifiser feilmeldinger", async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.velgVirksomhet();
    await opprettNySakPage.fyllInnOrganisasjonsnummer("123456789");
    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertFieldError(page, "Fant ingen navn på dette organisasjonsnummeret");

    await runAxeAnalyze(page, testInfo.title);
  });

  test('Opprett sak for sakstype "EU/EØS-land" og verifiser at det ikke oppstår noen feil', async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.velgVirksomhet();
    await opprettNySakPage.fyllInnOrganisasjonsnummer(ORG_NUMBER_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await expect(opprettNySakPage.page.locator("select[name='sakstype']")).toBeVisible();

    await opprettNySakPage.velgSakstype("EU/EØS-land");
    await opprettNySakPage.velgSakstema();
    await opprettNySakPage.velgBehandlingstema();
    await opprettNySakPage.velgBehandlingstype();
    await opprettNySakPage.velgBehandlingsaarsak();

    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertNyBehandlingOpprettet(page);

    await runAxeAnalyze(page, testInfo.title);
  });

  test('Opprett sak for sakstype "Avtaleland" og verifiser at det ikke oppstår noen feil', async ({
    page,
  }, testInfo) => {
    await opprettNySakPage.velgVirksomhet();
    await opprettNySakPage.fyllInnOrganisasjonsnummer(ORG_NUMBER_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await expect(opprettNySakPage.page.locator("select[name='sakstype']")).toBeVisible();

    await opprettNySakPage.velgSakstype("Avtaleland");
    await opprettNySakPage.velgSakstema();
    await opprettNySakPage.velgBehandlingstema();
    await opprettNySakPage.velgBehandlingstype();
    await opprettNySakPage.velgBehandlingsaarsak();

    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertNyBehandlingOpprettet(page);

    await runAxeAnalyze(page, testInfo.title);
  });
});
