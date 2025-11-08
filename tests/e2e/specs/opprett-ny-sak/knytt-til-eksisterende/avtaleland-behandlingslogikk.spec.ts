import { expect, test } from "@playwright/test";
import { runAxeAnalyze } from "../../../utils/axeUtils";
import { HovedsidePage, USER_ID_VALID } from "../../../pages/hovedside.page";
import { OpprettNySakPage } from "../../../pages/opprett-ny-sak/opprett-ny-sak.page";
import { getSaksnummerFraLocator, getSaksnummerFraUrl, TIMEOUT_FOR_COMPLEX_TESTS } from "../../../utils/testUtils";
import { opprettAvtalelandSak, PREPOPULATED_SAKER } from "../../../utils/testdataUtils";
import { BehandlingPage } from "../../../pages/behandling/behandling.page";

/**
 * MELOSYS-7385: Test regresjonstest for Avtaleland-saker
 *
 * Regresjonstest akseptansekriterium:
 * "Gitt at jeg skal opprette en behandling på en eksistrende sakstype EØS/AVTALELAND
 * skal det kun være 1 aktiv behandling i saken, og det er ikke mulig å opprette flere behandlinger hvis det er en åpen behandling i saken.
 * Det forventes da en gul varselmelding om det. Dersom behandlingen ble avsluttet som HENLAGT skal man fortsatt få gul varselmelding om det.
 * Dersom alle behandlingene er avsluttet i saken (ferdigbehandlet med vedtak), skal det være mulig å opprette NY_VURDERING eller HENVENDELSE."
 */
test.describe("Avtaleland behandlingslogikk (regresjon)", () => {
  let opprettNySakPage: OpprettNySakPage;

  test.beforeEach(async ({ page }) => {
    const mainPage = new HovedsidePage(page);
    opprettNySakPage = new OpprettNySakPage(page);

    await mainPage.goto();

    await mainPage.klikkOpprettNySakKnapp();
  });

  test("Regresjon: Avtaleland med åpen behandling - viser varselmelding", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    // Bruk prepopulert Avtaleland-sak
    const sakId = PREPOPULATED_SAKER.AVTALELAND_YRKESAKTIV;

    const hovedsidePage = new HovedsidePage(page);
    await hovedsidePage.goto();
    await hovedsidePage.klikkOpprettNySakKnapp();

    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);
    await valgtSak.click();

    // === REGRESJONSTEST ===
    // Gul varselmelding skal vises for Avtaleland-sak med åpen behandling
    const feilmelding = "Du kan ikke opprette en ny behandling på eksisterende sak med en aktiv/pågående behandling";

    // Vent spesifikt på at feilmeldingen vises (ikke bare loading-panelet)
    await page.locator(".knyttTilSak__behandlingspanel").filter({ hasText: feilmelding }).waitFor({ state: "visible" });

    expect(
      await opprettNySakPage.harFeilmelding(feilmelding),
      `Gul varselmelding skal vises for Avtaleland-sak ${getSaksnummerFraLocator(valgtSak)} med åpen behandling`,
    ).toBe(true);

    // Behandlingstype-gruppen skal IKKE være synlig
    expect(await opprettNySakPage.erBehandlingstypeGruppeSynlig(), "Behandlingstype-gruppe skal ikke være synlig").toBe(
      false,
    );

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Regresjon: Avtaleland med henlagt søknad - viser varselmelding", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter og henlegger sak

    const behandlingPage = new BehandlingPage(page);

    // Hent URL til prepopulert Avtaleland-sak og naviger direkte dit
    const url = await opprettAvtalelandSak("MEL-1010");
    await behandlingPage.goto(url);

    const sakId = getSaksnummerFraUrl(page);
    await behandlingPage.avsluttBehandling("Søknaden/klagen er trukket", sakId);

    const hovedsidePage = new HovedsidePage(page);

    await hovedsidePage.goto();
    await hovedsidePage.klikkOpprettNySakKnapp();

    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);

    await valgtSak.click();

    // === REGRESJONSTEST ===
    // Gul varselmelding skal vises selv om behandling er henlagt
    // Note: Henlagt behandling kan vises som "Behandlingen er avsluttet" i UI
    // Vent på at feilmeldingspanelet vises (ikke bare loading-panelet)
    await page.locator(".knyttTilSak__behandlingspanel").waitFor({ state: "visible" });

    // Sjekk først om det er noen feilmelding i det hele tatt
    expect(
      await opprettNySakPage.harFeilmelding(),
      `En gul varselmelding skal vises for henlagt behandling på sak ${getSaksnummerFraLocator(valgtSak)}`,
    ).toBe(true);

    // Behandlingstype-gruppen skal IKKE være synlig når behandling er henlagt
    expect(
      await opprettNySakPage.erBehandlingstypeGruppeSynlig(),
      "Behandlingstype-gruppe skal ikke være synlig for henlagt behandling",
    ).toBe(false);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Regresjon: Avtaleland med ferdigbehandlede - Ny vurdering og Henvendelse tilgjengelig", async ({
    page,
  }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter og avslutter sak

    const behandlingPage = new BehandlingPage(page);

    // Hent URL til prepopulert Avtaleland-sak og naviger direkte dit
    const url = await opprettAvtalelandSak("MEL-1011");
    await behandlingPage.goto(url);

    const sakId = getSaksnummerFraUrl(page);
    await behandlingPage.avsluttBehandling("Søknaden er innvilget", sakId);

    const hovedsidePage = new HovedsidePage(page);

    await hovedsidePage.goto();
    await hovedsidePage.klikkOpprettNySakKnapp();

    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);
    await valgtSak.click();

    // === REGRESJONSTEST ===
    // Nye behandlingstyper skal være tilgjengelig for ferdigbehandlet Avtaleland-sak
    // Vent på at panelrammen med behandlingstyper vises (ikke bare loading-panelet)
    await page.locator(".knyttTilSak__panelramme").waitFor({ state: "visible" });

    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak, ["Ny vurdering", "Klage", "Henvendelse"]);

    expect(
      await opprettNySakPage.harFeilmelding(),
      `Ingen feilmelding skal vises for ferdigbehandlet Avtaleland-sak ${getSaksnummerFraLocator(valgtSak)}`,
    ).toBe(false);

    await runAxeAnalyze(page, testInfo.title);
  });
});
