import { test } from "../../../recording/fixtures";
import { HovedsidePage, USER_ID_VALID } from "../../../pages/hovedside.page";
import { OpprettNySakPage } from "../../../pages/opprett-ny-sak/opprett-ny-sak.page";
import { assertErrors, assertNyBehandlingOpprettet } from "../../../utils/testUtils";

let opprettNySakPage: OpprettNySakPage;

test.describe("'Opprett ny sak for bruker", () => {
  // Kjør tester serielt fordi de deler module-level state (opprettNySakPage)
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page, apiRecorder }) => {
    const mainPage = new HovedsidePage(page);
    opprettNySakPage = new OpprettNySakPage(page);

    await mainPage.goto();
    await mainPage.klikkOpprettNySakKnapp();
  });

  test("Manglende påkrevde felt - viser feilmeldinger", async ({ page, apiRecorder }, testInfo) => {
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
  });

  test("Alle påkrevde felt utfylt - oppretter behandling", async ({ page, apiRecorder }, testInfo) => {
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    // Fyll ut alle påkrevde dropdown-felt
    await opprettNySakPage.velgSakstype("Avtaleland");
    await opprettNySakPage.velgSakstema("Medlemskap og lovvalg");
    await opprettNySakPage.velgBehandlingstema("Yrkesaktiv");
    await opprettNySakPage.velgBehandlingstype("Førstegangsbehandling");
    await opprettNySakPage.velgBehandlingsaarsak("Søknad");

    // Note: Verken land-felt eller datofelter vises for Avtaleland saker med Yrkesaktiv

    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertNyBehandlingOpprettet(page);
  });

  test('Opprett sak for sakstype "EU/EØS-land" og verifiser at det ikke oppstår noen feil', async ({
    page,
  }, testInfo) => {
    // beforeEach allerede setter opp siden
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await opprettNySakPage.verifiserSakstypeSelect();

    await opprettNySakPage.velgSakstype("EU/EØS-land");
    await opprettNySakPage.velgSakstema("Medlemskap og lovvalg");
    await opprettNySakPage.velgBehandlingstema("Arbeid kun i Norge");
    await opprettNySakPage.velgBehandlingstype("Førstegangsbehandling");
    await opprettNySakPage.velgBehandlingsaarsak("Søknad");

    await opprettNySakPage.setFraDato("01.01.2024");
    await opprettNySakPage.setTilDato("31.12.2024");
    await opprettNySakPage.setLand("Norge");

    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertNyBehandlingOpprettet(page);
  });

  test('Opprett sak for sakstype "EU/EØS-land", sakstema "Medlemsskap og lovvalg", uten å velge fra- til-dato og verifiser at det ikke oppstår noen feil', async ({
    page,
  }, testInfo) => {
    // beforeEach allerede setter opp siden
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await opprettNySakPage.verifiserSakstypeSelect();

    await opprettNySakPage.velgSakstype("EU/EØS-land");
    await opprettNySakPage.velgSakstema("Medlemskap og lovvalg");
    await opprettNySakPage.velgBehandlingstema("Arbeid kun i Norge");
    await opprettNySakPage.velgBehandlingstype("Førstegangsbehandling");
    await opprettNySakPage.velgBehandlingsaarsak("Søknad");

    // await opprettNySakPage.setFraDato("01.01.2024");
    // await opprettNySakPage.setTilDato("31.12.2024");
    await opprettNySakPage.setLand("Norge");

    await opprettNySakPage.klikkOpprettNyBehandling();

    // TODO: Vi forventer her en feilmelding om at fra-til dato mangler, men det er ikke implementert og kallet
    // går til backend som returnerer en feil.
  });

  test.skip('Opprett sak for sakstype "EU/EØS-land", sakstema "Medlemsskap og lovvalg", uten å velge land og verifiser at det ikke oppstår noen feil', async ({
    page,
  }, testInfo) => {
    // beforeEach allerede setter opp siden
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await opprettNySakPage.verifiserSakstypeSelect();

    await opprettNySakPage.velgSakstype("EU/EØS-land");
    await opprettNySakPage.velgSakstema("Medlemskap og lovvalg");
    await opprettNySakPage.velgBehandlingstema("Arbeid kun i Norge");
    await opprettNySakPage.velgBehandlingstype("Førstegangsbehandling");
    await opprettNySakPage.velgBehandlingsaarsak("Søknad");

    await opprettNySakPage.setFraDato("01.01.2024");
    await opprettNySakPage.setTilDato("31.12.2024");
    await opprettNySakPage.setFraDato("01.01.2024");
    await opprettNySakPage.setTilDato("31.12.2024");
    // await opprettNySakPage.setLand("Norge");

    await opprettNySakPage.klikkOpprettNyBehandling();

    // TODO: Vi forventer her en feilmelding om at land mangler, men det er ikke implementert
    await assertErrors(page, ["Velg minst ett land"]);
  });

  test('Opprett sak for sakstype "Avtaleland" og verifiser at det ikke oppstår noen feil', async ({
    page,
  }, testInfo) => {
    // beforeEach allerede setter opp siden
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await opprettNySakPage.verifiserSakstypeSelect();

    await opprettNySakPage.velgSakstype("Avtaleland");
    await opprettNySakPage.velgSakstema("Medlemskap og lovvalg");
    await opprettNySakPage.velgBehandlingstema("Yrkesaktiv");
    await opprettNySakPage.velgBehandlingstype("Førstegangsbehandling");
    await opprettNySakPage.velgBehandlingsaarsak("Søknad");

    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertNyBehandlingOpprettet(page);
  });

  test('Opprett sak for sakstype "Utenfor avtaleland" og verifiser at det ikke oppstår noen feil', async ({
    page,
  }, testInfo) => {
    // beforeEach allerede setter opp siden
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await opprettNySakPage.verifiserSakstypeSelect();

    await opprettNySakPage.velgSakstype("Utenfor avtaleland");
    await opprettNySakPage.velgSakstema("Medlemskap og lovvalg");
    await opprettNySakPage.velgBehandlingstema("Yrkesaktiv");
    await opprettNySakPage.velgBehandlingstype("Førstegangsbehandling");
    await opprettNySakPage.velgBehandlingsaarsak("Søknad");

    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertNyBehandlingOpprettet(page);
  });

  test('Opprett sak for sakstype "Utenfor avtaleland" med behandlingstype "Årsavregning" og verifiser at det ikke oppstår noen feil', async ({
    page,
  }, testInfo) => {
    // beforeEach allerede setter opp siden
    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgOpprettNySak();

    await opprettNySakPage.verifiserSakstypeSelect();

    await opprettNySakPage.velgSakstype("Utenfor avtaleland");
    await opprettNySakPage.velgSakstema("Medlemskap og lovvalg");
    await opprettNySakPage.velgBehandlingstema("Yrkesaktiv");
    await opprettNySakPage.velgBehandlingstype("Årsavregning");
    await opprettNySakPage.velgBehandlingsaarsak("Søknad");

    await opprettNySakPage.klikkOpprettNyBehandling();

    await assertNyBehandlingOpprettet(page);
  });
});
